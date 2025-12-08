import { getCollection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
 // Using your existing helper

export async function POST(request) {
  try {
    const body = await request.json();
    const { applicationId, applicantName, applicantEmail, questions, totalScore } = body;

    // --- 1. Store the Individual Interview Result ---
    const resultsCollection = await getCollection("InterviewResults");
    
    await resultsCollection.insertOne({
      applicationId,
      applicantName,
      applicantEmail,
      questions,
      totalScore,
      createdAt: new Date(), // Manually adding timestamp since not using Mongoose
    });

    // --- 2. Update the Leaderboard ---
    const leaderboardCollection = await getCollection("Leaderboard");

    // Logic: Find user by email. If exists, add score to total. If not, create new entry.
    await leaderboardCollection.updateOne(
      { applicantEmail: applicantEmail }, 
      { 
        $set: { 
            applicantName: applicantName,
            lastUpdated: new Date()
        },
        $inc: { 
            totalScoreAccumulated: totalScore, 
            interviewsCount: 1 
        } 
      },
      { upsert: true } // Creates the document if it doesn't exist
    );

    return NextResponse.json({ success: true, message: "Feedback saved & Leaderboard updated!" });

  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}