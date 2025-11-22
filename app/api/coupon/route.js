import dbConnect from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";
import Order from "@/lib/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// -----------------------------
// POST /api/coupon  -> validate coupon
// -----------------------------
export async function POST(request) {
  try {
    await dbConnect();

    const { userId, sessionClaims } = getAuth(request);
    const { code } = await request.json();

    console.log("Coupon validation request:", {
      userId,
      code,
      sessionClaims,
    });

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code required" },
        { status: 400 }
      );
    }

    const couponCode = code.toUpperCase();

    // Find coupon
    const coupon = await Coupon.findOne({ code: couponCode }).lean();

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    console.log("Found coupon:", coupon);

    // Expired check
    if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
      console.log("Coupon expired:", coupon.expiresAt);
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Active check
    const isActive =
      coupon.isActive === undefined ? true : Boolean(coupon.isActive);

    if (!isActive) {
      console.log("Coupon is not active");
      return NextResponse.json(
        { error: "Coupon is no longer active" },
        { status: 400 }
      );
    }

    // Usage limit check
    const usageLimit = coupon.usageLimit || null;
    const usageCount = coupon.usageCount || 0;

    if (usageLimit && usageCount >= usageLimit) {
      console.log("Coupon usage limit reached");
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Must be logged in
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to apply this coupon" },
        { status: 401 }
      );
    }

    // New user only
    if (coupon.forNewUser) {
      const orderCount = await Order.countDocuments({ userId });
      console.log("New user check:", { orderCount });

      if (orderCount > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users only" },
          { status: 400 }
        );
      }
    }

    // Members only check
    if (coupon.forMember) {
      const plan = sessionClaims?.plan;
      const pla = sessionClaims?.pla;

      // works for string or array
      const plaIncludesPlus =
        Array.isArray(pla) ? pla.includes("plus") : pla === "u:plus";

      const isPlus =
        plan === "plus" ||
        plaIncludesPlus ||
        (typeof pla === "string" && pla.includes("plus"));

      console.log("Member check:", { plan, pla, isPlus });

      if (!isPlus) {
        return NextResponse.json(
          { error: "Coupon valid for members only" },
          { status: 400 }
        );
      }
    }

    // Validation success
    console.log("Coupon validation successful");
    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error("Error verifying coupon:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
