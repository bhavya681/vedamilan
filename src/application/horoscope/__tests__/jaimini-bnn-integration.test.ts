import { describe, expect, it } from "vitest";

import { computeCharaKarakas } from "@/application/horoscope/jaimini/chara-karaka";
import { interpretDarakaraka } from "@/application/horoscope/jaimini/jaimini-interpreter";
import { detectBnnPatterns, matchBnnThemes } from "@/application/horoscope/bnn/bnn-patterns";

const SAMPLE = [
  { planet: "Sun", sign: "Aries", house: 1, longitude: 15, isRetrograde: false },
  { planet: "Moon", sign: "Taurus", house: 2, longitude: 52, isRetrograde: false },
  { planet: "Mars", sign: "Gemini", house: 3, longitude: 68, isRetrograde: false },
  { planet: "Mercury", sign: "Cancer", house: 4, longitude: 118, isRetrograde: false },
  { planet: "Jupiter", sign: "Leo", house: 5, longitude: 123, isRetrograde: false },
  { planet: "Venus", sign: "Virgo", house: 6, longitude: 161, isRetrograde: false },
  { planet: "Saturn", sign: "Libra", house: 7, longitude: 205, isRetrograde: false },
];

describe("kundli snapshot → jaimini + bnn + marriage layers", () => {
  it("computes karakas from stored-style planet rows", () => {
    const karakas = computeCharaKarakas(SAMPLE);
    expect(karakas.byCode.AK?.planet).toBe("Mercury");
    expect(karakas.byCode.DK?.planet).toBe("Jupiter");
    const dara = interpretDarakaraka(karakas, SAMPLE, "Aries", {
      lagnaDegree: 12,
      lagnaLongitude: 12,
    });
    expect(dara?.seventhHouse.seventhSign).toBe("Libra");
    expect(dara?.seventhHouse.dkInSeventh).toBe(false);
  });

  it("feeds the same snapshot into BNN with evidence-backed themes only", () => {
    const themes = matchBnnThemes(detectBnnPatterns(SAMPLE), SAMPLE, "Aries");
    expect(themes.every((t) => t.patterns.length > 0)).toBe(true);
    expect(themes.find((t) => t.theme === "relationships")).toBeDefined();
    const career = themes.find((t) => t.theme === "career");
    if (career) {
      expect(career.planets.some((p) => ["Saturn", "Sun", "Mercury"].includes(p))).toBe(true);
    }
  });
});
