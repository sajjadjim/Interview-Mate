// src/app/api/users-jobs-application/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

/**
 * GET /api/users-jobs-application
 *
 * Query params:
 *  - candidateUid      (for "my applications" page)
 *  - candidateEmail    (alternative filter, also used by "my applications")
 *  - jobId             (for "did I already apply to this job?" check)
 *
 * Behavior:
 *  - If jobId + candidateUid → filter { jobId, candidateUid }
 *  - Else if candidateUid or candidateEmail → filter with $or
 *  - Else → return []
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateUid = searchParams.get("candidateUid");
    const candidateEmail = searchParams.get("candidateEmail");
    const jobId = searchParams.get("jobId");

    const applicationsCollection = await getCollection(
      "users_jobs_application"
    );

    // Build filter
    let filter = {};

    // Case 1: check one specific job for a specific candidate
    if (jobId && candidateUid) {
      filter = { jobId, candidateUid };
    }
    // Case 2: list all apps for a candidate (by uid/email) – used by My Applications page
    else if (candidateUid || candidateEmail) {
      const or = [];
      if (candidateUid) or.push({ candidateUid });
      if (candidateEmail) or.push({ candidateEmail });
      filter = { $or: or };

      // If jobId also given, optionally narrow by jobId as well:
      if (jobId) {
        filter.jobId = jobId;
      }
    } else {
      // No filter: we DO NOT want to return entire collection → return empty array
      return NextResponse.json([], { status: 200 });
    }

    const docs = await applicationsCollection
      .find(filter)
      .sort({ appliedAt: -1, createdAt: -1 })
      .toArray();

    const safe = docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json(safe, { status: 200 });
  } catch (err) {
    console.error("GET /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users-jobs-application
 *
 * Body (what you're sending from JobDetails page):
 *  - jobId, jobTitle, company, sector, type, location
 *  - salary, postedDate, jobVacancy, jobTime, jobAddress, jobDeadline
 *  - candidateUid, candidateEmail, candidateName, candidatePhone
 *  - candidateAddress, resumeUrl
 *
 * Saves a new application with:
 *  - status: "submitted"
 *  - appliedAt, createdAt, updatedAt
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      jobId,
      jobTitle,
      company,
      sector,
      type,
      location,
      salary,
      postedDate,
      jobVacancy,
      jobTime,
      jobAddress,
      jobDeadline,
      candidateUid,
      candidateEmail,
      candidateName,
      candidatePhone,
      candidateAddress,
      resumeUrl,
    } = body;

    if (!jobId || !candidateUid || !candidateEmail) {
      return NextResponse.json(
        { message: "jobId, candidateUid and candidateEmail are required." },
        { status: 400 }
      );
    }

    const applicationsCollection = await getCollection(
      "users_jobs_application"
    );

    // Prevent duplicate application for same job+candidate
    const existing = await applicationsCollection.findOne({
      jobId,
      candidateUid,
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already applied for this job." },
        { status: 409 }
      );
    }

    const now = new Date();

    const doc = {
      jobId,
      jobTitle,
      company,
      sector,
      type,
      location,
      salary: salary || null,
      postedDate: postedDate ? new Date(postedDate) : null,
      jobVacancy:
        typeof jobVacancy === "number" ? jobVacancy : jobVacancy || null,
      jobTime: jobTime || null,
      jobAddress: jobAddress || null,
      jobDeadline: jobDeadline ? new Date(jobDeadline) : null,

      candidateUid,
      candidateEmail,
      candidateName: candidateName || null,
      candidatePhone: candidatePhone || null,
      candidateAddress: candidateAddress || null,
      resumeUrl: resumeUrl || null,

      status: "submitted",
      appliedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await applicationsCollection.insertOne(doc);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...doc },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
