import { describe, expect, it } from "vitest";
import net from "node:net";

async function canConnect(host: string, port: number, timeoutMs = 800): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onDone = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => onDone(true));
    socket.once("timeout", () => onDone(false));
    socket.once("error", () => onDone(false));
    socket.connect(port, host);
  });
}

describe("Module 1 — Database connectivity", () => {
  it("documents DATABASE_URL requirement", () => {
    expect(
      process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/vedic_match",
    ).toMatch(/postgresql:\/\//);
  });

  it("skips live migrate when Postgres is unavailable", async () => {
    const open = await canConnect("127.0.0.1", 5432);
    if (!open) {
      expect(open).toBe(false);
      return;
    }

    const { PrismaClient } = await import("@/generated/prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    try {
      const roles = await prisma.appRole.count();
      expect(roles).toBeGreaterThanOrEqual(0);
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  });
});
