// import  { MongoClient, ServerApiVersion } from 'mongodb';

// export default function dbConnect (collectionName){
// const uri = process.env.MONGODB_URI;
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// return client.db(process.env.DB_NAME).collection(collectionName);

// }

// src/lib/dbConnect.js

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error("⚠️ Missing MONGODB_URI in .env.local");

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

// Reuse client connection globally to prevent multiple connections
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
