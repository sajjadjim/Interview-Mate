// src/app/api/jobs/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

// Allowed sectors for validation
const ALLOWED_SECTORS = ["IT Sector", "Management", "Education", "Commercial"];

/**
 * GET /api/jobs
 *
 * Query params:
 *  - sector (optional) → e.g. "IT Sector", "Management", "all"
 *  - page   (optional) → default 1
 *  - limit  (optional) → default 30
 *
 * Returns only *active* jobs:
 *  - jobs with deadline >= now
 *  - or jobs without deadline (older data)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const sector = searchParams.get("sector");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);

    const jobsCollection = await getCollection("jobs");
    const now = new Date();

    const query = {};

    // Sector filter
    if (sector && sector !== "all") {
      query.sector = sector;
    }

    // Only active jobs:
    // - deadline >= now
    // - OR no deadline field (for old jobs without deadline)
    query.$or = [{ deadline: { $gte: now } }, { deadline: { $exists: false } }];

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
 *
 * Used by company users from /jobs/post page.
 * Creates a new job with:
 *  - deadline (last date to apply)
 *  - expireAt = deadline + 3 days (for TTL auto-delete)
 *
 * IMPORTANT: In MongoDB (once), create TTL index:
 * db.jobs.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      sector,
      type,
      location,
      jobVacancy,
      jobTime,
      jobAddress,
      salaryMin,
      salaryMax,
      salaryCurrency,
      companyName,
      companyEmail,
      deadline, // string: "YYYY-MM-DD"
      description,
      requirements, // textarea: newline separated string OR array
      responsibilities, // textarea: newline separated string OR array
    } = body;

    // Basic "must-have" validation
    if (
      !title ||
      !companyName ||
      !companyEmail ||
      !sector ||
      !type ||
      !location ||
      !jobVacancy ||
      !jobTime ||
      !jobAddress ||
      !salaryMin ||
      !salaryMax ||
      !salaryCurrency ||
      !deadline
    ) {
      return NextResponse.json(
        { message: "All required fields must be provided." },
        { status: 400 }
      );
    }

    const jobsCollection = await getCollection("jobs");

    // Normalize sector
    const normalizedSector = ALLOWED_SECTORS.includes(sector)
      ? sector
      : "Commercial";

    const vacancyNum = Number(jobVacancy);
    const salaryMinNum = Number(salaryMin);
    const salaryMaxNum = Number(salaryMax);

    if (
      Number.isNaN(vacancyNum) ||
      Number.isNaN(salaryMinNum) ||
      Number.isNaN(salaryMaxNum)
    ) {
      return NextResponse.json(
        { message: "Vacancy and salary must be valid numbers." },
        { status: 400 }
      );
    }

    // Parse deadline from "YYYY-MM-DD"
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid deadline date." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (deadlineDate < now) {
      return NextResponse.json(
        { message: "Deadline cannot be in the past." },
        { status: 400 }
      );
    }

    // TTL auto-delete 3 days after deadline
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const expireAt = new Date(deadlineDate.getTime() + THREE_DAYS_MS);

    // Simple custom id like JOB-026
    const totalCount = await jobsCollection.countDocuments();
    const customId = `JOB-${String(totalCount + 1).padStart(3, "0")}`;

    // Normalize requirements/responsibilities into arrays
    let requirementsArr = [];
    if (Array.isArray(requirements)) {
      requirementsArr = requirements;
    } else if (typeof requirements === "string" && requirements.trim() !== "") {
      requirementsArr = requirements.split("\n").map((line) => line.trim());
    }

    let responsibilitiesArr = [];
    if (Array.isArray(responsibilities)) {
      responsibilitiesArr = responsibilities;
    } else if (
      typeof responsibilities === "string" &&
      responsibilities.trim() !== ""
    ) {
      responsibilitiesArr = responsibilities.split("\n").map((line) => line.trim());
    }

    const doc = {
      id: customId,
      title,
      company: companyName,
      sector: normalizedSector,
      type,
      location,
      jobVacancy: vacancyNum,
      jobTime,
      jobAddress,
      salary: {
        min: salaryMinNum,
        max: salaryMaxNum,
        currency: salaryCurrency,
      },
      postedDate: now,

      // 🔴 new fields for deadline / TTL
      deadline: deadlineDate,
      expireAt,

      description: description || "",
      requirements: requirementsArr,
      responsibilities: responsibilitiesArr,

      createdByEmail: companyEmail,
      createdAt: now,
    };

    const result = await jobsCollection.insertOne(doc);

    return NextResponse.json(
      {
        ok: true,
        insertedId: result.insertedId.toString(),
        id: customId,
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
