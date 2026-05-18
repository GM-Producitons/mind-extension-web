import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MY_MONGODB_URI) {
  throw new Error("Please add your MY_MONGODB_URI to .env.local");
}

const uri = process.env.MY_MONGODB_URI;
let client: MongoClient | null = null;

export async function connectDB() {
  if (client) {
    return client;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("MongoDB connected");
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function getDB() {
  if (!client) {
    await connectDB();
  }
  return client!.db(process.env.MONGODB_DB || "mind-extension");
}

// Mongoose connection (cached for Next.js hot reload)
let mongooseConnected = false;

export async function connectMongoose() {
  if (mongooseConnected || mongoose.connection.readyState >= 1) {
    mongooseConnected = true;
    return;
  }
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "mind-extension",
  });
  mongooseConnected = true;
}
