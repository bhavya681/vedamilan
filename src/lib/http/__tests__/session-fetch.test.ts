import { describe, expect, it } from "vitest";

import { isAbortError, isUnauthorizedPayload } from "@/lib/http/session-fetch";

describe("session-fetch", () => {
  it("detects unauthenticated /me payloads", () => {
    expect(isUnauthorizedPayload({ authenticated: false })).toBe(true);
    expect(isUnauthorizedPayload({ authenticated: true, user: { id: "1" } })).toBe(false);
  });

  it("detects UNAUTHORIZED API errors", () => {
    expect(isUnauthorizedPayload({ success: false, error: { code: "UNAUTHORIZED" } })).toBe(true);
    expect(isUnauthorizedPayload({ success: false, error: { code: "NOT_FOUND" } })).toBe(false);
    expect(isUnauthorizedPayload({ success: true, data: {} })).toBe(false);
  });

  it("detects abort errors", () => {
    expect(isAbortError(new DOMException("Aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new Error("network"))).toBe(false);
  });
});
