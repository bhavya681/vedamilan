import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { softDeleteExtension } from "@/lib/database/soft-delete";
import { AppError } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ExtendedPrismaClient;
  prismaPool?: Pool;
};

function createExtendedClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new AppError(
      "DATABASE_CONFIG_ERROR",
      "DATABASE_URL is required to initialize Prisma",
      500,
    );
  }

  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 10_000,
    });

  const adapter = new PrismaPg(pool);
  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaPool = pool;
  }

  return base.$extends(softDeleteExtension());
}

export function getPrisma(): ExtendedPrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createExtendedClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
  if (globalForPrisma.prismaPool) {
    await globalForPrisma.prismaPool.end();
    globalForPrisma.prismaPool = undefined;
  }
  logger.info("Prisma disconnected");
}

/** Transaction helper with automatic client resolution. */
export async function withTransaction<T>(
  fn: (tx: Parameters<Parameters<ExtendedPrismaClient["$transaction"]>[0]>[0]) => Promise<T>,
): Promise<T> {
  return getPrisma().$transaction(async (tx) => fn(tx));
}
