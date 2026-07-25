import { describe, expect, it } from "vitest";

import { routes } from "@/lib/constants/routes";
import { sanitizeInternalPath } from "@/lib/security/safe-redirect";
import {
  assertNoMongoOperators,
  assertSafePublicHttpsUrl,
  escapeRegex,
} from "@/lib/security/url-safety";
import { assertSameOriginMutation } from "@/lib/security/csrf";
import { ForbiddenError, ValidationError } from "@/lib/utils/error-handler";
import { profileUpdateSchema } from "@/lib/validators/profile";

describe("open redirect hardening", () => {
  it("allows relative app paths", () => {
    expect(sanitizeInternalPath("/dashboard/matches")).toBe("/dashboard/matches");
    expect(sanitizeInternalPath("/en/dashboard")).toBe("/en/dashboard");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeInternalPath("//evil.com")).toBe(routes.dashboard);
    expect(sanitizeInternalPath("https://evil.com")).toBe(routes.dashboard);
    expect(sanitizeInternalPath("/\\evil.com")).toBe(routes.dashboard);
    expect(sanitizeInternalPath("/%2F%2Fevil.com")).toBe(routes.dashboard);
  });
});

describe("SSRF URL allowlist", () => {
  it("accepts public HTTPS hosts", () => {
    expect(assertSafePublicHttpsUrl("https://res.cloudinary.com/demo/image.jpg").hostname).toBe(
      "res.cloudinary.com",
    );
  });

  it("rejects localhost, metadata, and private IPs", () => {
    expect(() => assertSafePublicHttpsUrl("https://127.0.0.1/x")).toThrow(ValidationError);
    expect(() => assertSafePublicHttpsUrl("https://169.254.169.254/latest")).toThrow(
      ValidationError,
    );
    expect(() => assertSafePublicHttpsUrl("https://10.0.0.5/secret")).toThrow(ValidationError);
    expect(() => assertSafePublicHttpsUrl("http://example.com/x")).toThrow(ValidationError);
  });
});

describe("injection helpers", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegex("a+b(c)")).toBe("a\\+b\\(c\\)");
  });

  it("rejects Mongo operator objects", () => {
    expect(() => assertNoMongoOperators({ $where: "1" })).toThrow(ValidationError);
    expect(() => assertNoMongoOperators({ name: { $gt: "" } })).toThrow(ValidationError);
    expect(() => assertNoMongoOperators({ name: "Ada" })).not.toThrow();
  });
});

describe("CSRF same-origin guard", () => {
  it("allows matching Origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const req = new Request("http://localhost:3000/api/x", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    expect(() => assertSameOriginMutation(req)).not.toThrow();
  });

  it("blocks foreign Origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const req = new Request("http://localhost:3000/api/x", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    expect(() => assertSameOriginMutation(req)).toThrow(ForbiddenError);
  });
});

describe("mass assignment / profile schema", () => {
  it("strips or rejects privileged fields", () => {
    const sneaky = {
      name: "Ada",
      role: "admin",
      isVerified: true,
      status: "ACTIVE",
      subscription: "PREMIUM",
    };
    const parsed = profileUpdateSchema.safeParse(sneaky);
    expect(parsed.success).toBe(false);
  });

  it("accepts allowlisted profile fields", () => {
    const parsed = profileUpdateSchema.safeParse({ name: "Ada", visibility: "MEMBERS" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ name: "Ada", visibility: "MEMBERS" });
    }
  });
});
