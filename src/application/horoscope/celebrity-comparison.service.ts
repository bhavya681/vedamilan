import { NotFoundError } from "@/lib/utils/error-handler";

import { CELEBRITY_CATALOG, celebrityPublicSummary } from "./celebrity-catalog";
import { getCelebrityChart } from "./celebrity-charts.service";
import { buildNorthChart, type ChartPlanet } from "./chart-builder";
import { buildNavamsaNorthChart } from "./chart-variants";
import {
  getUserSimilarityChart,
  reliabilityNote,
  scoreChartSimilarity,
  type ChartSimilarityScore,
  type SimilarityChart,
  type SimilarityFocus,
  type SimilarityPlanet,
  type SimilarSignal,
} from "./celebrity-similarity.service";
import { SIGNS } from "./vedic-constants";

const CLASSICAL_PLANETS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

export type CelebrityChartBasics = {
  lagnaSign: string;
  moonSign: string;
  sunSign: string;
  moonNakshatra: string | null;
};

export type ComparisonChartVisuals = {
  lagnaSign: string;
  d9LagnaSign: string;
  chartNorth: unknown;
  chartD9: unknown;
  sourceLabel: string;
};

export type CelebrityComparisonPlanet = {
  planet: string;
  userSign: string | null;
  celebritySign: string;
  userHouse: number | null;
  celebrityHouse: number;
  userNakshatra: string | null;
  celebrityNakshatra: string | null;
  sameSign: boolean;
  sameHouse: boolean;
};

export type CelebrityComparisonResult = {
  celebrity: ReturnType<typeof celebrityPublicSummary>;
  focus: SimilarityFocus;
  hasKundli: boolean;
  score: number | null;
  signals: SimilarSignal[];
  shared: ChartSimilarityScore["shared"] | null;
  reliabilityNote: string | null;
  userChart: CelebrityChartBasics | null;
  celebrityChart: CelebrityChartBasics;
  userVisuals: ComparisonChartVisuals | null;
  celebrityVisuals: ComparisonChartVisuals;
  planets: CelebrityComparisonPlanet[];
  yogas: {
    user: string[];
    celebrity: string[];
    shared: string[];
  };
};

function planetMap(planets: SimilarityPlanet[]) {
  const byName = new Map<string, SimilarityPlanet>();
  for (const planet of planets) {
    if (!byName.has(planet.planet)) byName.set(planet.planet, planet);
  }
  return byName;
}

function yogaNames(yogas: Array<{ code: string; name?: string }>) {
  const byCode = new Map<string, string>();
  for (const yoga of yogas) {
    if (yoga.code && !byCode.has(yoga.code)) byCode.set(yoga.code, yoga.name || yoga.code);
  }
  return byCode;
}

