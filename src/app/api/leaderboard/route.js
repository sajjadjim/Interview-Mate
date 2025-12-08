import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect"; // Your existing helper

export async function GET() {
  try {
    const collection = await getCollection("Leaderboard");

    // Fetch top 100 sorted by score (descending)
    const leaderboard = await collection
      .find({})
      .sort({ totalScoreAccumulated: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}