// Edit product details
export async function PUT(request) {
    try {
        await dbConnect();
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ error: 'No user ID' }, { status: 401 });
        const storeId = await authSeller(userId);
        if (!storeId) return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        const body = await request.json();
        const { productId, name, description, mrp, price } = body;
        if (!productId || !name || !description || !mrp || !price) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const updated = await Product.findOneAndUpdate(
            { _id: productId, storeId },
            { name, description, mrp, price },
            { new: true }
        );
        if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json({ message: 'Product updated', product: updated });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
import authSeller from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import ImageKit from "imagekit"

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

// Add a new product
export async function POST(request) {
    try {
        await dbConnect()

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

        // Get the data from the form
        const formData = await request.formData()
        const name = formData.get('name')
        const description = formData.get('description')
        const mrp = Number(formData.get('mrp'))
        const price = Number(formData.get('price'))
        const category = formData.get('category')
        const images = formData.getAll('images') // Multiple images

        if (!name || !description || !mrp || !price || !category || images.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Uploading images to ImageKit
        const imagesUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer())
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products",
            })

            const url = imagekit.url({
                path: response.filePath,  // Fixed: filePath not filepath
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1024' }
                ]
            })

            return url
        }))

        // Create product with Mongoose
        await Product.create({
            name,
            description,
            mrp,
            price,
            category,
            images: imagesUrl,
            storeId
        })

        return NextResponse.json({ message: "Product added successfully" })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ 
            error: error.code || error.message 
        }, { status: 500 })
    }
}

// Get all products for a seller
export async function GET(request) {
    try {
        await dbConnect()

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

        const products = await Product.find({ storeId: storeId }).lean()

        return NextResponse.json({ products })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ 
            error: error.code || error.message 
        }, { status: 500 })
    }
}
