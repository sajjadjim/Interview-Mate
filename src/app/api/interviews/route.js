import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const data = await request.json();
    const interviews = await getCollection("interviews");
    const result = await interviews.insertOne(data);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save interview" }, { status: 500 });
  }
}
