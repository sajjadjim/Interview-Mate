// src/app/api/company/shortlist/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

/**
 * POST /api/company/shortlist
 * Body:
 * {
 *   companyEmail: "company@domain.com",
 *   application: { ...full application doc from users_jobs_application... }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { companyEmail, application } = body || {};

    if (!companyEmail || !application) {
      return NextResponse.json(
        { message: "companyEmail and application are required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");
    const companyUser = await usersCollection.findOne({ email: companyEmail });

    if (!companyUser || companyUser.role !== "company") {
      return NextResponse.json(
        {
          message:
            "Forbidden: only company accounts can shortlist candidates.",
        },
        { status: 403 }
      );
    }

    const shortlistCollection = await getCollection("cv_shortListed_database");

    // avoid duplicate shortlist for same company + application
    const existing = await shortlistCollection.findOne({
      companyEmail,
      applicationId: application._id,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Candidate already shortlisted." },
        { status: 409 }
      );
    }

    const docToInsert = {
      companyEmail,
      companyName: companyUser.companyProfile?.companyName || null,
      applicationId: application._id, // keep reference to original application
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      jobLocation: application.location,
      jobType: application.type,
      jobSector: application.sector,
      jobCompany: application.company,

      candidateUid: application.candidateUid,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone || null,
      candidateAddress: application.candidateAddress || null,
      resumeUrl: application.resumeUrl || null,

      status: "shortlisted",
      appliedAt: application.appliedAt || application.createdAt || null,
      createdAt: new Date(),
    };

    await shortlistCollection.insertOne(docToInsert);

    return NextResponse.json(
      { message: "Candidate shortlisted successfully." },
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
