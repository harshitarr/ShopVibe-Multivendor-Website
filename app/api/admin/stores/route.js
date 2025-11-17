import authAdmin from '@/middlewares/authAdmin';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Store from '@/lib/models/Store';


// get all approved stores
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const stores = await Store.find({
      status:'approved'
    })
    .populate('userId')
    .lean();

    return NextResponse.json({ stores });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
