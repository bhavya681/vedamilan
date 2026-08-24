import { describe, expect, it } from "vitest";

import { inferDefaultNeed, suggestSages } from "@/domain/wisdom/sage-alignment";

describe("inferDefaultNeed", () => {
  it("prefers relationship when marriage yoga or manglik is present", () => {
    expect(inferDefaultNeed({ hasChart: true, yogaCategories: ["MARRIAGE"] })).toBe("relationship");
    expect(inferDefaultNeed({ hasChart: true, manglik: "PARTIAL" })).toBe("relationship");
  });

  it("prefers career when profession or career yoga is present", () => {
    expect(inferDefaultNeed({ hasChart: true, profession: "Engineer" })).toBe("career");
    expect(inferDefaultNeed({ hasChart: true, yogaCategories: ["CAREER"] })).toBe("career");
  });

  it("uses dasha and gana as softer signals", () => {
    expect(inferDefaultNeed({ hasChart: true, currentMaha: "Ketu" })).toBe("inquiry");
    expect(inferDefaultNeed({ hasChart: true, currentMaha: "Saturn" })).toBe("inner");
    expect(inferDefaultNeed({ hasChart: true, gana: "Deva" })).toBe("inner");
  });
});

describe("suggestSages", () => {
  it("returns three portrait-backed guides even without a chart", () => {
    const rows = suggestSages({ hasChart: false }, "relationship", 3);
    expect(rows).toHaveLength(3);
    expect(rows.some((row) => row.guideId === "krishna")).toBe(true);
  });

  it("lifts Parashara for jyotisha reflection", () => {
    const rows = suggestSages({ hasChart: true, moonSign: "Cancer" }, "astrology", 3);
    expect(rows[0]?.guideId).toBe("parashara");
  });

  it("aligns Saturn dasha with discipline counsel", () => {
    const rows = suggestSages(
      { hasChart: true, currentMaha: "Saturn", gana: "Rakshasa" },
      "inner",
      4,
    );
    expect(rows.some((row) => row.guideId === "patanjali")).toBe(true);
    expect(rows.every((row) => row.reasons.length > 0)).toBe(true);
  });
});
