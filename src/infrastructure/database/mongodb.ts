import dns from "node:dns";
import mongoose from "mongoose";

import { logger } from "@/lib/utils/logger";

/**
 * Windows / corporate DNS often fails Node's SRV lookup for mongodb+srv.
 * Prefer public resolvers so Atlas SRV records resolve reliably.
 */
try {
  const current = dns.getServers();
  if (!current.includes("8.8.8.8") && !current.includes("1.1.1.1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1", ...current]);
  }
} catch {
  // ignore — fall back to system DNS
}

const globalForMongo = globalThis as unknown as {
  mongoosePromise?: Promise<typeof mongoose>;
};

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Missing MONGODB_URI (or DATABASE_URL) for MongoDB connection");
  }
  if (uri.startsWith("postgresql://") || uri.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL points to PostgreSQL. Set MONGODB_URI to a MongoDB Atlas connection string.",
    );
  }
  return uri;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalForMongo.mongoosePromise) {
    const uri = getMongoUri();
    globalForMongo.mongoosePromise = mongoose.connect(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 15_000,
      autoIndex: process.env.NODE_ENV !== "production",
    });
  }

  try {
    await globalForMongo.mongoosePromise;
    logger.info({ readyState: mongoose.connection.readyState }, "MongoDB connected");
    return mongoose;
  } catch (error) {
    globalForMongo.mongoosePromise = undefined;
    logger.error({ err: error }, "MongoDB connection failed");
    throw error;
  }
}

export function getMongoDb() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error("MongoDB is not connected. Call connectMongo() first.");
  }
  return mongoose.connection.db;
}

export function getMongoClient() {
  const client = mongoose.connection.getClient();
  if (!client) {
    throw new Error("MongoDB client unavailable. Call connectMongo() first.");
  }
  return client;
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    globalForMongo.mongoosePromise = undefined;
  }
}

export { mongoose };
