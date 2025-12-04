// src/app/api/users-jobs-application/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// POST /api/users-jobs-application
// body: job + candidate info
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

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
      appliedAt,
    } = body;

    if (!jobId || !candidateUid || !candidateEmail) {
      return NextResponse.json(
        { message: "jobId, candidateUid and candidateEmail are required" },
        { status: 400 }
      );
    }

    const col = await getCollection("users_jobs_application");

    // Check duplicate (candidate already applied to this job)
    const existing = await col.findOne({ jobId, candidateUid });
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
      salary,
      postedDate: postedDate ? new Date(postedDate) : null,
      jobVacancy,
      jobTime,
      jobAddress,
      jobDeadline: jobDeadline ? new Date(jobDeadline) : null,

      candidateUid,
      candidateEmail,
      candidateName,
      candidatePhone,
      candidateAddress: candidateAddress || null,
      resumeUrl: resumeUrl || null,

      status: "submitted",
      appliedAt: appliedAt ? new Date(appliedAt) : now,

      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);

    return NextResponse.json(
      { ok: true, id: result.insertedId.toString() },
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

// GET /api/users-jobs-application
// - use ?candidateUid=...&jobId=... to check one
// - or you may extend for list queries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateUid = searchParams.get("candidateUid");
    const jobId = searchParams.get("jobId");

    const col = await getCollection("users_jobs_application");

    if (candidateUid && jobId) {
      const docs = await col
        .find({ candidateUid, jobId })
        .sort({ createdAt: -1 })
        .toArray();

      const safe = docs.map((d) => ({
        ...d,
        _id: d._id.toString(),
      }));

      return NextResponse.json(safe, { status: 200 });
    }

    // Default: return empty array or customize as needed
    return NextResponse.json([], { status: 200 });
  } catch (err) {
    console.error("GET /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users-jobs-application?applicationId=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { message: "applicationId is required" },
        { status: 400 }
      );
    }

    const col = await getCollection("users_jobs_application");

    const result = await col.deleteOne({
      _id: new ObjectId(applicationId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
