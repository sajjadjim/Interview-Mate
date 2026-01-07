import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Destructure the Interview Data
    const { 
      applicationId, 
      roomId, 
      candidateName, 
      candidateEmail, 
      interviewerEmail, 
      interviewerName, 
      score, 
      breakdown
    } = body;

    // 2. Validation
    if (score === undefined || score === null) {
      return NextResponse.json(
        { message: "Score is required" }, 
        { status: 400 }
      );
    }

    // 3. Save to History (Reviews Collection)
    // Using getCollection instead of Mongoose Model
    const reviewsCollection = await getCollection("Reviews");
    
    const newReview = {
      applicationId,
      roomId,
      candidateName,
      candidateEmail,
      interviewerName,
      interviewerEmail,
      score: Number(score),
      maxScore: 30,
      breakdown,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await reviewsCollection.insertOne(newReview);

    // 4. Update Leaderboard (Leaderboard Collection)
    const leaderboardCollection = await getCollection("Leaderboard");

    await leaderboardCollection.updateOne(
      { applicantEmail: candidateEmail }, // Find student by email
      {
        $inc: { 
            totalScoreAccumulated: Number(score), // Add new score to total
            interviewsCount: 1                    // Add 1 to interview count
        },
        $set: { 
            applicantName: candidateName,         // Update name
            lastUpdated: new Date()               // Update time
        }
      },
      { upsert: true } // Create if doesn't exist
    );

    return NextResponse.json(
      { 
        ok: true, 
        message: "Marks saved & Leaderboard updated!", 
        reviewId: insertResult.insertedId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}