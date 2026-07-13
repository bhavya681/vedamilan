import { describe, expect, it } from "vitest";

import { getUserRoles, hasRole, isAdmin, type SessionUser } from "@/lib/auth/session";

describe("Module 2 — RBAC helpers", () => {
  it("defaults to MEMBER when no roles present", () => {
    expect(getUserRoles({ id: "1", name: "A", email: "a@b.com", emailVerified: true })).toEqual([
      "MEMBER",
    ]);
  });

  it("maps Better Auth admin role to ADMIN", () => {
    const user: SessionUser = {
      id: "1",
      name: "Admin",
      email: "admin@vedamilan.ai",
      emailVerified: true,
      role: "admin",
    };
    expect(getUserRoles(user)).toContain("ADMIN");
    expect(isAdmin(user)).toBe(true);
  });

  it("checks role membership", () => {
    const user: SessionUser = {
      id: "1",
      name: "Member",
      email: "m@vedamilan.ai",
      emailVerified: true,
      roles: ["PREMIUM", "MEMBER"],
    };
    expect(hasRole(user, ["PREMIUM"])).toBe(true);
    expect(hasRole(user, ["ADMIN"])).toBe(false);
  });
});
