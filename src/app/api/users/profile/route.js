import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

// GET /api/users/profile?uid=FIREBASE_UID
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
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const { _id, ...rest } = user;

    return NextResponse.json(
      { _id: _id.toString(), ...rest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/users/profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/profile
export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      uid,
      name,
      photoURL,
      phone,
      age,
      nidNumber,
      address,
      education,
      currentPosition,
    } = body;

    if (!uid) {
      return NextResponse.json(
        { message: "uid is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");

    const result = await usersCollection.updateOne(
      { uid },
      {
        $set: {
          ...(name !== undefined && { name }),
          ...(photoURL !== undefined && { photoURL }),
          ...(phone !== undefined && { phone }),
          ...(age !== undefined && { age }),
          ...(nidNumber !== undefined && { nidNumber }),
          ...(address !== undefined && { address }),
          ...(education !== undefined && { education }),
          ...(currentPosition !== undefined && { currentPosition }),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/users/profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
