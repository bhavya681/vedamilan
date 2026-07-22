import { describe, expect, it } from "vitest";

import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { scoreDeepCompatibility } from "@/application/rules/deep-compatibility";
import {
  computeMarriageWindows,
  computeTimedWindows,
  predictPairTiming,
  predictSelfTiming,
  scoreGocharMarriageSupport,
} from "@/application/rules/timing-prediction";
import { scoreMatchBlend } from "@/application/rules/match-blend";
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

  it("builds approximate Antardasha marriage date windows", () => {
    const now = Date.now();
    const start = new Date(now - 2 * 365.2425 * 24 * 60 * 60 * 1000);
    const end = new Date(now + 18 * 365.2425 * 24 * 60 * 60 * 1000);
    const windows = computeTimedWindows(
      [
        {
          lord: "Venus",
          startDate: start,
          endDate: end,
          level: "MAHA",
          parentLord: null,
        },
      ],
      { manglikStatus: "NON_MANGLIK", seventhLord: "Venus", kind: "MARRIAGE", limit: 5 },
    );
    expect(windows.length).toBeGreaterThan(0);
    expect(windows[0].window).toMatch(/\d{4}/);
    expect(windows[0].dashaLabel).toMatch(/Venus–/);
    expect(windows[0].approxNote).toBeTruthy();
    expect(windows[0].startDate).toBeTruthy();
  });
});

describe("Module 5 — multi-factor timing + match blend", () => {
  const periods = [
    {
      lord: "Venus",
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() + 400 * 86400000),
      level: "MAHA",
      parentLord: null,
    },
    {
      lord: "Jupiter",
      startDate: new Date(Date.now() - 5 * 86400000),
      endDate: new Date(Date.now() + 100 * 86400000),
      level: "ANTAR",
      parentLord: "Venus",
    },
  ];

  it("scores gochar support from transit houses", () => {
    const g = scoreGocharMarriageSupport([
      { planet: "Jupiter", sign: "Libra", houseFromNatalLagna: 7 },
      { planet: "Venus", sign: "Taurus", houseFromNatalLagna: 1 },
      { planet: "Saturn", sign: "Aquarius", houseFromNatalLagna: 10 },
    ]);
    expect(g.score).toBeGreaterThan(70);
    expect(g.highlights.length).toBeGreaterThan(0);
  });

  it("predicts self timing with dasha + gochar factors", () => {
    const t = predictSelfTiming({
      periods,
      gocharPlanets: [
        { planet: "Jupiter", sign: "Libra", houseFromNatalLagna: 7 },
        { planet: "Venus", sign: "Taurus", houseFromNatalLagna: 5 },
      ],
      manglikStatus: "NON_MANGLIK",
      seventhLord: "Venus",
    });
    expect(t.factors.length).toBeGreaterThanOrEqual(3);
    expect(t.bestMarriageWindows.length).toBeGreaterThan(0);
    expect(t.marryNowScore).toBeGreaterThan(50);
  });

  it("pair timing never ignores weak overall bond", () => {
    const weak = predictPairTiming({
      periodsYou: periods,
      periodsThem: periods,
      overallCompatibilityScore: 38,
      decisionSummary: "Not Recommended",
      seventhLordYou: "Venus",
      seventhLordThem: "Jupiter",
    });
    expect(weak.overallTimingScore).toBeLessThanOrEqual(48);

    const strong = predictPairTiming({
      periodsYou: periods,
      periodsThem: periods,
      overallCompatibilityScore: 82,
      decisionSummary: "Very Good Match",
      seventhLordYou: "Venus",
      seventhLordThem: "Jupiter",
      gocharPlanetsYou: [
        { planet: "Jupiter", sign: "Libra", houseFromNatalLagna: 7 },
        { planet: "Venus", sign: "Taurus", houseFromNatalLagna: 1 },
      ],
    });
    expect(strong.overallTimingScore).toBeGreaterThan(weak.overallTimingScore);
    expect(strong.factors.some((f) => f.id === "bond")).toBe(true);
  });

  it("match blend uses more than Ashta alone", () => {
    const blend = scoreMatchBlend({
      moonSignA: "Cancer",
      moonSignB: "Taurus",
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
      planetsA: [
        { planet: "Venus", sign: "Taurus", house: 2 },
        { planet: "Jupiter", sign: "Cancer", house: 4 },
      ],
      planetsB: [
        { planet: "Venus", sign: "Libra", house: 7 },
        { planet: "Jupiter", sign: "Pisces", house: 9 },
      ],
    });
    expect(blend.factors.length).toBe(4);
    expect(blend.compatibilityScore).toBeGreaterThan(0);
    expect(blend.totalGuna).toBeLessThanOrEqual(36);
  });
});
