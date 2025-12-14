import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk"; 

// Initialize Groq Client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function main(base64Image, mimeType) {
    try {
        console.log("Calling Groq Vision API...");

        const messages = [
            {
                role: "system",
                content: `You are a product listing assistant for an e-commerce store.
                Your job is to analyze an image of a product and generate structured data.
                
                Respond ONLY with raw JSON.
                The JSON must strictly follow this schema:
                {
                    "name": string, 
                    "description": string 
                }`
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Analyze the image and generate a product name + description.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`,
                        },
                    },
                ],
            },
        ];

        const response = await groq.chat.completions.create({
            
            model: process.env.GROQ_MODEL, 
            
            messages: messages,
            temperature: 0.1,
            max_tokens: 1024,
            response_format: { type: "json_object" }, 
        });

        console.log("Groq API response received");

        const raw = response.choices[0]?.message?.content || "{}";
        console.log("Raw Groq response:", raw);

        return JSON.parse(raw);

    } catch (error) {
        console.error("Error in main function:", error);
        throw error;
    }
}

// ... Keep your existing POST function below ...
export async function POST(request) {
    // (Paste your existing POST logic here)
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ error: 'No user ID' }, { status: 401 });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

        const body = await request.json();
        const { base64Image, mimeType } = body;

        if (!base64Image || !mimeType) {
            return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
        }

        const result = await main(base64Image, mimeType);
        return NextResponse.json({ ...result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}