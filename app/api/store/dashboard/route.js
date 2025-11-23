import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Rating from "@/lib/models/Rating";
import User from "@/lib/models/User";

// Get Dashboard Data for Seller (total orders, total earnings, total products)
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Get all orders for this store
    const orders = await Order.find({ storeId: storeId }).lean();

    // Get all products for this store
    const products = await Product.find({ storeId: storeId }).lean();

    // Get product IDs
    const productIds = products.map(product => product._id.toString());

    // Get all ratings for these products with user and product details
    const ratings = await Rating.find({
      productId: { $in: productIds }
    })
    .populate('userId', 'name email image')  // Populate user details
    .populate('productId', 'name images')    // Populate product details
    .lean();

    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
      totalProducts: products.length,
    };

    return NextResponse.json({ dashboardData });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error.code || error.message 
    }, { status: 500 });
  }
}
