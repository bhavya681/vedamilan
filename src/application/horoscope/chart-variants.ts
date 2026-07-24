import { SIGNS } from "@/application/horoscope/vedic-constants";
import {
  buildNorthChart,
  type ChartPlanet,
  type ChartPlanetGlyph,
} from "@/application/horoscope/chart-builder";
import { buildNavamsaChart } from "@/application/horoscope/navamsa-chart";

function signIdOf(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function degreeInSign(longitude: number) {
  const x = ((longitude % 30) + 30) % 30;
  return x;
}

/**
 * Rebuild a North Indian whole-sign chart counting houses from a chosen lagna sign
 * (Moon chart, Sun chart, etc.) using stored D1 planet rashis.
 */
export function buildChartFromLagnaSign(planets: ChartPlanet[], lagnaSign: string, label: string) {
  const lagnaSignId = signIdOf(lagnaSign);
  const lagnaPlanet = planets.find((p) => p.signId === lagnaSignId);
  const lagnaDegree = lagnaPlanet ? degreeInSign(lagnaPlanet.longitude) : 15;
  const chart = buildNorthChart(planets, lagnaSignId, lagnaDegree);
  return {
    ...chart,
    lagnaLabel: `${label} ${Math.floor(lagnaDegree)}°`,
    reference: label,
    referenceSign: lagnaSign,
  };
}

export function buildMoonChart(planets: ChartPlanet[]) {
  const moon = planets.find((p) => p.planet === "Moon");
  if (!moon) return null;
  return buildChartFromLagnaSign(planets, moon.sign, "Moon Lagna");
}

export function buildSunChart(planets: ChartPlanet[]) {
  const sun = planets.find((p) => p.planet === "Sun");
  if (!sun) return null;
  return buildChartFromLagnaSign(planets, sun.sign, "Sun Lagna");
}

/** D9 Navamsha as a North Indian house map from D9 Lagna. */
export function buildNavamsaNorthChart(input: {
  planets: ChartPlanet[];
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
}) {
  const d9 = buildNavamsaChart({
    planets: input.planets.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      longitude: p.longitude,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
    })),
    lagnaSign: input.lagnaSign,
    lagnaDegree: input.lagnaDegree,
    lagnaLongitude: input.lagnaLongitude,
  });

  const asD1Style: ChartPlanet[] = d9.planets.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    signId: p.signId,
    house: p.house,
    longitude: p.signId * 30 + 15,
    latitude: 0,
    speed: 0,
    isRetrograde: Boolean(p.isRetrograde),
    nakshatra: "",
    nakshatraPada: 1,
    dignity: p.dignity ?? null,
  }));

  const chart = buildNorthChart(asD1Style, d9.lagnaSignId, 15);
  return {
    ...chart,
    lagnaLabel: `D9 Asc ${d9.lagnaSign}`,
    reference: "Navamsha (D9)",
    referenceSign: d9.lagnaSign,
    notes: d9.notes,
  };
}

export type VariantChart = ReturnType<typeof buildChartFromLagnaSign> & {
  notes?: string[];
};

export type { ChartPlanetGlyph };