function numberFrom(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function signIndex(sign: string) {
  return Math.max(SIGNS.indexOf(sign as (typeof SIGNS)[number]), 0);
}

function asChartPlanet(value: unknown): ChartPlanet | null {
  if (!value || typeof value !== "object") return null;
  const planet = value as Record<string, unknown>;
  const name = typeof planet.planet === "string" ? planet.planet : "";
  if (!name) return null;
  const sign = typeof planet.sign === "string" ? planet.sign : "Aries";
  const id = numberFrom(planet.signId, signIndex(sign));
  return {
    planet: name,
    sign,
    signId: id,
    house: numberFrom(planet.house, 1),
    longitude: numberFrom(planet.longitude, id * 30 + 15),
    latitude: numberFrom(planet.latitude, 0),
    speed: numberFrom(planet.speed, 0),
    isRetrograde: Boolean(planet.isRetrograde),
    nakshatra: typeof planet.nakshatra === "string" ? planet.nakshatra : "",
    nakshatraPada: numberFrom(planet.nakshatraPada, 1),
    dignity: typeof planet.dignity === "string" ? planet.dignity : null,
  };
}

function buildUserVisuals(horoscope: unknown): ComparisonChartVisuals | null {
  if (!horoscope || typeof horoscope !== "object") return null;
  const source = horoscope as Record<string, unknown>;
  const rawPlanets = Array.isArray(source.planets) ? source.planets : [];
  const planets = rawPlanets
    .map(asChartPlanet)
    .filter((planet): planet is ChartPlanet => Boolean(planet));
  if (!planets.length) return null;

  const lagnaSign =
    typeof source.lagnaSign === "string" && source.lagnaSign ? source.lagnaSign : "Aries";
  const lagnaDegree = numberFrom(source.lagnaDegree, 0);
  const shadbala =
    source.shadbala && typeof source.shadbala === "object"
      ? (source.shadbala as Record<string, unknown>)
      : {};
  const lagnaLongitude = numberFrom(
    shadbala.lagnaLongitude,
    signIndex(lagnaSign) * 30 + lagnaDegree,
  );

  const chartNorth = buildNorthChart(planets, signIndex(lagnaSign), lagnaDegree);
  const chartD9 = buildNavamsaNorthChart({ planets, lagnaSign, lagnaDegree, lagnaLongitude });
  const d9LagnaSign = (chartD9 as { referenceSign?: string }).referenceSign || lagnaSign;
  const ayanamsha = typeof source.ayanamsha === "string" ? source.ayanamsha : "LAHIRI";

  return {
    lagnaSign,
    d9LagnaSign,
    chartNorth,
    chartD9,
    sourceLabel: `${ayanamsha} · saved kundli`,
  };
}

export async function compareCelebrityWithUser(
  userId: string,
  celebrityId: string,
  focus: SimilarityFocus = "overall",
): Promise<CelebrityComparisonResult> {
  const record = CELEBRITY_CATALOG.find((item) => item.id === celebrityId);
  if (!record) throw new NotFoundError("Celebrity chart not found");

  const celebrityChart = getCelebrityChart(record.id);
  const celebrity = celebrityPublicSummary(record);
  const celebrityBasics: CelebrityChartBasics = {
    lagnaSign: celebrityChart.lagnaSign,
    moonSign: celebrityChart.moonSign,
    sunSign: celebrityChart.sunSign,
    moonNakshatra: celebrityChart.moonNakshatra,
  };

  const celebrityVisuals: ComparisonChartVisuals = {
    lagnaSign: celebrityChart.lagnaSign,
    d9LagnaSign: celebrityChart.d9LagnaSign,
    chartNorth: celebrityChart.chartNorth,
    chartD9: celebrityChart.chartD9,
    sourceLabel:
      celebrityChart.chartSource === "traditional" ? "Traditional positions" : "Lahiri · computed",
  };

  const userRecord = await getUserSimilarityChart(userId);
  const base: CelebrityComparisonResult = {
    celebrity,
    focus,
    hasKundli: Boolean(userRecord),
    score: null,
    signals: [],
    shared: null,
    reliabilityNote: reliabilityNote(record.timeAccuracy),
    userChart: null,
    celebrityChart: celebrityBasics,
    userVisuals: userRecord ? buildUserVisuals(userRecord.horoscope) : null,
    celebrityVisuals,
    planets: [],
    yogas: { user: [], celebrity: [], shared: [] },
  };

  if (!userRecord) return base;

  const { chart: user, basics } = userRecord;
  const candidate: SimilarityChart = {
    ...celebrityBasics,
    planets: celebrityChart.planets,
    yogas: celebrityChart.yogas,
    timeAccuracy: record.timeAccuracy,
  };
  const comparison = scoreChartSimilarity(user, candidate, focus);
  const userPlanets = planetMap(user.planets);
  const celebrityPlanets = planetMap(candidate.planets);
  const userYogas = yogaNames(user.yogas);
  const celebrityYogas = yogaNames(candidate.yogas);

  const planets: CelebrityComparisonPlanet[] = CLASSICAL_PLANETS.map((name) => {
    const userPlanet = userPlanets.get(name);
    const celebrityPlanet = celebrityPlanets.get(name);
    return {
      planet: name,
      userSign: userPlanet?.sign ?? null,
      celebritySign: celebrityPlanet?.sign ?? "—",
      userHouse: userPlanet?.house ?? null,
      celebrityHouse: celebrityPlanet?.house ?? 0,
      userNakshatra: userPlanet?.nakshatra ?? null,
      celebrityNakshatra: celebrityPlanet?.nakshatra ?? null,
      sameSign: Boolean(userPlanet && celebrityPlanet && userPlanet.sign === celebrityPlanet.sign),
      sameHouse: Boolean(
        userPlanet && celebrityPlanet && userPlanet.house === celebrityPlanet.house,
      ),
    };
  });

  return {
    ...base,
    score: comparison.score,
    signals: comparison.signals,
    shared: comparison.shared,
    userChart: {
      lagnaSign: basics.lagnaSign,
      moonSign: basics.moonSign,
      sunSign: basics.sunSign,
      moonNakshatra: user.moonNakshatra ?? null,
    },
    planets,
    yogas: {
      user: [...userYogas.values()],
      celebrity: [...celebrityYogas.values()],
      shared: comparison.shared.yogas,
    },
  };
}
