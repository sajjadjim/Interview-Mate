import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

const TIME_OPTIONS = [
  "9-10 AM",
  "11-12 AM",
  "2-3 PM",
  "3-4 PM",
  "9-10 PM",
  "10-11 PM",
];

const TOPIC_OPTIONS = [
  "IT Sector",
  "Educational",
  "Management",
  "Commercial",
  "Other",
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, date, timeSlot, topic } = body;

    if (!name || !email || !date || !timeSlot || !topic) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!TIME_OPTIONS.includes(timeSlot)) {
      return NextResponse.json(
        { message: "Invalid time slot." },
        { status: 400 }
      );
    }

    const normalizedTopic =
      TOPIC_OPTIONS.includes(topic) ? topic : "Other";

    const applicationsCollection = await getCollection("applications");
    const notificationsCollection = await getCollection("notifications");

    const doc = {
      name,
      email,
      date,
      timeSlot,
      topic: normalizedTopic,
      paymentStatus: "unpaid",
      approvalStatus: "Not approved",
      createdAt: new Date(),
    };

    const result = await applicationsCollection.insertOne(doc);

    // Create notification for the candidate
    await notificationsCollection.insertOne({
      userEmail: email,
      title: "Application received",
      message: `Your application for ${normalizedTopic} on ${date} at ${timeSlot} has been received.`,
      type: "application",
      link: "/apply",
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { ok: true, insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET stays same as before
export async function GET() {
  try {
    const collection = await getCollection("applications");

    const applications = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const clean = applications.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(clean, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
