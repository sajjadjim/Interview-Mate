import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { passcode } = await req.json();
    const expected = process.env.INTERVIEW_ROOM_PASSWORD;

    // If not set, allow everything so you don't get locked out
    if (!expected) {
      return NextResponse.json({
        ok: true,
        message:
          "No INTERVIEW_ROOM_PASSWORD configured on server, allowing access.",
      });
    }

    if (passcode === expected) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (err) {
    console.error("verify-passcode error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
