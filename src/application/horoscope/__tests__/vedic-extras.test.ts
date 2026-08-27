import { describe, expect, it } from "vitest";

import { natalKootaFromMoon } from "@/application/horoscope/natal-koota";
import { computeAshtakavarga } from "@/application/horoscope/ashtakavarga";
import { insightForYoga } from "@/application/horoscope/yoga-insights";
import { buildMoonChart } from "@/application/horoscope/chart-variants";
import type { ChartPlanet } from "@/application/horoscope/chart-builder";
import {
  computeShadbalaFromChart,
  digVirupas,
  type ShadbalaPlanetInput,
} from "@/application/horoscope/shadbala";
import { computePlanetStrengthFromChart } from "@/application/horoscope/planet-strength";

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
    expect(result.sarva.every((r) => r.bindus >= 0 && r.bindus <= 56)).toBe(true);
    expect(result.bhinna.Sun?.every((r) => r.bindus >= 0 && r.bindus <= 8)).toBe(true);
    const house1FromBav = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].reduce(
      (sum, planet) => sum + (result.bhinna[planet]?.[0]?.bindus ?? 0),
      0,
    );
    expect(result.sarva[0]?.bindus).toBe(house1FromBav);
    expect(result.totalBindus).toBe(337);
    expect(result.planetTotals.Sun).toBe(48);
    expect(result.planetTotals.Moon).toBe(49);
    expect(result.signSav).toHaveLength(12);
    expect(result.prashtara.Sun?.every((r) => r.bindus + r.rekhas === 8)).toBe(true);
  });

  it("moves house bindus when lagna changes (kundli-dependent, not static)", () => {
    const planets = [
      { planet: "Sun", sign: "Aries", signId: 0 },
      { planet: "Moon", sign: "Cancer", signId: 3 },
      { planet: "Mars", sign: "Capricorn", signId: 9 },
      { planet: "Mercury", sign: "Taurus", signId: 1 },
      { planet: "Jupiter", sign: "Sagittarius", signId: 8 },
      { planet: "Venus", sign: "Libra", signId: 6 },
      { planet: "Saturn", sign: "Aquarius", signId: 10 },
    ];
    const aries = computeAshtakavarga({ lagnaSign: "Aries", planets });
    const libra = computeAshtakavarga({ lagnaSign: "Libra", planets });
    expect(aries.totalBindus).toBe(337);
    expect(libra.totalBindus).toBe(337);
    expect(aries.planetTotals.Sun).toBe(48);
    expect(libra.planetTotals.Sun).toBe(48);
    expect(aries.sarva[0]?.sign).toBe("Aries");
    expect(libra.sarva[0]?.sign).toBe("Libra");
    expect(aries.sarva[0]?.bindus).not.toBe(libra.sarva[0]?.bindus);
    expect(aries.signSav[0]?.tot).not.toBe(libra.signSav[0]?.tot);
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

function grahas(
  overrides: Record<string, Partial<ShadbalaPlanetInput>> = {},
): ShadbalaPlanetInput[] {
  const base: ShadbalaPlanetInput[] = [
    {
      planet: "Sun",
      sign: "Aries",
      house: 10,
      dignity: "Exalted",
      isRetrograde: false,
      longitude: 10,
      speed: 0.98,
    },
    {
      planet: "Moon",
      sign: "Cancer",
      house: 4,
      dignity: "Own",
      isRetrograde: false,
      longitude: 100,
      speed: 13,
    },
    {
      planet: "Mars",
      sign: "Capricorn",
      house: 10,
      dignity: "Exalted",
      isRetrograde: false,
      longitude: 298,
      speed: 0.5,
    },
    {
      planet: "Mercury",
      sign: "Gemini",
      house: 1,
      dignity: "Own",
      isRetrograde: false,
      longitude: 75,
      speed: 1.2,
    },
    {
      planet: "Jupiter",
      sign: "Sagittarius",
      house: 1,
      dignity: "Own",
      isRetrograde: false,
      longitude: 250,
      speed: 0.08,
    },
    {
      planet: "Venus",
      sign: "Pisces",
      house: 4,
      dignity: "Exalted",
      isRetrograde: false,
      longitude: 357,
      speed: 1.1,
    },
    {
      planet: "Saturn",
      sign: "Libra",
      house: 7,
      dignity: "Exalted",
      isRetrograde: true,
      longitude: 200,
      speed: -0.05,
    },
  ];
  return base.map((p) => ({ ...p, ...overrides[p.planet] }));
}

describe("shadbala from kundli", () => {
  it("gives full Dig Bala in the peak house and zero in the opposite house", () => {
    expect(digVirupas("Sun", 10)).toBe(60);
    expect(digVirupas("Sun", 4)).toBe(0);
    expect(digVirupas("Saturn", 7)).toBe(60);
    expect(digVirupas("Mercury", 1)).toBeGreaterThan(digVirupas("Mercury", 7));
  });

  it("changes Dig and Uchcha when house or longitude changes", () => {
    const peak = computeShadbalaFromChart({ lagnaSign: "Aries", planets: grahas() });
    const weakSun = computeShadbalaFromChart({
      lagnaSign: "Aries",
      planets: grahas({
        Sun: { house: 4, sign: "Libra", dignity: "Debilitated", longitude: 190 },
      }),
    });
    const sunPeak = peak.planets.find((p) => p.planet === "Sun");
    const sunWeak = weakSun.planets.find((p) => p.planet === "Sun");
    const digPeak = sunPeak?.components.find((c) => c.name === "Dig")?.virupas ?? 0;
    const digWeak = sunWeak?.components.find((c) => c.name === "Dig")?.virupas ?? 0;
    const uchchaPeak = sunPeak?.sthanaParts.find((c) => c.name === "Uchcha")?.virupas ?? 0;
    const uchchaWeak = sunWeak?.sthanaParts.find((c) => c.name === "Uchcha")?.virupas ?? 0;
    expect(digPeak).toBe(60);
    expect(digWeak).toBe(0);
    expect(uchchaPeak).toBe(60);
    expect(uchchaWeak).toBe(0);
    expect(sunPeak?.virupas).toBeGreaterThan(sunWeak?.virupas ?? 0);
  });

  it("uses retrograde speed for Chesta instead of a flat flag table", () => {
    const direct = computeShadbalaFromChart({
      lagnaSign: "Aries",
      planets: grahas({ Saturn: { isRetrograde: false, speed: 0.03 } }),
    });
    const retro = computeShadbalaFromChart({
      lagnaSign: "Aries",
      planets: grahas({ Saturn: { isRetrograde: true, speed: -0.08 } }),
    });
    const chestaDirect =
      direct.planets.find((p) => p.planet === "Saturn")?.components.find((c) => c.name === "Chesta")
        ?.virupas ?? 0;
    const chestaRetro =
      retro.planets.find((p) => p.planet === "Saturn")?.components.find((c) => c.name === "Chesta")
        ?.virupas ?? 0;
    expect(chestaRetro).toBeGreaterThan(chestaDirect);
  });

  it("does not throw on sparse kundli rows and serializes to JSON", () => {
    const planets = [
      ...grahas(),
      null,
      undefined,
      { planet: "Rahu", sign: "Aries", house: 1, dignity: null, isRetrograde: true, speed: -0.04 },
      { planet: "Uranus", sign: "Aries", house: 1, dignity: null, isRetrograde: false, speed: 0 },
    ] as ShadbalaPlanetInput[];
    const lab = computeShadbalaFromChart({ lagnaSign: "Aries", planets });
    expect(lab.planets).toHaveLength(7);
    expect(() => JSON.stringify(lab)).not.toThrow();
    expect(JSON.parse(JSON.stringify(lab)).planets.length).toBe(7);
  });
});

describe("planet strength from kundli", () => {
  it("scores exalted longitude higher than debilitated longitude", () => {
    const strong = computePlanetStrengthFromChart([
      {
        planet: "Sun",
        sign: "Aries",
        house: 10,
        nakshatra: "Ashwini",
        dignity: "Exalted",
        isRetrograde: false,
        longitude: 10,
      },
    ]);
    const weak = computePlanetStrengthFromChart([
      {
        planet: "Sun",
        sign: "Libra",
        house: 6,
        nakshatra: "Chitra",
        dignity: "Debilitated",
        isRetrograde: false,
        longitude: 190,
      },
    ]);
    expect(strong.planets[0]?.score).toBeGreaterThan(weak.planets[0]?.score ?? 0);
    expect(strong.planets[0]?.nakshatraLord).toBe("Ketu");
  });
});
