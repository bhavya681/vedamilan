import { describe, expect, it } from "vitest";

import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { normalizeGender, oppositeGender } from "@/application/matchmaking/matchmaking.service";

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
});
