import { describe, expect, it } from "vitest";

import { formatPersonFirstName, formatPersonName } from "@/lib/utils/person-name";

describe("formatPersonName", () => {
  it("title-cases lowercase names", () => {
    expect(formatPersonName("rahul sharma")).toBe("Rahul Sharma");
    expect(formatPersonName("priya")).toBe("Priya");
  });

  it("title-cases ALL CAPS names", () => {
    expect(formatPersonName("RAHUL SHARMA")).toBe("Rahul Sharma");
  });

  it("preserves intentional mixed casing", () => {
    expect(formatPersonName("Rahul Sharma")).toBe("Rahul Sharma");
    expect(formatPersonName("McDonald")).toBe("McDonald");
  });

  it("handles hyphens and apostrophes when recasing", () => {
    expect(formatPersonName("mary-jane")).toBe("Mary-Jane");
    expect(formatPersonName("o'brien")).toBe("O'Brien");
  });

  it("returns fallback for empty", () => {
    expect(formatPersonName("", "Member")).toBe("Member");
    expect(formatPersonName(null)).toBe("Member");
  });

  it("formats first name", () => {
    expect(formatPersonFirstName("rahul sharma")).toBe("Rahul");
  });
});
