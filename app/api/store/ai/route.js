import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType){
    try {
        console.log("Calling OpenAI API...");
        
        const messages = [
            {
                "role": "system",
                "content":`
                        You are a product listing assistant for an e-commerce store.
                        Your job is to analyze an image of a product and generate
                        structured data.

                        Respond ONLY with raw JSON (no code block, no markdown, no
                        explanation).
                        The JSON must strictly follow this schema:
                    {
                        "name": string,  // Short product name
                        "description": string, // Marketing-friendly
                        description of the product
                    } `
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Analyze the image and generate a product name + description.",
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": `data:${mimeType};base64,${base64Image}`
                  },
                },
              ],
            }
        ];

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages,
        });

        console.log("OpenAI API response received");

        const raw = response.choices[0].message.content;

        console.log("Raw OpenAI response:", raw);

        // remove ```json or ``` wrapper if present
        const cleaned = raw.replace(/```json|```/g, "").trim();

        console.log("Cleaned response:", cleaned);

        let parsed;

        try {
            parsed = JSON.parse(cleaned);
            console.log("Successfully parsed JSON:", parsed);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Raw content that failed to parse:", cleaned);
            throw new Error("AI did not return valid JSON");
        }

        // Validate the response has required fields
        if (!parsed.name || !parsed.description) {
            console.error("Invalid response structure:", parsed);
            throw new Error("AI response missing required fields");
        }

        return parsed;
        
    } catch (error) {
        console.error("Error in main function:", error);
        if (error.message.includes("API key")) {
            throw new Error("OpenAI API key configuration issue");
        }
        throw error;
    }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      console.error("No userId found in request");
      return NextResponse.json({ error: 'No user ID' }, { status: 401 });
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      console.error("User is not authorized as seller:", userId);
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const body = await request.json();
    const { base64Image, mimeType } = body;
    
    if (!base64Image || !mimeType) {
      console.error("Missing base64Image or mimeType in request body");
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    console.log("Processing AI request for image analysis...");
    const result = await main(base64Image, mimeType);
    console.log("AI analysis successful:", result);
    
    return NextResponse.json({...result});
  } catch (error) {
    console.error("AI API Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: error.message || "AI analysis failed" 
    }, { status: 400 });
  }
}