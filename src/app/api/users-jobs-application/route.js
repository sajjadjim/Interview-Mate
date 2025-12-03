// src/app/api/users-jobs-application/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

/**
 * POST /api/users-jobs-application
 *
 * Stores a job application into the "users_jobs_application" collection.
 * Called from the JobDetailsPage "Apply Now" button.
 */
export async function POST(req) {
  try {
    const body = await req.json();

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

    // Connect to Mongo (Mongoose)
    await connectDB();

    // Use native collection from mongoose connection
    const collection = mongoose.connection.collection("users_jobs_application");

    // Prevent duplicate application for the same job by same user
    const existing = await collection.findOne({
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

      status: "submitted", // you can later change: submitted / shortlisted / rejected etc.
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      {
        message: "Application created successfully.",
        _id: result.insertedId,
        application: doc,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users-jobs-application
 *
 * Optional helper:
 * - /api/users-jobs-application?candidateUid=xxx
 * - /api/users-jobs-application?candidateEmail=xxx
 * - /api/users-jobs-application?jobId=xxx
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const candidateUid = searchParams.get("candidateUid");
    const candidateEmail = searchParams.get("candidateEmail");
    const jobId = searchParams.get("jobId");

    const collection = mongoose.connection.collection("users_jobs_application");

    const query = {};
    if (candidateUid) query.candidateUid = candidateUid;
    if (candidateEmail) query.candidateEmail = candidateEmail;
    if (jobId) query.jobId = jobId;

    const applications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications, { status: 200 });
  } catch (err) {
    console.error("GET /api/users-jobs-application error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
