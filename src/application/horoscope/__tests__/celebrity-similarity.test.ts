import { describe, expect, it } from "vitest";

import { SIGNS } from "@/application/horoscope/vedic-constants";
import { scoreChartSimilarity, type SimilarityChart, type SimilarityPlanet } from "@/application/horoscope/celebrity-similarity.service";

function planet(name: string, sign: string, house: number): SimilarityPlanet {
  return {
    planet: name,
    sign,
    signId: Math.max(0, SIGNS.indexOf(sign as (typeof SIGNS)[number])),
    house,
    longitude: (Math.max(0, SIGNS.indexOf(sign as (typeof SIGNS)[number])) * 30 + 10) % 360,
    nakshatra: null,
  };
}

const user: SimilarityChart = {
  lagnaSign: "Aries",
  moonSign: "Taurus",
  sunSign: "Leo",
  moonNakshatra: "Rohini",
  yogas: [
    { code: "RAJA_YOGA", name: "Raja Yoga" },
    { code: "DHANA_YOGA", name: "Dhana Yoga" },
  ],
  planets: [
    planet("Sun", "Leo", 5),
    planet("Moon", "Taurus", 2),
    planet("Mars", "Gemini", 3),
    planet("Mercury", "Cancer", 4),
    planet("Jupiter", "Sagittarius", 9),
    planet("Venus", "Libra", 7),
    planet("Saturn", "Capricorn", 10),
    planet("Rahu", "Aquarius", 11),
    planet("Ketu", "Leo", 5),
  ],
};

function twin(overrides: Partial<SimilarityChart> = {}): SimilarityChart {
  return {
    ...user,
    timeAccuracy: "published",
    planets: user.planets.map((p) => ({ ...p })),
    yogas: user.yogas.map((y) => ({ ...y })),
    ...overrides,
  };
}

describe("scoreChartSimilarity", () => {
  it("scores an identical chart at 100 and reports the shared structure", () => {
    const result = scoreChartSimilarity(user, twin());

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.shared.conjunctions).toContain("Ketu + Sun");
    expect(result.shared.signs).toContain("Moon in Taurus");
    expect(result.shared.yogas).toContain("Raja Yoga");
    expect(result.signals.some((signal) => signal.kind === "lagna")).toBe(true);
  });

  it("reduces lagna and house weight when the celebrity birth time is unknown", () => {
    const published = scoreChartSimilarity(user, twin({ timeAccuracy: "published" }));
    const noon = scoreChartSimilarity(user, twin({ timeAccuracy: "unknown" }));

    expect(noon.score).toBeLessThan(published.score);
    expect(noon.shared.signs.length).toBeGreaterThan(0);
  });

  it("detects a shared conjunction even when the rest of the chart differs", () => {
    const candidate = twin({
      lagnaSign: "Pisces",
      moonSign: "Aries",
      sunSign: "Virgo",
      moonNakshatra: "Ashwini",
      yogas: [],
      planets: [
        planet("Sun", "Leo", 5),
        planet("Ketu", "Leo", 5),
        planet("Moon", "Aries", 1),
        planet("Mars", "Taurus", 2),
        planet("Mercury", "Gemini", 3),
        planet("Jupiter", "Cancer", 4),
        planet("Venus", "Virgo", 6),
        planet("Saturn", "Libra", 7),
        planet("Rahu", "Scorpio", 8),
      ],
    });

    const result = scoreChartSimilarity(user, candidate, "conjunctions");

    expect(result.shared.conjunctions).toEqual(["Ketu + Sun"]);
    expect(result.signals.some((signal) => signal.kind === "conjunction")).toBe(true);
    expect(result.signals[0]?.kind).toBe("conjunction");
  });

  it("prioritizes yoga overlap under the yoga focus", () => {
    const candidate = twin({
      lagnaSign: "Pisces",
      moonSign: "Aries",
      sunSign: "Virgo",
      moonNakshatra: "Ashwini",
      planets: [
        planet("Sun", "Virgo", 6),
        planet("Moon", "Aries", 1),
        planet("Mars", "Taurus", 2),
        planet("Mercury", "Gemini", 3),
        planet("Jupiter", "Cancer", 4),
        planet("Venus", "Leo", 5),
        planet("Saturn", "Libra", 7),
        planet("Rahu", "Scorpio", 8),
        planet("Ketu", "Sagittarius", 9),
      ],
      yogas: [
        { code: "RAJA_YOGA", name: "Raja Yoga" },
        { code: "DHANA_YOGA", name: "Dhana Yoga" },
        { code: "BUDHADITYA", name: "Budhaditya" },
        { code: "GAJAKESARI", name: "Gaja Kesari" },
        { code: "PARIVARTANA", name: "Parivartana" },
      ],
    });

    const yogaFocus = scoreChartSimilarity(user, candidate, "yogas");
    const overall = scoreChartSimilarity(user, candidate, "overall");

    expect(yogaFocus.score).toBeGreaterThan(overall.score);
    expect(yogaFocus.signals[0]?.kind).toBe("yoga");
  });
});
