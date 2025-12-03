// src/app/api/jobs/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

/**
 * GET /api/jobs
 * Query:
 *  - sector (optional)
 *  - page (default 1)
 *  - limit (default 30)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const sector = searchParams.get("sector");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);

    const jobsCollection = await getCollection("jobs");

    const query = {};
    if (sector && sector !== "all") {
      query.sector = sector;
    }

    const skip = (page - 1) * limit;

    const [total, jobs] = await Promise.all([
      jobsCollection.countDocuments(query),
      jobsCollection
        .find(query)
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const cleanJobs = jobs.map((job) => ({
      ...job,
      _id: job._id.toString(),
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      { jobs: cleanJobs, total, page, totalPages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Body (from company job post form):
 * {
 *   title,
 *   sector,
 *   type,
 *   location,
 *   jobTime,
 *   jobVacancy,
 *   description,
 *   salary: { min, max, currency },
 *   company,
 *   companyEmail,
 *   postedByUid,
 *   postedByEmail
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      sector,
      type,
      location,
      jobTime,
      jobVacancy,
      description,
      salary,
      company,
      companyEmail,
      postedByUid,
      postedByEmail,
    } = body || {};

    // Basic validation
    if (!title || !sector || !type || !location || !description) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Vacancy required + > 0
    if (!jobVacancy || Number(jobVacancy) <= 0) {
      return NextResponse.json(
        { message: "Job vacancy must be at least 1." },
        { status: 400 }
      );
    }

    const jobsCollection = await getCollection("jobs");

    // Generate next job id: JOB-001, JOB-002, ...
    const lastJob = await jobsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (lastJob.length > 0 && lastJob[0].id) {
      const match = String(lastJob[0].id).match(/JOB-(\d+)/);
      if (match && match[1]) {
        nextNumber = Number(match[1]) + 1;
      }
    }
    const jobId = `JOB-${String(nextNumber).padStart(3, "3")}`; // JOB-001, JOB-002

    const now = new Date();

    const salaryObj = salary || {};
    const doc = {
      id: jobId,
      title,
      company: company || null,
      companyEmail: companyEmail || null,
      sector,
      type,
      location,
      jobTime: jobTime || null,
      jobVacancy: Number(jobVacancy),
      description,
      salary: {
        min:
          salaryObj.min !== undefined && salaryObj.min !== null
            ? Number(salaryObj.min)
            : null,
        max:
          salaryObj.max !== undefined && salaryObj.max !== null
            ? Number(salaryObj.max)
            : null,
        currency: salaryObj.currency || "BDT",
      },
      postedDate: now,
      postedByUid: postedByUid || null,
      postedByEmail: postedByEmail || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await jobsCollection.insertOne(doc);

    return NextResponse.json(
      {
        message: "Job created successfully.",
        _id: result.insertedId,
        id: jobId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
