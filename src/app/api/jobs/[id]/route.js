// src/app/api/jobs/[id]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const jobsCollection = await getCollection("jobs");

    // Try match by your custom id field first
    let job = await jobsCollection.findOne({ id });

    // If not found, try by Mongo ObjectId
    if (!job && ObjectId.isValid(id)) {
      job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    job._id = job._id.toString();

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
