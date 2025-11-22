import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Rating from "@/lib/models/Rating"; // Import Rating model to register it
import User from "@/lib/models/User"; // Import User model for population
import Store from "@/lib/models/Store"; // Import Store model for population
import { NextResponse } from "next/server";


export async function GET(request) {
    try {
        console.log('API: Starting product fetch...');
        await dbConnect();
        console.log('API: Database connected successfully');

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        console.log('API: ProductId parameter:', productId);

        // If productId is provided, fetch single product
        if (productId) {
            console.log('API: Fetching single product...');
            const product = await Product.findById(productId)
                .populate('storeId', 'name username logo isActive')
                .lean();

            if (!product) {
                console.log('API: Product not found');
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            // Check if store is active
            if (!product.storeId?.isActive) {
                console.log('API: Product store is not active');
                return NextResponse.json({ error: 'Product not available' }, { status: 404 });
            }

            // Manually fetch ratings for this product
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
            
            // Add rating data to product
            product.ratings = ratings;
            product.avgRating = Math.round(avgRating * 2) / 2;
            product.totalRatings = ratings.length;

            console.log('API: Single product found successfully');
            return NextResponse.json({ success: true, product });
        }

        console.log('API: Fetching all products...');

        // Otherwise, fetch all products
        // First check all products in database
        const allProducts = await Product.find({}).populate('storeId', 'name username logo isActive').lean();
        console.log('Total products in database:', allProducts.length);
        console.log('Products details:', allProducts.map(p => ({ 
            name: p.name, 
            inStock: p.inStock, 
            storeActive: p.storeId?.isActive,
            storeId: p.storeId?._id 
        })));

        let products = await Product.find({}) // Remove inStock filter temporarily
            .populate('storeId', 'name username logo isActive')
            .sort({ createdAt: -1 })
            .lean();

        console.log('Products after inStock filter:', products.length);

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

        // Remove products with store isActive false
        // products = products.filter(product => product.storeId?.isActive === true); // Temporarily disabled
        console.log('Products after store active filter (disabled):', products.length);

        return NextResponse.json({ products });

    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        }, { status: 500 });
    }
}
