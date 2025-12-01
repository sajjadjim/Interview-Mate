import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      applicationId,
      applicantName,
      applicantEmail,
      date,
      timeSlot,
      topic,
      paymentStatus,
      approvalStatus,
      createdByEmail,
      createdByName,
    } = body;

    if (
      !applicationId ||
      !applicantName ||
      !applicantEmail ||
      !date ||
      !timeSlot ||
      !createdByEmail
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const interviewsCollection = await getCollection("Interviews_Candidate");

    // Prevent duplicate entry for the same application
    const existing = await interviewsCollection.findOne({ applicationId });

    if (existing) {
      return NextResponse.json(
        { message: "Interview already created for this applicant." },
        { status: 409 }
      );
    }

    const doc = {
      applicationId,
      applicantName,
      applicantEmail,
      date,
      timeSlot,
      topic: topic || "",
      paymentStatus: paymentStatus || "unpaid",
      approvalStatus: approvalStatus || "Not approved",
      createdByEmail,
      createdByName: createdByName || "",
      createdAt: new Date(),
    };

    const result = await interviewsCollection.insertOne(doc);

    return NextResponse.json(
      { ok: true, insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/interviews-candidate:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const interviewsCollection = await getCollection("Interviews_Candidate");

    const interviews = await interviewsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const clean = interviews.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(clean, { status: 200 });
  } catch (error) {
    console.error("Error fetching interview candidates:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
