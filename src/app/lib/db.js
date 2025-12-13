// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

// let cached = global.mongoose || { conn: null, promise: null };

// export async function connectDB() {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, { dbName: "interviewmate" });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// global.mongoose = cached;

