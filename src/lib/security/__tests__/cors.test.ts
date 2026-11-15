import { describe, expect, it } from "vitest";

import { applyCorsHeaders, corsPreflightResponse, getTrustedOrigins } from "@/lib/security/cors";

describe("CORS allowlist", () => {
  it("contains local Expo origins and never a wildcard", () => {
    const origins = getTrustedOrigins();
    expect(origins).toContain("http://localhost:8081");
    expect(origins).toContain("http://localhost:19006");
    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("http://192.168.1.112:8081");
    expect(origins).not.toContain("*");
  });

  it("echoes the exact trusted origin with credentials", () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { origin: "http://localhost:8081" },
    });
    const headers = new Headers();
    applyCorsHeaders(headers, request);

    expect(headers.get("access-control-allow-origin")).toBe("http://localhost:8081");
    expect(headers.get("access-control-allow-credentials")).toBe("true");
    expect(headers.get("access-control-expose-headers")).toContain("set-auth-token");
    expect(headers.get("vary")).toContain("Origin");
  });

  it("does not emit allow-origin for untrusted origins", () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    const headers = new Headers();
    applyCorsHeaders(headers, request);

    expect(headers.get("access-control-allow-origin")).toBeNull();
    expect(headers.get("access-control-allow-credentials")).toBeNull();
  });

  it("answers preflight without auth and echoes requested headers", () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:8081",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,authorization",
      },
    });
    const response = corsPreflightResponse(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:8081");
    expect(response.headers.get("access-control-allow-methods")).toContain("OPTIONS");
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
    expect(response.headers.get("access-control-allow-headers")).toBe("content-type,authorization");
  });
});
