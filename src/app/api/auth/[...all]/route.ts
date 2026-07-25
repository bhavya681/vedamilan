import { getAuth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isSensitiveAuthPath(pathname: string): boolean {
  return /\/api\/auth\/(sign-in|sign-up|forget-password|reset-password|send-verification|email-otp|request-password-reset)/i.test(
    pathname,
  );
}

async function handle(request: Request) {
  const { pathname } = new URL(request.url);
  if (request.method !== "GET" && isSensitiveAuthPath(pathname)) {
    await enforceRateLimit({
      key: `auth:${pathname}:${clientIp(request)}`,
      limit: 15,
      windowSec: 60,
    });
  }

  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
