import { describe, expect, it } from "vitest";

import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { scoreMatchBlend } from "@/application/rules/match-blend";
import { normalizeGender, oppositeGender } from "@/application/matchmaking/matchmaking.service";
import {
  compareRecommendedMatches,
  isMarriageSustainable,
  preferenceFitScore,
  rankingScore,
  recommendationTier,
  selectRecommendedMatches,
} from "@/application/matchmaking/recommendation-tiers";

describe("Module 6 — matchmaking ranking", () => {
  it("suggests opposite gender only", () => {
    expect(oppositeGender("MALE")).toBe("FEMALE");
    expect(oppositeGender("FEMALE")).toBe("MALE");
    expect(oppositeGender("male")).toBe("FEMALE");
    expect(oppositeGender("OTHER")).toBeNull();
    expect(oppositeGender("UNDISCLOSED")).toBeNull();
    expect(normalizeGender("Woman")).toBe("FEMALE");
    expect(normalizeGender("m")).toBe("MALE");
  });

  it("ranks higher Ashta Koota scores first", () => {
    const a = scoreAshtaKoota({
      moonSignA: "Cancer",
      moonSignB: "Taurus",
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    const b = scoreAshtaKoota({
      moonSignA: "Aries",
      moonSignB: "Leo",
      nakshatraA: "Ashwini",
      nakshatraB: "Magha",
      manglikA: "MANGLIK",
      manglikB: "NON_MANGLIK",
    });

    const ranked = [
      { id: "low", compatibilityScore: Math.min(a.overallScore, b.overallScore) },
      { id: "high", compatibilityScore: Math.max(a.overallScore, b.overallScore) },
    ].sort((x, y) => y.compatibilityScore - x.compatibilityScore);

    expect(ranked[0]?.id).toBe("high");
    expect(a.overallScore).toBeGreaterThanOrEqual(0);
    expect(b.overallScore).toBeGreaterThanOrEqual(0);
  });

  it("filters manglik preference deterministically", () => {
    const candidates = [
      { id: "1", manglik: "NON_MANGLIK", compatibilityScore: 70 },
      { id: "2", manglik: "MANGLIK", compatibilityScore: 90 },
      { id: "3", manglik: "PARTIAL", compatibilityScore: 80 },
    ];
    const filtered = candidates.filter((c) => c.manglik === "NON_MANGLIK");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("1");
  });

  it("applies min compatibility percentage threshold", () => {
    const candidates = [
      { id: "1", compatibilityScore: 40 },
      { id: "2", compatibilityScore: 75 },
    ];
    const filtered = candidates.filter((c) => c.compatibilityScore >= 50);
    expect(filtered.map((c) => c.id)).toEqual(["2"]);
  });

  it("core blend exposes approx match % and mind approx for discovery", () => {
    const blended = scoreMatchBlend({
      moonSignA: "Cancer",
      moonSignB: "Taurus",
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    expect(blended.compatibilityScore).toBeGreaterThan(0);
    expect(blended.compatibilityScore).toBeLessThanOrEqual(100);
    expect(blended.mindApprox).toBeGreaterThan(0);
    expect(blended.mindApprox).toBeLessThanOrEqual(100);
    expect(blended.totalGuna).toBeGreaterThan(0);
  });

  it("never lets preference boost outrank a clearly better kundli match", () => {
    const ranked = [
      { id: "pref-fit-low", compatibilityScore: 67, totalGuna: 22, preferenceFit: 100, name: "a" },
      { id: "high-score", compatibilityScore: 84, totalGuna: 28, preferenceFit: 0, name: "b" },
      { id: "mid", compatibilityScore: 72, totalGuna: 25, preferenceFit: 80, name: "c" },
    ].sort(compareRecommendedMatches);

    expect(ranked.map((r) => r.id)).toEqual(["high-score", "mid", "pref-fit-low"]);
  });

  it("among similar kundli scores, higher preference fit ranks first", () => {
    const ranked = [
      { id: "close-no-pref", compatibilityScore: 73, totalGuna: 24, preferenceFit: 10, name: "a" },
      { id: "close-pref", compatibilityScore: 72, totalGuna: 24, preferenceFit: 100, name: "b" },
    ].sort(compareRecommendedMatches);

    expect(ranked[0]?.id).toBe("close-pref");
    expect(rankingScore(80, 100)).toBeLessThan(rankingScore(85, 0));
  });

  it("scores partner-preference probability from stated criteria", () => {
    const fit = preferenceFitScore(
      {
        ageMin: 25,
        ageMax: 32,
        cities: ["Mumbai"],
        religions: ["Hindu"],
        manglikPreference: "NON_MANGLIK",
      },
      {
        age: 28,
        city: "Mumbai",
        religion: "Hindu",
        manglik: "NON_MANGLIK",
      },
    );
    const miss = preferenceFitScore(
      {
        ageMin: 25,
        ageMax: 32,
        cities: ["Mumbai"],
        religions: ["Hindu"],
      },
      {
        age: 40,
        city: "London",
        religion: "Christian",
      },
    );
    expect(fit).toBe(100);
    expect(miss).toBe(0);
    expect(preferenceFitScore(null, { age: 28 })).toBe(50);
  });
});

describe("recommendation tiers — marriage-sustainable suggestions", () => {
  it("treats 18+ Gunas as marriage-viable even when blend is not elite", () => {
    expect(isMarriageSustainable(49, 18)).toBe(true);
    expect(isMarriageSustainable(40, 17)).toBe(false);
    expect(recommendationTier(49, 18)).toBe("GOOD");
    expect(recommendationTier(72, 20)).toBe("BEST");
    expect(recommendationTier(60, 28)).toBe("STRONG");
  });

  it("prefers sustainable matches then fills so the list is not too thin", () => {
    const pool = [
      { id: "a", compatibilityScore: 74, totalGuna: 28 },
      { id: "b", compatibilityScore: 61, totalGuna: 24 },
      { id: "c", compatibilityScore: 50, totalGuna: 18 },
      { id: "d", compatibilityScore: 42, totalGuna: 14 },
      { id: "e", compatibilityScore: 38, totalGuna: 12 },
    ];
    const picked = selectRecommendedMatches(pool, { min: 4, max: 8 });
    expect(picked.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("does not drop a large sustainable pool down to a tiny elite slice", () => {
    const pool = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      compatibilityScore: 50 + (i % 20),
      totalGuna: 18 + (i % 10),
    }));
    const picked = selectRecommendedMatches(pool, { min: 36, max: 80 });
    expect(picked.length).toBeGreaterThanOrEqual(36);
    expect(picked.every((p) => isMarriageSustainable(p.compatibilityScore, p.totalGuna))).toBe(
      true,
    );
  });
});
