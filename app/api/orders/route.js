import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Coupon from "@/lib/models/Coupon";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Address from "@/lib/models/Address";

// -----------------------------
// POST /api/order  -> create orders
// -----------------------------
export async function POST(request) {
  try {
    await dbConnect();

    const { userId, sessionClaims } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, items, couponCode, paymentMethod } = body || {};

    console.log("Order create request:", {
      userId,
      addressId,
      itemsLength: items?.length,
      couponCode,
      paymentMethod,
    });

    if (!addressId || !paymentMethod || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "missing required fields" }, { status: 400 });
    }

    // -----------------------------
    // COUPON VALIDATION
    // -----------------------------
    let coupon = null;
    if (couponCode) {
      const code = String(couponCode).toUpperCase();
      coupon = await Coupon.findOne({ code }).lean();

      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
      }

      // expired?
      if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }

      // active?
      const isActive =
        coupon.isActive === undefined ? true : Boolean(coupon.isActive);

      if (!isActive) {
        return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 });
      }

      // usage limit?
      const usageLimit = coupon.usageLimit || null;
      const usageCount = coupon.usageCount || 0;

      if (usageLimit && usageCount >= usageLimit) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }

      // new user only?
      if (coupon.forNewUser) {
        const count = await Order.countDocuments({ userId });
        if (count > 0) {
          return NextResponse.json({ error: "Coupon valid for new users only" }, { status: 400 });
        }
      }

      // members only?
      if (coupon.forMember) {
        const plan = sessionClaims?.plan;
        const pla = sessionClaims?.pla;

        const hasPlus =
          plan === "plus" ||
          (typeof pla === "string" && pla.includes("plus")) ||
          (Array.isArray(pla) && pla.includes("plus"));

        if (!hasPlus) {
          return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 });
        }
      }
    }

    // -----------------------------
    // GROUP ITEMS BY STORE
    // -----------------------------
    const groupedByStore = new Map();

    for (const it of items) {
      const productId =
        it.id ||
        it._id ||
        it.productId ||
        (it.product && it.product._id);

      if (!productId) {
        return NextResponse.json(
          { error: "Invalid item: missing product id" },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${productId}` },
          { status: 404 }
        );
      }

      const storeId = product.storeId || "default";

      if (!groupedByStore.has(storeId)) groupedByStore.set(storeId, []);
      groupedByStore.get(storeId).push({
        productId: product._id.toString(),
        quantity: it.quantity || 1,
        price: typeof it.price === "number" ? it.price : product.price || 0,
      });
    }

    // -----------------------------
    // CREATE ORDERS
    // -----------------------------
    let shippingAdded = false;
    const isPlusMember =
      sessionClaims?.plan === "plus" ||
      (typeof sessionClaims?.pla === "string" && sessionClaims.pla.includes("plus")) ||
      (Array.isArray(sessionClaims?.pla) && sessionClaims.pla.includes("plus"));

    const createdOrderIds = [];

    for (const [storeId, sellerItems] of groupedByStore.entries()) {
      let subtotal = sellerItems.reduce(
        (sum, s) => sum + s.price * (s.quantity || 1),
        0
      );

      // coupon discount
      if (coupon && typeof coupon.discount === "number") {
        subtotal -= (subtotal * coupon.discount) / 100;
      }

      // shipping fee (once per whole order, not per seller)
      if (!isPlusMember && !shippingAdded) {
        subtotal += 90;
        shippingAdded = true;
      }

      const roundedTotal = Math.round((subtotal + Number.EPSILON) * 100) / 100;

      // create order
      const order = await Order.create({
        userId,
        storeId,
        addressId,
        total: roundedTotal,
        paymentMethod,
        isCouponUsed: !!coupon,
        coupon: coupon
          ? {
              code: coupon.code,
              discount: coupon.discount,
              _id: coupon._id,
            }
          : {},
        status: "ORDER_PLACED",
        isPaid: paymentMethod === "STRIPE" ? false : true,
        createdAt: new Date(),
      });

      // create order items
      await Promise.all(
        sellerItems.map((si) =>
          OrderItem.create({
            orderId: order._id,
            productId: si.productId,
            quantity: si.quantity,
            price: si.price,
          })
        )
      );

      createdOrderIds.push(order._id.toString());
    }

    // update coupon usage count
    if (coupon) {
      await Coupon.updateOne(
        { _id: coupon._id },
        { $inc: { usageCount: 1 } }
      ).catch((err) => {
        console.warn("Failed to increment coupon usageCount:", err?.message);
      });
    }

    // clear cart
    await User.findByIdAndUpdate(userId, { cart: {} }).catch((err) => {
      console.warn("Failed to clear user cart:", err?.message);
    });

    return NextResponse.json(
      { message: "Order(s) created successfully", orders: createdOrderIds },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order POST error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// -----------------------------
// GET /api/order  -> fetch user's orders
// -----------------------------
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await Order.find({
      userId,
      $or: [
        { paymentMethod: "COD" },
        { paymentMethod: "STRIPE", isPaid: true },
      ],
    })
      .populate({ path: "addressId", model: "Address" })
      .sort({ createdAt: -1 })
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const rawItems = await OrderItem.find({ orderId: order._id })
          .populate({
            path: "productId",
            model: "Product",
            select: "name images _id price description",
          })
          .lean();

        const orderItems = rawItems.map((it) => {
          const product = it.productId || null;
          return {
            _id: it._id,
            product,
            productId: product ? product._id : it.productId,
            quantity: it.quantity,
            price: it.price,
          };
        });

        return {
          ...order,
          address: order.addressId || null,
          orderItems,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems }, { status: 200 });
  } catch (err) {
    console.error("Order GET error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
