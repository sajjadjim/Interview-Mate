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

// 1. Get the raw key
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

// 2. robust cleaning function
// This fixes common Vercel copy-paste errors (extra quotes, wrong newlines)
const formatPrivateKey = (key) => {
  if (!key) return undefined;
  
  // Remove starting/ending double quotes if they exist (Common Vercel mistake)
  let cleanKey = key.replace(/^"|"$/g, "");
  
  // Replace literal "\n" characters with real newlines
  cleanKey = cleanKey.replace(/\\n/g, "\n");
  
  return cleanKey;
};

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = formatPrivateKey(rawKey);

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin Config Missing!");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin Initialized Successfully");
    } catch (error) {
      console.error("❌ Firebase Admin Init Error:", error);
    }
  }
}

export async function verifyFirebaseIdToken(idToken) {
  try {
    if (!admin.apps.length) return null;
    return await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return null;
  }
}

export default admin;


