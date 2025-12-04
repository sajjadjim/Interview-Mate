// src/app/api/company/shortlist/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

/**
 * POST /api/company/shortlist
 *
 * Body: { companyEmail, application }
 *  - companyEmail: string (the logged-in company user email)
 *  - application: full users_jobs_application document
 *
 * Saves a snapshot of the application into `cv_shortListed_database`.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { companyEmail, application } = body || {};

    if (!companyEmail || !application) {
      return NextResponse.json(
        { message: "companyEmail and application are required." },
        { status: 400 }
      );
    }

    const shortlistCollection = await getCollection("cv_shortListed_database");

    const appIdRaw = application._id || application.id;
    if (!appIdRaw) {
      return NextResponse.json(
        { message: "application._id or application.id is required." },
        { status: 400 }
      );
    }

    const applicationId =
      typeof appIdRaw === "string" ? appIdRaw : appIdRaw.toString();

    // Avoid duplicate shortlist entries for the same application + company
    const existing = await shortlistCollection.findOne({
      companyEmail,
      applicationId,
    });

    if (existing) {
      return NextResponse.json(
        { message: "This candidate is already shortlisted." },
        { status: 409 }
      );
    }

    const now = new Date();

    const doc = {
      companyEmail,
      companyName: application.company || "",
      jobId: application.jobId || "",
      jobTitle: application.jobTitle || "",
      jobSector: application.sector || "",
      jobType: application.type || "",
      jobLocation: application.location || "",
      salary: application.salary || null,

      candidateUid: application.candidateUid || "",
      candidateEmail: application.candidateEmail || "",
      candidateName: application.candidateName || "",
      candidatePhone: application.candidatePhone || "",
      candidateAddress: application.candidateAddress || "",
      resumeUrl: application.resumeUrl || "",
      status: application.status || "shortlisted",

      appliedAt: application.appliedAt || application.createdAt || null,
      shortlistedAt: now,

      applicationId, // link back to users_jobs_application
      createdAt: now,
      updatedAt: now,
    };

    const result = await shortlistCollection.insertOne(doc);

    return NextResponse.json(
      {
        message: "Candidate shortlisted successfully.",
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/company/shortlist:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/company/shortlist
 *
 * Query:
 *  - email (or companyEmail): company user email
 *  - page (optional, default 1)
 *  - limit (optional, default 10)
 *
 * Returns shortlisted candidates from `cv_shortListed_database`, filtered by
 * company email, sorted by jobSector (A–Z) then newest shortlisted first.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email =
      searchParams.get("email") || searchParams.get("companyEmail");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    if (!email) {
      return NextResponse.json(
        { message: "email (company email) is required" },
        { status: 400 }
      );
    }

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit =
      Number.isNaN(limitParam) || limitParam < 1 || limitParam > 100
        ? 10
        : limitParam;
    const skip = (page - 1) * limit;

    const shortlistCollection = await getCollection("cv_shortListed_database");

    const filter = { companyEmail: email };

    const totalShortlisted = await shortlistCollection.countDocuments(filter);

    const cursor = shortlistCollection
      .find(filter)
      .sort({ jobSector: 1, shortlistedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const docs = await cursor.toArray();

    const shortlisted = docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    const totalPages = Math.max(1, Math.ceil(totalShortlisted / limit));

    return NextResponse.json(
      {
        shortlisted,
        totalShortlisted,
        page,
        limit,
        totalPages,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/company/shortlist:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
