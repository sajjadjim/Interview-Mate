// src/app/api/interviews/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const body = await req.json();
    const interviews = await getCollection("interviews");

    const result = await interviews.insertOne(body);

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
