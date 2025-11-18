import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";
import { inngest } from "@/inngest/client";

// ADD NEW COUPON (POST)
export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await request.json();
    const coupon = { ...body.coupon };

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon details" }, { status: 400 });
    }

    if (!coupon.code || !coupon.discount || !coupon.description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Ensure uppercase code
    coupon.code = coupon.code.toUpperCase();

    // REQUIRED: Schema demands manual _id assignment
    coupon._id = coupon.code;

    // Validate and convert date
    coupon.expiresAt = new Date(coupon.expiresAt);
    if (isNaN(coupon.expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
    }

    // Create coupon
    const createdCoupon = await Coupon.create(coupon);

    // Schedule coupon expiry event with Inngest
    await inngest.send({
      name: 'app/coupon.expired',
      data: {
        code: createdCoupon.code,
        expires_at: createdCoupon.expiresAt,
      },
    });

    return NextResponse.json({ message: "Coupon added successfully" });

  } catch (error) {
    console.error("POST /coupon error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

// DELETE COUPON (DELETE)
export async function DELETE(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const deleted = await Coupon.findOneAndDelete({
      _id: code.toUpperCase(),
    });

    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" });

  } catch (error) {
    console.error("DELETE /coupon error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

// GET ALL COUPONS (GET)
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ coupons });

  } catch (error) {
    console.error("GET /coupons error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
