import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, email, role, name, phone } = body;

    if (!uid || !email || !role) {
      return NextResponse.json(
        { message: "uid, email and role are required" },
        { status: 400 }
      );
    }

    const normalizedRole = role.toLowerCase();
    const allowedRoles = ["company", "hr", "candidate"];

    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // status rules:
    // - candidate → active (can use platform immediately)
    // - hr, company → inactive (must be verified)
    const status = normalizedRole === "candidate" ? "active" : "inactive";

    const usersCollection = await getCollection("users");

    // 1 Gmail → 1 account
    const existingByEmail = await usersCollection.findOne({ email });

    if (existingByEmail && existingByEmail.uid !== uid) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const result = await usersCollection.updateOne(
      { uid },
      {
        $set: {
          uid,
          email,
          role: normalizedRole,
          status, // 👈 role-based status
          name: name || "",
          phone: phone || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        ok: true,
        upsertedId: result.upsertedId ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/users/register:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
