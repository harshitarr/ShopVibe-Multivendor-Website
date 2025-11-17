import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get Dashboard Data for Admin (total orders, total stores, total products, total revenue)

export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    // Get total orders
    const orders = await Order.countDocuments();

    // Get total stores
    const stores = await Store.countDocuments();

    // Get all orders - include only createdAt and total
    const allOrders = await Order.find({}, { createdAt: 1, total: 1, _id: 0 }).lean();

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      totalRevenue += order.total;
    });

    const revenue = totalRevenue.toFixed(2);

    // Total products on app
    const products = await Product.countDocuments();

    const dashboardData = {
      orders,
      stores,
      products,
      revenue,
      allOrders
    };

    return NextResponse.json({ dashboardData });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
