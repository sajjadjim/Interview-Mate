import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect"; // Assuming you have this helper
// If you use Mongoose directly, import dbConnect and the Model instead.
import Review from "@/models/Review";
import mongoose from "mongoose";

// Connection helper (if you don't have one in @/lib/dbConnect)
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}

export async function GET() {
  try {
    await connectDB();
    // Fetch only approved reviews, sort by newest
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.comment || !body.rating) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const newReview = await Review.create(body);
    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}