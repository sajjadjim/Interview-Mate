import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

/**
 * GET /api/admin/pending-company
 * Returns:
 * 1. List of companies (filtered by status & paginated)
 * 2. Global Statistics (Total, Active, Inactive)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "inactive";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const usersCollection = await getCollection("users");

    // --- 1. STATISTICS (Global Counts) ---
    // These run independently of the pagination/status filter
    const totalCompanies = await usersCollection.countDocuments({ role: "company" });
    const activeCompanies = await usersCollection.countDocuments({ role: "company", status: "active" });
    const inactiveCompanies = await usersCollection.countDocuments({ role: "company", status: "inactive" });
    // -------------------------------------

    // --- 2. TABLE DATA (Filtered & Paginated) ---
    const query = { role: "company", status: status };
    
    const listCount = await usersCollection.countDocuments(query); // Count for pagination

    const companies = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedCompanies = companies.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    const totalPages = Math.ceil(listCount / limit);

    return NextResponse.json({ 
      companies: formattedCompanies, 
      totalPages,
      currentPage: page,
      stats: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pending-company
 * Update Status or Profile
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, status, profileData } = body;

    if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    const usersCollection = await getCollection("users");
    
    const updateDoc = { $set: { updatedAt: new Date() } };

    if (status) updateDoc.$set.status = status;
    if (profileData) updateDoc.$set.companyProfile = profileData;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      updateDoc
    );

    if (result.matchedCount === 0) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}