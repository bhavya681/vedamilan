import { describe, expect, it } from "vitest";

import {
  detectBnnPatterns,
  matchBnnThemes,
  activateBnnThemes,
} from "@/application/horoscope/bnn/bnn-patterns";

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

function p(planet: string, sign: string, house: number) {
  return { planet, sign, house, longitude: SIGNS.indexOf(sign) * 30 + 10 };
}

describe("bnn patterns", () => {
  it("detects conjunction, depositor, exchange, and chain", () => {
    const planets = [
      p("Saturn", "Virgo", 10),
      p("Mercury", "Capricorn", 2),
      p("Sun", "Virgo", 10),
      p("Moon", "Cancer", 8),
      p("Mars", "Aries", 5),
      p("Jupiter", "Pisces", 4),
      p("Venus", "Taurus", 6),
      p("Rahu", "Aquarius", 3),
      p("Ketu", "Leo", 9),
    ];
    const patterns = detectBnnPatterns(planets);
    expect(patterns.some((x) => x.kind === "conjunction" && x.planets.includes("Saturn"))).toBe(
      true,
    );
    expect(patterns.some((x) => x.kind === "exchange")).toBe(true);
    expect(patterns.some((x) => x.kind === "depositor")).toBe(true);
    expect(patterns.some((x) => x.kind === "chain")).toBe(true);
  });

  it("does not invent a career theme without karaka + house evidence", () => {
    const planets = [
      p("Moon", "Cancer", 4),
      p("Venus", "Taurus", 2),
      p("Sun", "Leo", 5),
      p("Mars", "Aries", 1),
      p("Mercury", "Gemini", 3),
      p("Jupiter", "Pisces", 12),
      p("Saturn", "Capricorn", 8),
    ];
    const patterns = detectBnnPatterns(planets);
    const themes = matchBnnThemes(patterns, planets, "Aries");
    const career = themes.find((t) => t.theme === "career");
    expect(career).toBeUndefined();
  });

  it("fires career when Saturn occupies the 10th", () => {
    const planets = [
      p("Saturn", "Capricorn", 10),
      p("Sun", "Leo", 5),
      p("Moon", "Cancer", 4),
      p("Mars", "Aries", 1),
      p("Mercury", "Gemini", 3),
      p("Jupiter", "Sagittarius", 9),
      p("Venus", "Taurus", 2),
    ];
    const themes = matchBnnThemes(detectBnnPatterns(planets), planets, "Aries");
    expect(themes.some((t) => t.theme === "career")).toBe(true);
  });

  it("returns empty patterns for incomplete chart", () => {
    expect(detectBnnPatterns([])).toEqual([]);
    expect(matchBnnThemes([], [], "Aries")).toEqual([]);
  });

  it("marks dasha activation and no-event when lords do not touch the pattern", () => {
    const planets = [
      p("Saturn", "Capricorn", 10),
      p("Sun", "Leo", 5),
      p("Moon", "Cancer", 4),
      p("Mars", "Aries", 1),
      p("Mercury", "Gemini", 3),
      p("Jupiter", "Sagittarius", 9),
      p("Venus", "Taurus", 2),
    ];
    const hits = matchBnnThemes(detectBnnPatterns(planets), planets, "Aries");
    const on = activateBnnThemes(hits, "Saturn", "Mercury", []);
    const careerOn = on.find((a) => a.theme === "career");
    expect(careerOn?.status).toBe("activated");

    const off = activateBnnThemes(hits, "Moon", "Mars", [{ planet: "Jupiter", sign: "Pisces" }]);
    const careerOff = off.find((a) => a.theme === "career");
    expect(careerOff?.status).toBe("not-activated");
  });

  it("returns unknown activation when dasha and transit are missing", () => {
    const planets = [p("Saturn", "Capricorn", 10), p("Sun", "Leo", 5)];
    const hits = matchBnnThemes(detectBnnPatterns(planets), planets, "Aries");
    const unknown = activateBnnThemes(hits, null, null, []);
    expect(unknown.every((a) => a.status === "unknown")).toBe(true);
  });
});
