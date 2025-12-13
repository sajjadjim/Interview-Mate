import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";

// Helper function to verify Firebase user
async function requireFirebaseUser(request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      decodedToken: null,
      error: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const idToken = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseIdToken(idToken);

  if (!decodedToken) {
    return {
      decodedToken: null,
      error: NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  return { decodedToken, error: null };
}

// API endpoint for Admin stats
export async function GET(request) {
  try {
    const { decodedToken, error } = await requireFirebaseUser(request);
    if (error) return error;

    const usersCollection = await getCollection("users");
    const jobsCollection = await getCollection("jobs");
    const applicationsCollection = await getCollection("users_jobs_application");
    
    // Get total number of users
    const totalUsers = await usersCollection.countDocuments();
    
    // Get total number of inactive users
    const inactiveUsers = await usersCollection.countDocuments({ status: "inactive" });

    // Get total number of jobs posted
    const totalJobs = await jobsCollection.countDocuments();

    // Get total number of applications
    const candidateApplications = await applicationsCollection.countDocuments();

    // Return the statistics
    return NextResponse.json({
      totalUsers,
      inactiveUsers,
      totalJobs,
      candidateApplications,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
