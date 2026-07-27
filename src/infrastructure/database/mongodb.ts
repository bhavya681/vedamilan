import dns from "node:dns";
import dnsPromises from "node:dns/promises";
import mongoose from "mongoose";

import { logger } from "@/lib/utils/logger";

/**
 * Windows / corporate DNS often fails Node's SRV lookup for mongodb+srv.
 * Prefer public resolvers so Atlas SRV records resolve reliably.
 */
function ensurePublicDnsResolvers(): void {
  try {
    const current = dns.getServers();
    if (!current.includes("8.8.8.8") && !current.includes("1.1.1.1")) {
      dns.setServers(["8.8.8.8", "1.1.1.1", ...current]);
    }
  } catch {
    // ignore — fall back to system DNS
  }
}

ensurePublicDnsResolvers();

const globalForMongo = globalThis as unknown as {
  mongoosePromise?: Promise<typeof mongoose>;
  resolvedMongoUri?: string;
  resolveUriPromise?: Promise<string>;
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

/**
 * Resolve mongodb+srv to a standard mongodb:// URI so the driver never
 * performs its own SRV lookup (often blocked on Windows / corporate DNS).
 */
type SrvRecord = { name: string; port: number };

type DohAnswer = { name: string; type: number; TTL: number; data: string };

async function queryDoh(name: string, type: "SRV" | "TXT"): Promise<DohAnswer[]> {
  const url = new URL("https://dns.google/resolve");
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`DoH query failed (${response.status}) for ${name}`);
  }

  const body = (await response.json()) as { Status?: number; Answer?: DohAnswer[] };
  if (body.Status !== 0 || !body.Answer?.length) {
    throw new Error(`DoH returned no ${type} answers for ${name}`);
  }

  return body.Answer;
}

function parseDohSrvAnswers(answers: DohAnswer[]): SrvRecord[] {
  return answers
    .filter((answer) => answer.type === 33)
    .map((answer) => {
      const parts = answer.data.trim().split(/\s+/);
      const port = Number(parts[2]);
      const name = parts[3]?.replace(/\.$/, "") ?? "";
      return { name, port };
    })
    .filter((record) => record.name && Number.isFinite(record.port));
}

