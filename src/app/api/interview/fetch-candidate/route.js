import { getCollection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
 // Using your existing helper

export async function POST(request) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({ success: false, message: "Room ID is required" }, { status: 400 });
    }

    // 1. Get your existing collection
    const candidateCollection = await getCollection("Interviews_Candidate");

    // 2. Find the student where applicationId matches the Room ID
    const candidate = await candidateCollection.findOne({ applicationId: roomId });

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found with this Room ID" }, { status: 404 });
    }

    // 3. Return necessary details
    return NextResponse.json({ 
      success: true, 
      data: {
        applicationId: candidate.applicationId,
        applicantName: candidate.applicantName,
        applicantEmail: candidate.applicantEmail,
        topic: candidate.topic || "General"
      }
    });

  } catch (error) {
    console.error("Fetch Candidate Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}