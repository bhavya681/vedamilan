/**
 * Shared origin allowlist + CORS utilities.
 *
 * Better Auth validates the `Origin` header for its own CSRF protection but does
 * not emit CORS response headers. Both the auth instance (trustedOrigins) and
 * the API middleware (CORS headers) must agree on the same explicit allowlist,
 * so it lives here with no server-only dependencies (safe in Edge middleware).
 */

const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // LAN Expo web origin for this project; override/extend via
  // BETTER_AUTH_TRUSTED_ORIGINS when the machine IP changes.
  "http://192.168.1.112:8081",
] as const;

const CORS_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const DEFAULT_CORS_HEADERS = "Accept,Authorization,Content-Type,X-Requested-With";
const EXPOSED_HEADERS = "set-auth-token";

function normalizeOrigin(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw || raw === "*") return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function parseOriginList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter((entry): entry is string => Boolean(entry));
}

/**
 * Explicit allowlist. Production hosts come from deployment env vars; additional
 * origins (for example a LAN Expo origin) must be declared in
 * `BETTER_AUTH_TRUSTED_ORIGINS`. Never widen this to a wildcard.
 */
export function getTrustedOrigins(): string[] {
  const configured = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ...parseOriginList(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
    ...LOCAL_DEVELOPMENT_ORIGINS,
  ];

  const origins = new Set<string>();
  for (const entry of configured) {
    const origin = normalizeOrigin(entry);
    if (origin) origins.add(origin);
  }
  return [...origins];
}

export function isTrustedOrigin(origin: string | null | undefined): origin is string {
  if (!origin) return false;
  return getTrustedOrigins().includes(origin);
}

/** CORS headers for an actual (non-preflight) API response. */
export function applyCorsHeaders(headers: Headers, request: Request): void {
  headers.append("Vary", "Origin");

  const origin = request.headers.get("origin");
  if (!isTrustedOrigin(origin)) return;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Expose-Headers", EXPOSED_HEADERS);
}

/** CORS preflight response. Never requires authentication. */
export function corsPreflightResponse(request: Request): Response {
  const headers = new Headers();
  applyCorsHeaders(headers, request);

  const origin = request.headers.get("origin");
  if (isTrustedOrigin(origin)) {
    const requestedHeaders = request.headers.get("access-control-request-headers");
    headers.set("Access-Control-Allow-Methods", CORS_METHODS);
    headers.set("Access-Control-Allow-Headers", requestedHeaders?.trim() || DEFAULT_CORS_HEADERS);
    headers.set("Access-Control-Max-Age", "600");
  }

  return new Response(null, { status: 204, headers });
}
