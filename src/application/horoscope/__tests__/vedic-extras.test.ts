import { describe, expect, it } from "vitest";

import { natalKootaFromMoon } from "@/application/horoscope/natal-koota";
import { computeAshtakavarga } from "@/application/horoscope/ashtakavarga";
import { insightForYoga } from "@/application/horoscope/yoga-insights";
import { buildMoonChart } from "@/application/horoscope/chart-variants";
import type { ChartPlanet } from "@/application/horoscope/chart-builder";

describe("natal koota", () => {
  it("derives varna gana nadi yoni from moon", () => {
    const profile = natalKootaFromMoon({ moonSign: "Cancer", nakshatra: "Pushya" });
    expect(profile.varna.label).toBeTruthy();
    expect(profile.gana.label).toBeTruthy();
    expect(profile.nadi.label).toBeTruthy();
    expect(profile.yoni.name).toBeTruthy();
    expect(profile.moonLord.planet).toBe("Moon");
  });
});

describe("ashtakavarga", () => {
  it("returns 12 SAV houses", () => {
    const result = computeAshtakavarga({
      lagnaSign: "Aries",
      planets: [
        { planet: "Sun", sign: "Aries", signId: 0 },
        { planet: "Moon", sign: "Cancer", signId: 3 },
        { planet: "Mars", sign: "Capricorn", signId: 9 },
        { planet: "Mercury", sign: "Taurus", signId: 1 },
        { planet: "Jupiter", sign: "Sagittarius", signId: 8 },
        { planet: "Venus", sign: "Libra", signId: 6 },
        { planet: "Saturn", sign: "Aquarius", signId: 10 },
      ],
    });
    expect(result.sarva).toHaveLength(12);
    expect(result.sarva.every((r) => r.bindus >= 0)).toBe(true);
  });
});

describe("yoga insights", () => {
  it("explains raja yoga activation", () => {
    const insight = insightForYoga({
      code: "RAJA_YOGA",
      name: "Raja Yoga",
      category: "CAREER",
      currentMaha: "Jupiter",
      currentAntar: "Venus",
    });
    expect(insight.whenActivates.length).toBeGreaterThan(10);
    expect(insight.activationNow).toMatch(/Jupiter/);
    expect(insight.exemplar.badge).toBeTruthy();
    expect(insight.exemplar.yourEdge.length).toBeGreaterThan(10);
  });
});

describe("moon chart", () => {
  it("builds north chart from moon", () => {
    const planets = [
      {
        planet: "Moon",
        sign: "Cancer",
        signId: 3,
        house: 4,
        longitude: 100,
        latitude: 0,
        speed: 12,
        isRetrograde: false,
        nakshatra: "Pushya",
        nakshatraPada: 1,
        dignity: "Own",
      },
      {
        planet: "Sun",
        sign: "Aries",
        signId: 0,
        house: 1,
        longitude: 15,
        latitude: 0,
        speed: 1,
        isRetrograde: false,
        nakshatra: "Ashwini",
        nakshatraPada: 1,
        dignity: "Exalted",
      },
    ] as ChartPlanet[];
    const chart = buildMoonChart(planets);
    expect(chart?.lagnaSignId).toBe(3);
    expect(chart?.houses["1"]?.length).toBeGreaterThanOrEqual(1);
  });
});
