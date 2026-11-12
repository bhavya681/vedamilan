import type { PlanetKey, PlanetPosition } from "@/lib/services/swiss-ephemeris";
import { NotFoundError } from "@/lib/utils/error-handler";
import {
  CELEBRITY_CATALOG,
  celebrityPublicSummary,
  type CelebrityBirthRecord,
} from "./celebrity-catalog";
import { horoscopeService } from "./horoscope.service";
import { hydrateStoredDasha } from "./dasha-engine";
import { buildPlanetRows, buildNorthChart, detectYogas, type ChartPlanet } from "./chart-builder";
import { buildNavamsaNorthChart } from "./chart-variants";
import { SIGNS, longitudeToNakshatra, longitudeToSign } from "./vedic-constants";

export type CelebrityChartPayload = ReturnType<typeof celebrityPublicSummary> & {
  birthTimeLabel: string;
  chartSource: "computed" | "traditional";
  chartSourceNote: string | null;
  lagnaSign: string;
  lagnaNakshatra: string | null;
  lagnaDegree: number;
  moonSign: string;
  moonNakshatra: string | null;
  sunSign: string;
  yogas: Array<{
    code: string;
    name: string;
    category: string;
    strength: number;
    description: string;
  }>;
  chartNorth: unknown;
  chartD9: unknown;
  d9LagnaSign: string;
  d9Planets: Array<{ planet: string; sign: string; house: number }>;
  dasha: {
    currentMaha: string | null;
    currentAntar: string | null;
  };
};

const chartCache = new Map<string, CelebrityChartPayload>();

function parseIsoDay(isoDay: string) {
  const match = /^(-?\d+)-(\d{2})-(\d{2})$/.exec(isoDay);
  if (!match) return { year: 1970, month: 1, day: 1 };
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function utcDateFromIsoDay(isoDay: string) {
  const { year, month, day } = parseIsoDay(isoDay);
  return new Date(Date.UTC(year, month - 1, day));
}

function birthTimeLabel(record: CelebrityBirthRecord) {
  if (record.timeAccuracy === "unknown") return "Time unknown (noon)";
  if (record.timeAccuracy === "traditional") return `${record.birthTime} · traditional`;
  return record.birthTime;
}

function buildD9(
  planets: ChartPlanet[],
  lagnaSign: string,
  lagnaDegree: number,
  lagnaLongitude: number,
) {
  const chartD9 = buildNavamsaNorthChart({
    planets,
    lagnaSign,
    lagnaDegree,
    lagnaLongitude,
  });
  const d9LagnaSign = (chartD9 as { referenceSign?: string }).referenceSign || lagnaSign;
  const d9Planets = Object.entries(
    (chartD9 as { houses: Record<string, Array<{ planet: string; signId: number }>> }).houses,
  )
    .flatMap(([house, glyphs]) =>
      glyphs.map((glyph) => ({
        planet: glyph.planet,
        sign: SIGNS[glyph.signId] ?? "Aries",
        house: Number(house),
      })),
    )
    .sort((a, b) => a.house - b.house || a.planet.localeCompare(b.planet));
  return { chartD9, d9LagnaSign, d9Planets };
}

function sortYogas(yogas: ReturnType<typeof detectYogas>) {
  return [...yogas]
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name))
    .map((y) => ({
      code: y.code,
      name: y.name,
      category: y.category,
      strength: y.strength,
      description: y.description,
    }));
}

function computeTraditionalCelebrity(record: CelebrityBirthRecord): CelebrityChartPayload {
  const traditional = record.traditionalChart;
  if (!traditional) throw new NotFoundError("Traditional chart not found");

  const positions = Object.fromEntries(
    traditional.positions.map(({ planet, longitude }) => [
      planet.toLowerCase(),
      { longitude, latitude: 0, distance: 0, speedLongitude: 0 },
    ]),
  ) as Record<PlanetKey, PlanetPosition>;
  const planets = buildPlanetRows(positions, traditional.lagnaLongitude);
  const lagna = longitudeToSign(traditional.lagnaLongitude);
  const moon = planets.find((planet) => planet.planet === "Moon");
  const sun = planets.find((planet) => planet.planet === "Sun");
  const moonNak = moon ? longitudeToNakshatra(moon.longitude) : null;
  const d9 = buildD9(planets, lagna.sign, lagna.degreeInSign, traditional.lagnaLongitude);

  return {
    ...celebrityPublicSummary(record),
    birthTimeLabel: birthTimeLabel(record),
    chartSource: "traditional",
    chartSourceNote: traditional.sourceNote,
    lagnaSign: lagna.sign,
    lagnaNakshatra: longitudeToNakshatra(traditional.lagnaLongitude).nakshatra,
    lagnaDegree: lagna.degreeInSign,
    moonSign: moon?.sign || "Not stated",
    moonNakshatra: moonNak?.nakshatra || null,
    sunSign: sun?.sign || "Not stated",
    yogas: sortYogas(detectYogas(planets, lagna.sign)),
    chartNorth: buildNorthChart(planets, lagna.signId, lagna.degreeInSign),
    chartD9: d9.chartD9,
    d9LagnaSign: d9.d9LagnaSign,
    d9Planets: d9.d9Planets,
    dasha: { currentMaha: null, currentAntar: null },
  };
}

function computeCelebrity(id: string): CelebrityChartPayload {
  const cached = chartCache.get(id);
  if (cached) return cached;

  const record = CELEBRITY_CATALOG.find((c) => c.id === id);
  if (!record) throw new NotFoundError("Celebrity chart not found");

  let payload: CelebrityChartPayload;
  if (record.traditionalChart) {
    payload = computeTraditionalCelebrity(record);
  } else {
    const natal = horoscopeService.computeNatal({
      birthDate: utcDateFromIsoDay(record.birthDate),
      birthTime: record.birthTime,
      timezone: record.timezone,
      latitude: record.latitude,
      longitude: record.longitude,
      ayanamsha: "LAHIRI",
    });
    const dasha = hydrateStoredDasha(natal.dasha);
    const d9 = buildD9(natal.planets, natal.lagnaSign, natal.lagnaDegree, natal.lagnaLongitude);

    payload = {
      ...celebrityPublicSummary(record),
      birthTimeLabel: birthTimeLabel(record),
      chartSource: "computed",
      chartSourceNote: null,
      lagnaSign: natal.lagnaSign,
      lagnaNakshatra: natal.lagnaNakshatra,
      lagnaDegree: natal.lagnaDegree,
      moonSign: natal.moonSign,
      moonNakshatra: natal.moonNakshatra,
      sunSign: natal.sunSign,
      yogas: sortYogas(natal.yogas),
      chartNorth: natal.chartNorth,
      chartD9: d9.chartD9,
      d9LagnaSign: d9.d9LagnaSign,
      d9Planets: d9.d9Planets,
      dasha: {
        currentMaha: dasha.currentMaha,
        currentAntar: dasha.currentAntar,
      },
    };
  }

  chartCache.set(id, payload);
  return payload;
}

export function listCelebritySummaries() {
  return CELEBRITY_CATALOG.map(celebrityPublicSummary);
}

export function getCelebrityStudio(id?: string | null) {
  const celebrities = listCelebritySummaries();
  const selectedId = id && CELEBRITY_CATALOG.some((c) => c.id === id) ? id : celebrities[0]?.id;
  return {
    celebrities,
    selected: selectedId ? computeCelebrity(selectedId) : null,
  };
}
