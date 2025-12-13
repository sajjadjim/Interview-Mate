// src/app/api/users/me/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";


/**
 * Helper: read & verify Firebase ID token from Authorization header.
 * Returns { decodedToken } on success OR { error: NextResponse } on failure.
 */
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

/**
 * GET /api/users/me
 *
 * 🔒 Only returns the current logged-in user's document.
 * No token → 401. No more reading other users by uid.
 */
export async function GET(request) {
  try {
    const { decodedToken, error } = await requireFirebaseUser(request);
    if (error) return error;

    const uid = decodedToken.uid;

    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({ uid });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // clean up ObjectId for JSON
    user._id = user._id.toString();

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/users/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 *
 * 🔒 Only logged-in user can update **their own** profile.
 * We ignore any uid from the body and always use token uid.
 */
export async function PATCH(request) {
  try {
    const { decodedToken, error } = await requireFirebaseUser(request);
    if (error) return error;

    const uid = decodedToken.uid;

    const body = await request.json();
    const { candidateProfile, hrProfile, companyProfile } = body || {};

    const usersCollection = await getCollection("users");

    const updateDoc = {
      $set: {
        updatedAt: new Date(),
      },
    };

    if (candidateProfile) {
      updateDoc.$set.candidateProfile = candidateProfile;
    }

    if (hrProfile) {
      updateDoc.$set.hrProfile = hrProfile;
      // you can also force status to remain "inactive" here if needed
      // updateDoc.$set.status = "inactive";
    }

    if (companyProfile) {
      updateDoc.$set.companyProfile = companyProfile;
      // same: keep status inactive until manual verification
      // updateDoc.$set.status = "inactive";
    }

    const result = await usersCollection.updateOne({ uid }, updateDoc);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/users/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
