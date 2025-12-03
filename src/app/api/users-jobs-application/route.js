// src/app/api/users-jobs-application/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

/**
 * POST /api/users-jobs-application
 *
 * Body expected from JobDetailsPage:
 * {
 *   jobId,
 *   jobTitle,
 *   company,
 *   sector,
 *   type,
 *   location,
 *   salary,        // { min, max, currency }
 *   postedDate,    // string or ISO
 *   candidateUid,
 *   candidateEmail,
 *   candidateName,
 *   candidatePhone
 * }
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
      candidateUid,
      candidateEmail,
      candidateName,
      candidatePhone,
    } = body || {};

    // Basic validation
    if (!jobId || !candidateUid || !candidateEmail) {
      return NextResponse.json(
        { message: "jobId, candidateUid and candidateEmail are required." },
        { status: 400 }
      );
    }

    const applicationsCollection = await getCollection(
      "users_jobs_application"
    );
    const notificationsCollection = await getCollection("notifications");

    // Avoid duplicate application for same job + same user
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
      jobTitle: jobTitle || null,
      company: company || null,
      sector: sector || null,
      type: type || null,
      location: location || null,
      salary: salary || null, // { min, max, currency }
      postedDate: postedDate ? new Date(postedDate) : null,

      candidateUid,
      candidateEmail,
      candidateName: candidateName || null,
      candidatePhone: candidatePhone || null,

      status: "submitted", // you can later change to 'shortlisted', etc.
      createdAt: now,
      updatedAt: now,
    };

    const result = await applicationsCollection.insertOne(doc);

    // Create a notification for this user
    await notificationsCollection.insertOne({
      userEmail: candidateEmail,
      title: "Job application submitted",
      message: `Your application for "${jobTitle || "a job"}"${
        company ? ` at ${company}` : ""
      } has been submitted.`,
      type: "job_application",
      link: "/application", // you can change to your own "My Applications" page
      read: false,
      createdAt: now,
    });

    return NextResponse.json(
      { ok: true, insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users-jobs-application
 *
 * Optional filters:
 *  - /api/users-jobs-application?candidateUid=...
 *  - /api/users-jobs-application?candidateEmail=...
 *  - /api/users-jobs-application?jobId=...
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateUid = searchParams.get("candidateUid");
    const candidateEmail = searchParams.get("candidateEmail");
    const jobId = searchParams.get("jobId");

    const collection = await getCollection("users_jobs_application");

    const query = {};
    if (candidateUid) query.candidateUid = candidateUid;
    if (candidateEmail) query.candidateEmail = candidateEmail;
    if (jobId) query.jobId = jobId;

    const applications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const clean = applications.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(clean, { status: 200 });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
