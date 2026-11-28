import { describe, expect, it, vi } from "vitest";

vi.mock("@/application/horoscope/celebrity-charts.service", () => ({
  getCelebrityChart: vi.fn(),
}));

vi.mock("@/application/horoscope/horoscope.service", () => ({
  horoscopeService: { getLatest: vi.fn() },
}));

import { CELEBRITY_CATALOG } from "../celebrity-catalog";
import { compareCelebrityWithUser } from "../celebrity-comparison.service";
import { getCelebrityChart } from "../celebrity-charts.service";
import { horoscopeService } from "../horoscope.service";

function planet(name: string, sign: string, signId: number, house: number) {
  return {
    planet: name,
    sign,
    signId,
    house,
    longitude: signId * 30 + 10,
    nakshatra: name === "Moon" ? "Rohini" : null,
  };
}

const planets = [
  planet("Sun", "Virgo", 5, 5),
  planet("Moon", "Taurus", 1, 2),
  planet("Mars", "Gemini", 2, 3),
  planet("Mercury", "Cancer", 3, 4),
  planet("Jupiter", "Sagittarius", 8, 9),
  planet("Venus", "Libra", 6, 7),
  planet("Saturn", "Capricorn", 9, 10),
  planet("Rahu", "Aquarius", 10, 11),
  planet("Ketu", "Leo", 4, 5),
];

const yogas = [{ code: "RAJA_YOGA", name: "Raja Yoga" }];

function mockCelebrityChart() {
  vi.mocked(getCelebrityChart).mockReturnValue({
    id: "warren-buffett",
    name: "Warren Buffett",
    field: "Investing",
    category: "Finance",
    birthDate: "1930-08-30",
    place: "Omaha, Nebraska",
    timeAccuracy: "unknown",
    note: null,
    imageUrl: null,
    lagnaSign: "Aries",
    lagnaNakshatra: "Ashwini",
    lagnaDegree: 5,
    moonSign: "Taurus",
    moonNakshatra: "Rohini",
    sunSign: "Virgo",
    yogas: yogas.map((yoga) => ({ ...yoga, category: "Raja Yoga", strength: 80, description: "" })),
    chartNorth: {},
    chartD9: {},
    d9LagnaSign: "Aries",
    d9Planets: [],
    planets,
    dasha: { currentMaha: null, currentAntar: null },
  } as never);
}

describe("celebrity-vs-user chart comparison", () => {
  it("keeps every catalog id unique and includes the finance legends", () => {
    const ids = CELEBRITY_CATALOG.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const name of ["Charlie Munger", "Benjamin Graham", "John C. Bogle", "Naval Ravikant"]) {
      expect(CELEBRITY_CATALOG.some((record) => record.name === name)).toBe(true);
    }
  });

  it("reports a structural score and side-by-side placements for a saved kundli", async () => {
    mockCelebrityChart();
    vi.mocked(horoscopeService.getLatest).mockResolvedValue({
      horoscope: {
        lagnaSign: "Aries",
        moonSign: "Taurus",
        sunSign: "Virgo",
        planets,
        yogas,
      },
    } as never);

    const result = await compareCelebrityWithUser("user-1", "warren-buffett");

    expect(result.hasKundli).toBe(true);
    expect(result.score).toBeGreaterThan(0);
    expect(result.planets.find((item) => item.planet === "Moon")?.sameSign).toBe(true);
    expect(result.yogas.shared).toContain("Raja Yoga");
    expect(result.celebrityChart.lagnaSign).toBe("Aries");
    expect(result.celebrityVisuals.d9LagnaSign).toBe("Aries");
    expect(result.userVisuals?.lagnaSign).toBe("Aries");
    expect(result.userVisuals?.d9LagnaSign).toBeTruthy();
  });

  it("returns an empty comparison when the user has no kundli", async () => {
    mockCelebrityChart();
    vi.mocked(horoscopeService.getLatest).mockResolvedValue(null);

    const result = await compareCelebrityWithUser("user-1", "warren-buffett");

    expect(result.hasKundli).toBe(false);
    expect(result.score).toBeNull();
    expect(result.planets).toEqual([]);
  });
});
