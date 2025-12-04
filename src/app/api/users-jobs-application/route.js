// src/app/api/users-jobs-application/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";

/**
 * Helper: extract and verify Firebase ID token from request headers.
 * Returns { decodedToken } or a NextResponse error.
 */
async function requireFirebaseUser(req) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { decodedToken: null, error: NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    ) };
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseIdToken(token);

  if (!decodedToken) {
    return {
      decodedToken: null,
      error: NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  return { decodedToken, error: null };
}

/**
 * POST /api/users-jobs-application
 * Save a job application into "users_jobs_application".
 * 🔒 Protected by Firebase ID token.
 */
export async function POST(req) {
  try {
    // 1) Check auth
    const { decodedToken, error } = await requireFirebaseUser(req);
    if (error) return error;

    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    // 2) Parse body (only job info & optional name/phone from form)
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
      candidateName,
      candidatePhone,
    } = body || {};

    if (!jobId) {
      return NextResponse.json(
        { message: "jobId is required." },
        { status: 400 }
      );
    }

    // 3) DB connection
    await connectDB();
    const collection = mongoose.connection.collection("users_jobs_application");

    // 4) Prevent duplicate: same user + same job
    const existing = await collection.findOne({
      jobId,
      candidateUid: firebaseUid,
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
      salary: salary || null, // {min, max, currency}
      postedDate: postedDate ? new Date(postedDate) : null,

      // 🔐 from Firebase token (trusted)
      candidateUid: firebaseUid,
      candidateEmail: firebaseEmail,
      candidateName: candidateName || null,
      candidatePhone: candidatePhone || null,

      status: "submitted",
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
 * Example protected read:
 *   - candidate: see only their own applications
 *   - admin/HR (if you add role) could see more
 */
export async function GET(req) {
  try {
    const { decodedToken, error } = await requireFirebaseUser(req);
    if (error) return error;

    await connectDB();
    const collection = mongoose.connection.collection("users_jobs_application");

    // As a simple start: return only current user's applications
    const firebaseUid = decodedToken.uid;

    const applications = await collection
      .find({ candidateUid: firebaseUid })
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
