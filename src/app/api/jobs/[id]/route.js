// src/app/api/jobs/[id]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

/**
 * GET /api/jobs/:id
 *
 * Tries to find job by:
 *  - custom id  (id: "JOB-004")
 *  - Mongo _id (ObjectId)
 */
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const jobsCollection = await getCollection("jobs");

    // 1) Try custom id
    let job = await jobsCollection.findOne({ id });

    // 2) Try Mongo ObjectId
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
