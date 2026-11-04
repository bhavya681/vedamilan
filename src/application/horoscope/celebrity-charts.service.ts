import { NotFoundError } from "@/lib/utils/error-handler";
import { CELEBRITY_CATALOG, celebrityPublicSummary } from "./celebrity-catalog";
import { horoscopeService } from "./horoscope.service";
import { hydrateStoredDasha } from "./dasha-engine";
import { buildNavamsaNorthChart } from "./chart-variants";
import { SIGNS } from "./vedic-constants";

export type CelebrityChartPayload = ReturnType<typeof celebrityPublicSummary> & {
  birthTimeLabel: string;
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

function utcDateFromIsoDay(isoDay: string) {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
}

function computeCelebrity(id: string): CelebrityChartPayload {
  const cached = chartCache.get(id);
  if (cached) return cached;

  const record = CELEBRITY_CATALOG.find((c) => c.id === id);
  if (!record) throw new NotFoundError("Celebrity chart not found");

  const natal = horoscopeService.computeNatal({
    birthDate: utcDateFromIsoDay(record.birthDate),
    birthTime: record.birthTime,
    timezone: record.timezone,
    latitude: record.latitude,
    longitude: record.longitude,
    ayanamsha: "LAHIRI",
  });
  const dasha = hydrateStoredDasha(natal.dasha);
  const chartD9 = buildNavamsaNorthChart({
    planets: natal.planets,
    lagnaSign: natal.lagnaSign,
    lagnaDegree: natal.lagnaDegree,
    lagnaLongitude: natal.lagnaLongitude,
  });
  const d9LagnaSign = (chartD9 as { referenceSign?: string }).referenceSign || natal.lagnaSign;
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

  const payload: CelebrityChartPayload = {
    ...celebrityPublicSummary(record),
    birthTimeLabel: record.timeAccuracy === "unknown" ? "Time unknown (noon)" : record.birthTime,
    lagnaSign: natal.lagnaSign,
    lagnaNakshatra: natal.lagnaNakshatra,
    lagnaDegree: natal.lagnaDegree,
    moonSign: natal.moonSign,
    moonNakshatra: natal.moonNakshatra,
    sunSign: natal.sunSign,
    yogas: [...natal.yogas]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 6)
      .map((y) => ({
        code: y.code,
        name: y.name,
        category: y.category,
        strength: y.strength,
        description: y.description,
      })),
    chartNorth: natal.chartNorth,
    chartD9,
    d9LagnaSign,
    d9Planets,
    dasha: {
      currentMaha: dasha.currentMaha,
      currentAntar: dasha.currentAntar,
    },
  };
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
