export {
  connectMongo,
  disconnectMongo,
  getMongoClient,
  getMongoDb,
  mongoose,
} from "@/infrastructure/database/mongodb";

export * from "@/infrastructure/database/models";

/** @deprecated Prisma/PostgreSQL — do not use for new modules */
export { prisma, getPrisma, disconnectPrisma } from "@/lib/database/prisma";

export {
  getRedis,
  ensureRedisConnected,
  getJson,
  setJson,
  delKey,
  keyExists,
  disconnectRedis,
} from "@/lib/database/redis";
