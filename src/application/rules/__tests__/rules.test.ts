import { describe, expect, it } from "vitest";

import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { scoreDeepCompatibility } from "@/application/rules/deep-compatibility";
import { computeMarriageWindows } from "@/application/rules/marriage-timing";
import { scoreShukraMilan } from "@/application/rules/shukra-milan";

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
    expect(result.nadiDosha).toBe(true);
    expect(result.gunaBreakdown.find((g) => g.koota === "Nadi")?.score).toBe(0);
  });
});

describe("Module 5 — Shukra Milan", () => {
  it("scores Venus–Saturn duty-bound theme when partner Saturn occupies Venus sign", () => {
    const result = scoreShukraMilan(
      [{ planet: "Venus", sign: "Libra", house: 7, dignity: "Own" }],
      [
        { planet: "Saturn", sign: "Libra", house: 4, dignity: "Exalted" },
        { planet: "Venus", sign: "Taurus", house: 5, dignity: "Own" },
      ],
    );
    expect(result.interactions[0]?.occupantPlanet).toBe("Saturn");
    expect(result.interactions[0]?.theme).toMatch(/Duty/i);
    expect(result.averageScore).toBeGreaterThan(7);
  });
});

describe("Module 5 — Deep compatibility", () => {
  it("returns weighted modules and decision summary", () => {
    const guna = scoreAshtaKoota({
      moonSignA: "Cancer",
      moonSignB: "Taurus",
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    const deep = scoreDeepCompatibility({
      chartA: {
        lagnaSign: "Leo",
        moonSign: "Cancer",
        sunSign: "Virgo",
        planets: [
          { planet: "Moon", sign: "Cancer", house: 12, longitude: 105, nakshatra: "Pushya" },
          { planet: "Venus", sign: "Libra", house: 3, longitude: 190, dignity: "Own" },
          { planet: "Mars", sign: "Aries", house: 9, longitude: 15 },
          { planet: "Mercury", sign: "Virgo", house: 2, longitude: 160 },
          { planet: "Saturn", sign: "Capricorn", house: 6, longitude: 280 },
          { planet: "Jupiter", sign: "Sagittarius", house: 5, longitude: 250 },
        ],
      },
      chartB: {
        lagnaSign: "Libra",
        moonSign: "Taurus",
        sunSign: "Gemini",
        planets: [
          { planet: "Moon", sign: "Taurus", house: 8, longitude: 45, nakshatra: "Rohini" },
          { planet: "Venus", sign: "Taurus", house: 8, longitude: 42, dignity: "Own" },
          { planet: "Saturn", sign: "Libra", house: 1, longitude: 185, dignity: "Exalted" },
          { planet: "Mars", sign: "Scorpio", house: 2, longitude: 220 },
          { planet: "Mercury", sign: "Gemini", house: 9, longitude: 70 },
          { planet: "Jupiter", sign: "Pisces", house: 6, longitude: 340 },
        ],
      },
      gunaBreakdown: guna.gunaBreakdown,
      totalGuna: guna.totalGuna,
      maxGuna: guna.maxGuna,
    });
    expect(deep.modules.length).toBeGreaterThanOrEqual(10);
    expect(deep.shukraMilan.percent).toBeGreaterThan(0);
    expect(deep.overallScore).toBeGreaterThanOrEqual(0);
    expect(deep.overallScore).toBeLessThanOrEqual(100);
    expect(deep.decisionSummary).toBeTruthy();
    expect(deep.categoryScores.shukraMilan).toBeDefined();
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
