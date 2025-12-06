// // src/lib/firebaseAdmin.js
// import admin from "firebase-admin";

// // Read from environment variables
// const projectId = process.env.FIREBASE_PROJECT_ID;
// const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// const privateKey = process.env.FIREBASE_PRIVATE_KEY
//   ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
//   : undefined;

// // Only initialize once (Next.js hot reload & serverless)
// if (!admin.apps.length) {
//   if (!projectId || !clientEmail || !privateKey) {
//     console.warn(
//       "Firebase Admin env vars missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
//     );
//   } else {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId,
//         clientEmail,
//         privateKey,
//       }),
//     });
//   }
// }

// /**
//  * Verify a Firebase ID token from the frontend.
//  * Returns decoded token ({ uid, email, ... }) or null if invalid.
//  */
// export async function verifyFirebaseIdToken(idToken) {
//   try {
//     if (!admin.apps.length) {
//       console.error("Firebase Admin is not initialized.");
//       return null;
//     }
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     return decoded;
//   } catch (err) {
//     console.error("Error verifying Firebase ID token:", err);
//     return null;
//   }
// }

import admin from "firebase-admin";

// Read from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

// Only initialize once
if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Firebase Admin env vars missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

/**
 * Verify a Firebase ID token from the frontend.
 */
export async function verifyFirebaseIdToken(idToken) {
  try {
    if (!admin.apps.length) {
      console.error("Firebase Admin is not initialized.");
      return null;
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.error("Error verifying Firebase ID token:", err);
    return null;
  }
}

// 👇 IMPORTANT: We export 'admin' so the API route can use 'admin.auth()'
export default admin;


