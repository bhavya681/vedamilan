import { ForbiddenError } from "@/lib/utils/error-handler";

/**
 * Soft CSRF defense for cookie-authenticated mutating requests.
 * Allows same-origin browser calls and non-browser clients without Origin
 * (server-to-server) when Referer is also absent.
 */
export function assertSameOriginMutation(request: Request): void {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;

  if (!appUrl) return;

  let allowed: URL;
  try {
    allowed = new URL(appUrl);
  } catch {
    return;
  }

  const allowedOrigin = allowed.origin;

  if (origin) {
    if (origin !== allowedOrigin) {
      throw new ForbiddenError("Cross-origin request blocked");
    }
    return;
  }

  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin !== allowedOrigin) {
        throw new ForbiddenError("Cross-origin request blocked");
      }
    } catch (error) {
      if (error instanceof ForbiddenError) throw error;
      throw new ForbiddenError("Cross-origin request blocked");
    }
  }
}
