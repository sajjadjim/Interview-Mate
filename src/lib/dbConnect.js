// src/lib/dbConnect.js (example)
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "interview_mate" || "InterviewMate";

if (!uri) throw new Error("⚠️ Missing MONGODB_URI in environment");

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

export default clientPromise;
