// import { NextResponse } from "next/server";
// import { getCollection } from "@/lib/dbConnect"; // Using your existing helper
// import { ObjectId } from "mongodb"; // Required to handle _id with native driver

// /**
//  * GET /api/admin/pending-hr
//  * Fetch HR users based on status (active/inactive) with pagination
//  */
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status") || "inactive";
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     const usersCollection = await getCollection("users");

//     // Query for users with role 'hr' and the specific status
//     const query = { role: "hr", status: status };

//     // 1. Get total count for pagination
//     const totalUsers = await usersCollection.countDocuments(query);

//     // 2. Fetch the data with sorting and pagination
//     const users = await usersCollection
//       .find(query)
//       .sort({ createdAt: -1 }) // Sort by newest first
//       .skip(skip)
//       .limit(limit)
//       .toArray();

//     // 3. Convert ObjectId to string for the frontend
//     const hrUsers = users.map((user) => ({
//       ...user,
//       _id: user._id.toString(),
//     }));

//     const totalPages = Math.ceil(totalUsers / limit);

//     return NextResponse.json({ hrUsers, totalPages }, { status: 200 });
//   } catch (error) {
//     console.error("Error in GET /api/admin/pending-hr:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * PATCH /api/admin/pending-hr
//  * Update HR Status (Activate/Deactivate) OR Edit Profile Info
//  */
// export async function PATCH(request) {
//   try {
//     const body = await request.json();
//     const { userId, status, profileData } = body;

//     if (!userId) {
//       return NextResponse.json(
//         { message: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     const usersCollection = await getCollection("users");

//     // Prepare the update object
//     const updateDoc = {
//       $set: {
//         updatedAt: new Date(),
//       },
//     };

//     // Scenario A: Changing Status
//     if (status) {
//       updateDoc.$set.status = status;
//     }

//     // Scenario B: Updating Profile Details
//     if (profileData) {
//       updateDoc.$set.hrProfile = profileData;
//     }

//     // Perform the update
//     // IMPORTANT: convert string userId to ObjectId
//     const result = await usersCollection.updateOne(
//       { _id: new ObjectId(userId) },
//       updateDoc
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Update successful" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error in PATCH /api/admin/pending-hr:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

/**
 * GET /api/admin/pending-hr
 * Returns HR list + Statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "inactive";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const usersCollection = await getCollection("users");

    // --- 1. STATISTICS (Global Counts for HR) ---
    const totalHR = await usersCollection.countDocuments({ role: "hr" });
    const activeHR = await usersCollection.countDocuments({ role: "hr", status: "active" });
    const inactiveHR = await usersCollection.countDocuments({ role: "hr", status: "inactive" });
    // --------------------------------------------

    // --- 2. TABLE DATA ---
    const query = { role: "hr", status: status };
    
    const listCount = await usersCollection.countDocuments(query); // Count for pagination

    const hrUsers = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedHR = hrUsers.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    const totalPages = Math.ceil(listCount / limit);

    return NextResponse.json({ 
      hrUsers: formattedHR, 
      totalPages,
      currentPage: page,
      stats: {
        total: totalHR,
        active: activeHR,
        inactive: inactiveHR
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching HR users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pending-hr
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
    if (profileData) updateDoc.$set.hrProfile = profileData;

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