import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, email, name, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { message: "uid and email are required" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");

    // Upsert: if user exists, update; else create new
    const result = await usersCollection.updateOne(
      { uid },
      {
        $set: {
          email,
          name: name || "",
          photoURL: photoURL || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      { ok: true, upsertedId: result.upsertedId ?? null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
