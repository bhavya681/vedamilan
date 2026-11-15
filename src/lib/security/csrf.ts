import { ForbiddenError } from "@/lib/utils/error-handler";

import { isTrustedOrigin } from "./cors";

/**
 * Soft CSRF defense for cookie-authenticated mutating requests.
 * Allows trusted browser origins (web app + Expo web) and non-browser clients
 * without Origin (server-to-server, React Native fetch). Never disables the
 * origin check.
 */
export function assertSameOriginMutation(request: Request): void {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    if (!isTrustedOrigin(origin)) {
      throw new ForbiddenError("Cross-origin request blocked");
    }
    return;
  }

  if (referer) {
    try {
      const ref = new URL(referer);
      if (!isTrustedOrigin(ref.origin)) {
        throw new ForbiddenError("Cross-origin request blocked");
      }
    } catch (error) {
      if (error instanceof ForbiddenError) throw error;
      throw new ForbiddenError("Cross-origin request blocked");
    }
  }
}
