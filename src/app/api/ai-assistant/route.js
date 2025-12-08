import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    // Using your hardcoded key for the test
    const apiKey = "AIzaSyCgKHhUYBGR9M9wnKVlGTJ7P1ws5IkGPDk";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Fetch the list of models available to YOUR key
    const modelResponse = await genAI.listModels();
    
    // Filter for models that support "generateContent"
    const availableModels = modelResponse.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name);

    return NextResponse.json({ 
      success: true, 
      availableModels: availableModels 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}