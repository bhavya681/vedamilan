import { longitudeToNavamsaSign } from "@/application/horoscope/navamsa";
import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import type { ChartPlanetLite } from "@/application/rules/shukra-milan";

export type NavamsaPlanet = {
  planet: string;
  sign: string;
  signId: number;
  house: number;
  dignity?: string | null;
  isRetrograde?: boolean;
};

export type NavamsaChart = {
  lagnaSign: string;
  lagnaSignId: number;
  lagnaLongitudeUsed: number;
  planets: NavamsaPlanet[];
  /** Whole-sign house lords from D9 Lagna */
  houseLords: Record<string, string>;
  /** Approximation note for consumers / AI */
  notes: string[];
};

function signIdOf(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function wholeSignHouseFromLagna(lagnaSignId: number, planetSignId: number) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

/**
 * Build a D9 (Navamsha) snapshot from D1 longitudes.
 * Lagna uses exact lagnaLongitude when available; otherwise lagnaSign × 30 + lagnaDegree.
 */
export function buildNavamsaChart(input: {
  planets: ChartPlanetLite[];
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
}): NavamsaChart {
  const notes: string[] = [];
  let lagnaLongitude = input.lagnaLongitude;
  if (typeof lagnaLongitude !== "number" || Number.isNaN(lagnaLongitude)) {
    const sid = signIdOf(input.lagnaSign);
    const deg =
      typeof input.lagnaDegree === "number" && !Number.isNaN(input.lagnaDegree)
        ? ((input.lagnaDegree % 30) + 30) % 30
        : 15;
    lagnaLongitude = sid * 30 + deg;
    notes.push(
      typeof input.lagnaDegree === "number"
        ? "D9 Lagna derived from lagna sign + degree."
        : "D9 Lagna approximated at mid-sign degree (15°) — regenerate kundli for higher precision.",
    );
  }

  const d9Lagna = longitudeToNavamsaSign(lagnaLongitude);
  const planets: NavamsaPlanet[] = [];

  for (const p of input.planets) {
    if (typeof p.longitude !== "number") {
      notes.push(`Skipped ${p.planet} in D9 — missing longitude.`);
      continue;
    }
    const d9 = longitudeToNavamsaSign(p.longitude);
    planets.push({
      planet: p.planet,
      sign: d9.sign,
      signId: d9.signId,
      house: wholeSignHouseFromLagna(d9Lagna.signId, d9.signId),
      dignity: p.dignity ?? null,
      isRetrograde: p.isRetrograde,
    });
  }

  const houseLords: Record<string, string> = {};
  for (let h = 1; h <= 12; h++) {
    const sign = SIGNS[(d9Lagna.signId + h - 1) % 12] ?? "Aries";
    houseLords[String(h)] = HOUSE_LORDS[sign];
  }

  return {
    lagnaSign: d9Lagna.sign,
    lagnaSignId: d9Lagna.signId,
    lagnaLongitudeUsed: lagnaLongitude,
    planets,
    houseLords,
    notes,
  };
}

export function planetInNavamsaHouse(chart: NavamsaChart, house: number) {
  return chart.planets.filter((p) => p.house === house);
}

export function navamsaPlanet(chart: NavamsaChart, name: string) {
  return chart.planets.find((p) => p.planet === name) || null;
}
