import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";
import Rating from "@/lib/models/Rating";

export async function GET(request) {
  try {
    await dbConnect();

    // Get store username from query params
    const searchParams = new URL(request.url).searchParams;
    const username = searchParams.get('username')?.toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "missing username" }, { status: 400 });
    }

    // Get store info
    const store = await Store.findOne({
      username: username,
      isActive: true
    }).lean();

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 });
    }

    // Get products with ratings for this store
    const products = await Product.find({
      storeId: store._id.toString()
    })
    .lean();

    // Manually fetch and calculate ratings for each product
    for (let product of products) {
      const ratings = await Rating.find({ productId: product._id.toString() })
        .populate({
          path: 'userId',
          select: 'name image'
        })
        .lean();
      
      // Calculate average rating
      const avgRating = ratings.length > 0
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
        : 0;
      
      // Add calculated rating data to product
      product.ratings = ratings;
      product.avgRating = Math.round(avgRating * 2) / 2; // Round to nearest 0.5
      product.totalRatings = ratings.length;
    }

    // Add products to store object
    const storeWithProducts = {
      ...store,
      Product: products
    };

    return NextResponse.json({ store: storeWithProducts });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error.code || error.message 
    }, { status: 500 });
  }
}
