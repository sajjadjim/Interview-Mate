import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { message: "uid is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({ uid });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user._id = user._id.toString();
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/users/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { uid, candidateProfile, hrProfile, companyProfile } = body;

    if (!uid) {
      return NextResponse.json(
        { message: "uid is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");

    const update = { $set: { updatedAt: new Date() } };

    if (candidateProfile) {
      update.$set.candidateProfile = candidateProfile;
    }
    if (hrProfile) {
      update.$set.hrProfile = hrProfile;
      // status stays inactive until team verifies (you can change here later)
    }
    if (companyProfile) {
      update.$set.companyProfile = companyProfile;
      // same here: status stays inactive until verification
    }

    const result = await usersCollection.updateOne({ uid }, update);

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/users/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
