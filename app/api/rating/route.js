import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Rating from "@/lib/models/Rating";

// Add new rating
export async function POST(request) {
  try {
    await dbConnect();
    const { userId } = getAuth(request);
    const { orderId, productId, rating, review } = await request.json();

    // Check if order exists for this user
    const order = await Order.findOne({ _id: orderId, userId }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already rated
    const isAlreadyRated = await Rating.findOne({
      orderId,
      productId,
    }).lean();

    if (isAlreadyRated) {
      return NextResponse.json({ error: "Product already rated" }, { status: 400 });
    }

    // Create rating
    const response = await Rating.create({
      userId,
      orderId,
      productId,
      rating,
      review,
    });

    return NextResponse.json({ message: "Rating added successfully", rating: response });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Get all ratings for a user
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ratings = await Rating.find({ userId }).lean();

    return NextResponse.json({ ratings });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
