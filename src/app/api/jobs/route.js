import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

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
