// src/app/api/company/candidate-applications/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

/**
 * Helper: find company user by email and ensure role === "company".
 * Returns { userDoc, errorResponse }
 */
async function requireCompanyByEmail(email) {
  if (!email) {
    return {
      userDoc: null,
      errorResponse: NextResponse.json(
        { message: "company email is required" },
        { status: 400 }
      ),
    };
  }

  const usersCollection = await getCollection("users");
  const userDoc = await usersCollection.findOne({ email });

  if (!userDoc) {
    return {
      userDoc: null,
      errorResponse: NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      ),
    };
  }

  if (userDoc.role !== "company") {
    return {
      userDoc: null,
      errorResponse: NextResponse.json(
        {
          message:
            "Forbidden: only company accounts can view candidate applications.",
        },
        { status: 403 }
      ),
    };
  }

  return { userDoc, errorResponse: null };
}

/**
 * GET /api/company/candidate-applications?email=companyEmail&page=1&limit=9
 *
 * Returns:
 *  - jobs posted by this company (paginated)
 *  - totalJobs
 *  - totalApplications across ALL jobs for this company
 *  - applicationsPerJob (counts per job on current page)
 *  - applicants: ALL applications across company jobs
 *      each applicant has `shortlisted: true/false`
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const { userDoc, errorResponse } = await requireCompanyByEmail(email);
    if (errorResponse) return errorResponse;

    const companyEmail = userDoc.email;
    const status = userDoc.status || "inactive";
    const companyName = userDoc.companyProfile?.companyName || null;

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "9", 10);

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit =
      Number.isNaN(limitParam) || limitParam < 1 || limitParam > 50
        ? 9
        : limitParam;
    const skip = (page - 1) * limit;

    const jobsCollection = await getCollection("jobs");
    const applicationsCollection = await getCollection(
      "users_jobs_application"
    );
    const shortlistCollection = await getCollection(
      "cv_shortListed_database"
    );

    // 1) All jobs for this company (by createdByEmail)
    const jobFilter = companyEmail
      ? { createdByEmail: companyEmail }
      : { _id: { $exists: false } };

    const allJobsCursor = jobsCollection
      .find(jobFilter)
      .project({ _id: 1, title: 1 });
    const allJobs = await allJobsCursor.toArray();
    const allJobIds = allJobs.map((j) => j._id.toString());

    const totalJobs = allJobIds.length;

    // 2) Jobs for this page (sorted by createdAt desc; frontend sorts by title)
    const jobsCursor = jobsCollection
      .find(jobFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const jobsRaw = await jobsCursor.toArray();
    const jobsPageIds = jobsRaw.map((j) => j._id.toString());

    const safeJobs = jobsRaw.map((job) => ({
      ...job,
      _id: job._id.toString(),
    }));

    // 3) Per-job application counts for jobs on this page
    let applicationsPerJob = {};

    if (jobsPageIds.length > 0) {
      const pipeline = [
        {
          $match: {
            jobId: { $in: jobsPageIds },
          },
        },
        {
          $group: {
            _id: "$jobId",
            count: { $sum: 1 },
          },
        },
      ];

      const aggCursor = applicationsCollection.aggregate(pipeline);
      const aggResults = await aggCursor.toArray();

      applicationsPerJob = {};
      for (const row of aggResults) {
        applicationsPerJob[row._id] = row.count;
      }
    }

    // 4) All applications for this company's jobs
    let applicants = [];
    let totalApplications = 0;

    if (allJobIds.length > 0) {
      const appFilter = { jobId: { $in: allJobIds } };

      const applicationsRaw = await applicationsCollection
        .find(appFilter)
        .sort({ createdAt: -1 })
        .toArray();

      totalApplications = applicationsRaw.length;

      // 5) fetch shortlist docs for this company + these jobs
      const shortlistDocs = await shortlistCollection
        .find({
          companyEmail,
          jobId: { $in: allJobIds },
        })
        .project({ applicationId: 1 })
        .toArray();

      const shortlistedSet = new Set(
        shortlistDocs.map((doc) => String(doc.applicationId))
      );

      // Map applicants with `_id` as string + `shortlisted` flag
      applicants = applicationsRaw.map((doc) => {
        const idStr = doc._id.toString();
        return {
          ...doc,
          _id: idStr,
          shortlisted: shortlistedSet.has(idStr),
        };
      });
    }

    return NextResponse.json(
      {
        jobs: safeJobs,
        totalJobs,
        totalApplications,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(totalJobs / limit)),
        applicationsPerJob,
        applicants,
        companyStatus: status,
        companyName,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/company/candidate-applications:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company/candidate-applications
 *
 * Body:
 * {
 *   "companyEmail": "owner@company.com",
 *   "applicationId": "693197edfef23f1d0d2612b0"
 * }
 *
 * Deletes the application from `users_jobs_application`
 * (only if that job belongs to this company),
 * and also removes any corresponding shortlist rows.
 */
export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { companyEmail, applicationId } = body || {};

    const { userDoc, errorResponse } = await requireCompanyByEmail(
      companyEmail
    );
    if (errorResponse) return errorResponse;

    if (!applicationId) {
      return NextResponse.json(
        { message: "applicationId is required" },
        { status: 400 }
      );
    }

    const applicationsCollection = await getCollection(
      "users_jobs_application"
    );
    const jobsCollection = await getCollection("jobs");
    const shortlistCollection = await getCollection("cv_shortListed_database");

    let appDoc;
    try {
      appDoc = await applicationsCollection.findOne({
        _id: new ObjectId(applicationId),
      });
    } catch {
      appDoc = null;
    }

    if (!appDoc) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    const jobIdStr = appDoc.jobId;
    let jobDoc = null;
    try {
      jobDoc = await jobsCollection.findOne({
        _id: new ObjectId(jobIdStr),
      });
    } catch {
      jobDoc = null;
    }

    if (!jobDoc || jobDoc.createdByEmail !== userDoc.email) {
      return NextResponse.json(
        {
          message:
            "Forbidden: this application does not belong to your company job.",
        },
        { status: 403 }
      );
    }

    await applicationsCollection.deleteOne({ _id: appDoc._id });

    // Also clean up shortlist docs for this application
    await shortlistCollection.deleteMany({
      companyEmail: userDoc.email,
      applicationId,
    });

    return NextResponse.json(
      { message: "Application deleted successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in DELETE /api/company/candidate-applications:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
