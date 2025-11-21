import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update user cart
export async function POST(request) {
    try {
        await dbConnect();

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Safely parse the request body
        let cart;
        try {
            const body = await request.text();
            console.log('Raw request body:', body);
            
            if (!body || body.trim() === '') {
                return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
            }
            const parsedBody = JSON.parse(body);
            console.log('Parsed request body:', parsedBody);
            
            // The cart items should be the parsed body directly
            cart = parsedBody;
            
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
        }

        console.log('Final cart to save:', cart);

        // Validate cart data is an object
        if (typeof cart !== 'object' || cart === null || Array.isArray(cart)) {
            return NextResponse.json({ error: "Cart must be an object" }, { status: 400 });
        }

        // Save the cart to the user object
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { cart: cart },
            { new: true }
        );

        console.log('Cart saved successfully for user:', userId);
        console.log('Updated user cart:', updatedUser.cart);

        return NextResponse.json({ message: 'Cart updated successfully' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Get user cart
export async function GET(request) {
    try {
        await dbConnect();

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(userId).lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log('Fetching cart for user:', userId);
        console.log('User cart from database:', user.cart);

        // Handle nested cart structure (legacy fix)
        let cartData = user.cart || {};
        if (cartData.cart && typeof cartData.cart === 'object') {
            console.log('Found nested cart structure, flattening...');
            cartData = cartData.cart;
        }

        console.log('Final cart data to return:', cartData);
        return NextResponse.json({ cart: cartData });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
