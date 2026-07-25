import { ValidationError } from "@/lib/utils/error-handler";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google",
]);

function isPrivateOrLinkLocalIp(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1") return true;

  // IPv4
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((n) => Number.isNaN(n) || n > 255)) return true;
    const a = parts[0] ?? -1;
    const b = parts[1] ?? -1;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  }

  // IPv6 unique local / link-local
  if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return true;

  return false;
}

/**
 * Validate a user-supplied HTTPS URL for outbound fetch / Cloudinary remote ingest.
 * Blocks localhost, private ranges, and cloud metadata endpoints.
 */
export function assertSafePublicHttpsUrl(raw: string, label = "URL"): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new ValidationError(`Enter a valid ${label}`);
  }

  if (parsed.protocol !== "https:") {
    throw new ValidationError(`${label} must use HTTPS`);
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new ValidationError(`${label} host is not allowed`);
  }
  if (isPrivateOrLinkLocalIp(host)) {
    throw new ValidationError(`${label} must not target a private network`);
  }
  if (host === "169.254.169.254" || host.endsWith(".nip.io") || host.endsWith(".sslip.io")) {
    // nip/sslip can map to private IPs — reject by default for user-controlled fetches
    throw new ValidationError(`${label} host is not allowed`);
  }

  return parsed;
}

/** Escape a user string before embedding in a RegExp (ReDoS / injection). */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Reject objects that look like Mongo operator injection payloads.
 * Use after JSON parse when accepting nested filters (prefer Zod instead).
 */
export function assertNoMongoOperators(value: unknown, path = "input"): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoMongoOperators(item, `${path}[${i}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith("$")) {
      throw new ValidationError(`Disallowed operator in ${path}: ${key}`);
    }
    assertNoMongoOperators(child, `${path}.${key}`);
  }
}
