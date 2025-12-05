import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

/**
 * GET /api/admin/candidate-payment
 * 1. AUTOMATICALLY cleans up unpaid applications > 3 days old.
 * 2. Fetches current data.
 */
export async function GET(request) {
  try {
    const collection = await getCollection("applications");

    // --- AUTO-DELETE LOGIC ---
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Delete items that are 'unpaid' AND created before 3 days ago
    // This runs silently in the background before fetching data
    await collection.deleteMany({
      paymentStatus: "unpaid",
      createdAt: { $lt: threeDaysAgo.toISOString() } // Ensure your DB dates match this format
    });
    // -------------------------

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (statusFilter && statusFilter !== "all") {
      query.paymentStatus = statusFilter;
    }

    const totalCount = await collection.countDocuments(query);

    const applications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedApps = applications.map((app) => ({
      ...app,
      _id: app._id.toString(),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      applications: formattedApps, 
      totalPages,
      currentPage: page 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH: Update Status (Paid/Unpaid etc)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, paymentStatus, approvalStatus } = body;
    const collection = await getCollection("applications");

    const updateFields = { updatedAt: new Date() };
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (approvalStatus) updateFields.approvalStatus = approvalStatus;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

/**
 * DELETE: Manually delete a candidate
 * Security: Only allows deleting if status is 'unpaid'
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const collection = await getCollection("applications");

    // Check if the item exists and is actually unpaid before deleting
    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (item.paymentStatus === "paid") {
      return NextResponse.json(
        { message: "Cannot delete PAID applications." }, 
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}