function parseDohTxtAnswers(answers: DohAnswer[]): string[] {
  return answers
    .filter((answer) => answer.type === 16)
    .map((answer) => answer.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
}

async function resolveAtlasSrvRecords(
  srvName: string,
  clusterHost: string,
): Promise<{
  srvRecords: SrvRecord[];
  txtRecords: string[];
}> {
  ensurePublicDnsResolvers();

  try {
    const [srvRecords, txtRecords] = await Promise.all([
      dnsPromises.resolveSrv(srvName),
      dnsPromises.resolveTxt(clusterHost).catch(() => [] as string[][]),
    ]);

    return {
      srvRecords: srvRecords.map((record) => ({ name: record.name, port: record.port })),
      txtRecords: txtRecords.flat(),
    };
  } catch (nodeDnsError) {
    // Common on Windows / corporate DNS — DoH still resolves Atlas SRV reliably.
    logger.warn(
      { err: nodeDnsError },
      "Node DNS SRV lookup failed; falling back to DNS-over-HTTPS (connection should still succeed)",
    );

    const [srvAnswers, txtAnswers] = await Promise.all([
      queryDoh(srvName, "SRV"),
      queryDoh(clusterHost, "TXT").catch(() => [] as DohAnswer[]),
    ]);

    return {
      srvRecords: parseDohSrvAnswers(srvAnswers),
      txtRecords: parseDohTxtAnswers(txtAnswers),
    };
  }
}

function buildStandardMongoUri(
  credentials: string,
  srvRecords: SrvRecord[],
  pathAndQuery: string,
  txtRecords: string[],
): string {
  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(",");
  const basePath = pathAndQuery.split("?")[0] ?? "";
  const params = new URLSearchParams(pathAndQuery.includes("?") ? pathAndQuery.split("?")[1] : "");
  params.set("ssl", "true");
  params.set("tls", "true");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");

  for (const txt of txtRecords.flat().join("&").split("&")) {
    const [key, value] = txt.split("=");
    if (key && value) {
      params.set(key, value);
    }
  }

  return `mongodb://${credentials}${hosts}${basePath}?${params.toString()}`;
}

async function resolveMongoSrvUri(srvUri: string): Promise<string> {
  if (!srvUri.startsWith("mongodb+srv://")) {
    return srvUri;
  }

  const withoutScheme = srvUri.slice("mongodb+srv://".length);
  const atIndex = withoutScheme.lastIndexOf("@");
  const slashIndex = withoutScheme.indexOf("/");

  let credentials = "";
  let hostPart: string;
  let pathAndQuery = "";

  if (atIndex !== -1 && (slashIndex === -1 || atIndex < slashIndex)) {
    credentials = withoutScheme.slice(0, atIndex + 1);
    const rest = withoutScheme.slice(atIndex + 1);
    const slash = rest.indexOf("/");
    if (slash === -1) {
      hostPart = rest;
    } else {
      hostPart = rest.slice(0, slash);
      pathAndQuery = rest.slice(slash);
    }
  } else {
    const slash = withoutScheme.indexOf("/");
    if (slash === -1) {
      hostPart = withoutScheme;
    } else {
      hostPart = withoutScheme.slice(0, slash);
      pathAndQuery = withoutScheme.slice(slash);
    }
  }

  const srvName = `_mongodb._tcp.${hostPart}`;
  const { srvRecords, txtRecords } = await resolveAtlasSrvRecords(srvName, hostPart);

  if (!srvRecords.length) {
    throw new Error(`No MongoDB SRV records found for ${hostPart}`);
  }

  return buildStandardMongoUri(credentials, srvRecords, pathAndQuery, txtRecords);
}

async function getResolvedMongoUri(): Promise<string> {
  const standardUri = process.env.MONGODB_URI_STANDARD;
  if (standardUri) {
    return standardUri;
  }

  const uri = getMongoUri();
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  if (globalForMongo.resolvedMongoUri) {
    return globalForMongo.resolvedMongoUri;
  }

  if (!globalForMongo.resolveUriPromise) {
    globalForMongo.resolveUriPromise = resolveMongoSrvUri(uri)
      .then((resolved) => {
        globalForMongo.resolvedMongoUri = resolved;
        logger.info("Resolved mongodb+srv URI for DNS compatibility");
        return resolved;
      })
      .catch((error) => {
        globalForMongo.resolveUriPromise = undefined;
        throw error;
      });
  }

  return globalForMongo.resolveUriPromise;
}

export async function connectMongo(): Promise<typeof mongoose> {
  // Read as number so TypeScript does not narrow across awaits (readyState mutates).
  const readyState = () => Number(mongoose.connection.readyState);

  if (readyState() === 1) {
    return mongoose;
  }

  // Connecting — wait on the in-flight promise instead of opening another URI.
  if (readyState() === 2 && globalForMongo.mongoosePromise) {
    await globalForMongo.mongoosePromise;
  }

  // Re-check after awaiting — readyState may have advanced to connected.
  if (readyState() === 1) {
    return mongoose;
  }

  // Drop a stale resolved/rejected promise after disconnect or a failed attempt
  // so the next call always opens a fresh connection.
  if (readyState() === 0) {
    globalForMongo.mongoosePromise = undefined;
  }

  if (!globalForMongo.mongoosePromise) {
    // Assign the promise *before* any await so concurrent callers share one connect.
    globalForMongo.mongoosePromise = (async () => {
      const uri = await getResolvedMongoUri();
      if (readyState() === 1) {
        return mongoose;
      }
      // readyState 2: another connect may already be in flight on this singleton
      if (readyState() === 2) {
        // Wait briefly for the active connection to finish
        for (let i = 0; i < 50; i += 1) {
          await new Promise((r) => setTimeout(r, 100));
          if (readyState() === 1) return mongoose;
          if (readyState() === 0) break;
        }
      }
      if (readyState() === 1) {
        return mongoose;
      }
      try {
        await mongoose.connect(uri, {
          maxPoolSize: 20,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 15_000,
          autoIndex: process.env.NODE_ENV !== "production",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Concurrent connect with different resolved host strings — reuse if already up.
        if (
          /different connection strings|openUri\(\) on an active connection/i.test(message) &&
          readyState() === 1
        ) {
          return mongoose;
        }
        throw error;
      }
      return mongoose;
    })().catch((error) => {
      globalForMongo.mongoosePromise = undefined;
      throw error;
    });
  }

  try {
    await globalForMongo.mongoosePromise;
    const state = readyState();
    if (state !== 1) {
      globalForMongo.mongoosePromise = undefined;
      throw new Error(`MongoDB connect finished with readyState=${state}`);
    }
    logger.info({ readyState: state }, "MongoDB connected");
    return mongoose;
  } catch (error) {
    globalForMongo.mongoosePromise = undefined;
    const message = error instanceof Error ? error.message : String(error);
    if (/IP that isn't whitelisted|whitelist|ServerSelectionError/i.test(message)) {
      logger.error(
        { err: error },
        "MongoDB connection failed — check Atlas Network Access (IP allowlist), DB user password, and that the cluster is not paused",
      );
    } else {
      logger.error({ err: error }, "MongoDB connection failed");
    }
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
    globalForMongo.resolvedMongoUri = undefined;
    globalForMongo.resolveUriPromise = undefined;
  }
}

export { mongoose };
