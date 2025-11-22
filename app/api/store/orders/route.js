import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import User from "@/lib/models/User";
import Address from "@/lib/models/Address";

// Update seller order status
export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, storeId: storeId },
      { status: status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// Get all the orders for a seller
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await Order.find({ storeId: storeId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch order items, user data, and address data separately for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        // Fetch order items
        const rawOrderItems = await OrderItem.find({ orderId: order._id })
          .populate({
            path: 'productId',
            model: 'Product',
            select: 'name images _id price description'
          })
          .lean();

        // Transform order items to match expected frontend structure
        const orderItems = rawOrderItems.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          price: item.price,
          product: item.productId, // The populated product data
          productId: item.productId?._id // Just the product ID
        }));

        // Fetch user data using Clerk userId as _id
        const user = await User.findById(order.userId).lean();
        
        // Fetch address data
        const address = await Address.findById(order.addressId).lean();

        return {
          ...order,
          orderItems,
          user,
          address
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
