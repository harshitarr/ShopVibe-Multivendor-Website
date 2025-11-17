import authAdmin from '@/middlewares/authAdmin';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// Toggle Store isActive
export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is Missing' }, { status: 400 });
    }

    // Find the store
    const store = await Store.findById(storeId);

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Toggle isActive
    store.isActive = !store.isActive;
    await store.save();

    return NextResponse.json({ message: 'Store updated successfully' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
