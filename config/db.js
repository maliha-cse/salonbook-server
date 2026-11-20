
import { MongoClient } from "mongodb";

let client;
let db;

export const connectDB = async () => {
  try {
    if (db) return db;

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    client = new MongoClient(uri);
    await client.connect();

    db = client.db("salonbook");

    console.log("MongoDB connected successfully!");

    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected yet");
  }

  return db;
};

export const getMongoClient = () => {
  if (!client) {
    throw new Error("MongoDB client is not connected yet");
  }

  return client;
};
