import authAdmin from '@/middlewares/authAdmin';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Store from '@/lib/models/Store';
import User from '@/lib/models/User'; 


// Approve Seller
export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const { storeId, status } = await request.json();

    if (status === 'approved') {
      await Store.findByIdAndUpdate(storeId, {
        status: 'approved',
        isActive: true
      });
    } else if (status === 'rejected') {
      await Store.findByIdAndUpdate(storeId, {
        status: 'rejected'
      });
    }

    return NextResponse.json({
      message: `${status} Store status updated successfully`
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}


// Get all pending and rejected stores
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const stores = await Store.find({
      status: { $in: ["pending", "rejected"] }
    })
    .populate('userId')
    .lean();

    // Transform the data to match the expected structure in the component
    const transformedStores = stores.map(store => ({
      ...store,
      user: store.userId // Map userId to user for component compatibility
    }));

    return NextResponse.json({ stores: transformedStores });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
