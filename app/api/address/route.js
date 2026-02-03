import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Address from "@/lib/models/Address"

// Add new address
export async function POST(request) {
    try {
        await dbConnect()

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const address = await request.json()

        address.userId = userId

        // Save the address to the user object
        const newAddress = await Address.create(address)

        return NextResponse.json({ newAddress, message: 'Address added successfully' })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        })
    }
}

// Get all addresses for a user
export async function GET(request) {
    try {
        await dbConnect()

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const addresses = await Address.find({ userId: userId }).lean()

        return NextResponse.json(addresses)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        })
    }
}
