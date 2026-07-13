import { describe, expect, it } from "vitest";

import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { computeMarriageWindows } from "@/application/rules/marriage-timing";

describe("Module 5 — Ashta Koota rule engine", () => {
  it("scores a supportive pair under 36", () => {
    const result = scoreAshtaKoota({
      moonSignA: "Cancer",
      moonSignB: "Taurus",
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    expect(result.maxGuna).toBe(36);
    expect(result.totalGuna).toBeGreaterThan(0);
    expect(result.totalGuna).toBeLessThanOrEqual(36);
    expect(result.gunaBreakdown).toHaveLength(8);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it("flags nadi dosha for same nadi group", () => {
    const result = scoreAshtaKoota({
      moonSignA: "Aries",
      moonSignB: "Leo",
      nakshatraA: "Ashwini",
      nakshatraB: "Magha",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    // Ashwini index 0, Magha index 9 → both % 3 === 0
    expect(result.nadiDosha).toBe(true);
    expect(result.gunaBreakdown.find((g) => g.koota === "Nadi")?.score).toBe(0);
  });
});

describe("Module 5 — marriage timing rule engine", () => {
  it("returns scored windows from dasha periods", () => {
    const now = Date.now();
    const windows = computeMarriageWindows(
      [
        {
          lord: "Venus",
          startDate: new Date(now - 10 * 86400000),
          endDate: new Date(now + 400 * 86400000),
          level: "MAHA",
          parentLord: null,
        },
        {
          lord: "Jupiter",
          startDate: new Date(now),
          endDate: new Date(now + 100 * 86400000),
          level: "ANTAR",
          parentLord: "Venus",
        },
      ],
      "NON_MANGLIK",
    );
    expect(windows.length).toBeGreaterThan(0);
    expect(windows[0].score).toBeGreaterThan(80);
  });
});
