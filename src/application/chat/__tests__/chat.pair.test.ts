import { describe, expect, it } from "vitest";

function pairKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

describe("Module 8 — chat pairing", () => {
  it("creates stable pair keys independent of order", () => {
    expect(pairKey("u1", "u2")).toBe(pairKey("u2", "u1"));
    expect(pairKey("a", "b")).toBe("a:b");
  });
});
