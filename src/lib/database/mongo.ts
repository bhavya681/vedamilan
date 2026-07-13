/**
 * Database layer public API — MongoDB is authoritative.
 * Legacy Prisma exports remain available under `@/lib/database/prisma` until fully removed.
 */
export {
  connectMongo,
  disconnectMongo,
  getMongoClient,
  getMongoDb,
  mongoose,
} from "@/infrastructure/database/mongodb";

export * from "@/infrastructure/database/models";
