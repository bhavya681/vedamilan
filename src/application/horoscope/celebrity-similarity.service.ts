import {
  CELEBRITY_CATALOG,
  celebrityPublicSummary,
  type BirthTimeAccuracy,
} from "./celebrity-catalog";
import { getCelebrityChart } from "./celebrity-charts.service";
import { horoscopeService } from "./horoscope.service";
import { detectBnnPatterns } from "./bnn/bnn-patterns";
import { logger } from "@/lib/utils/logger";

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

const CLASSICAL_SET = new Set<string>(CLASSICAL_PLANETS);

export const SIMILARITY_FOCUSES = [
  "overall",
  "conjunctions",
  "placements",
  "yogas",
  "core",
] as const;
export type SimilarityFocus = (typeof SIMILARITY_FOCUSES)[number];

export type SimilarityPlanet = {
  planet: string;
  sign: string;
  signId: number;
  house: number;
  longitude: number;
  nakshatra?: string;
};

export type SimilarityChart = {
  lagnaSign: string;
  moonSign: string;
  sunSign: string;
  moonNakshatra?: string | null;
  planets: SimilarityPlanet[];
  yogas: Array<{ code: string; name?: string }>;
  timeAccuracy?: BirthTimeAccuracy;
};

export type SimilarSignal = {
  kind:
    "lagna" | "moon" | "sun" | "nakshatra" | "sign" | "house" | "conjunction" | "yoga" | "exchange";
  label: string;
  detail: string;
  points: number;
};

type SharedSignals = {
  conjunctions: string[];
  signs: string[];
  houses: string[];
  yogas: string[];
};

export type ChartSimilarityScore = {
  score: number;
  signals: SimilarSignal[];
  shared: SharedSignals;
};

export type CelebritySimilarity = ChartSimilarityScore & {
  celebrity: ReturnType<typeof celebrityPublicSummary>;
  timeAccuracy: BirthTimeAccuracy;
  reliabilityNote: string | null;
};

export type SimilarCelebritiesResult = {
  hasKundli: boolean;
  focus: SimilarityFocus;
  userChart: {
    lagnaSign: string;
    moonSign: string;
    sunSign: string;
  } | null;
  results: CelebritySimilarity[];
  scanned: number;
};

type CategoryKey = "core" | "lagna" | "signs" | "houses" | "conjunctions" | "yogas" | "exchange";

const CATEGORY_WEIGHTS: Record<SimilarityFocus, Record<CategoryKey, number>> = {
  overall: { core: 20, lagna: 8, signs: 18, houses: 8, conjunctions: 26, yogas: 14, exchange: 6 },
  conjunctions: {
    core: 6,
    lagna: 2,
    signs: 10,
    houses: 4,
    conjunctions: 58,
    yogas: 8,
    exchange: 12,
  },
  placements: {
    core: 12,
    lagna: 6,
    signs: 36,
    houses: 28,
    conjunctions: 10,
    yogas: 5,
    exchange: 3,
  },
  yogas: { core: 10, lagna: 4, signs: 6, houses: 4, conjunctions: 10, yogas: 60, exchange: 6 },
  core: { core: 56, lagna: 18, signs: 12, houses: 4, conjunctions: 4, yogas: 4, exchange: 2 },
};

function ordinal(house: number) {
  if (house === 1) return "1st";
  if (house === 2) return "2nd";
  if (house === 3) return "3rd";
  return `${house}th`;
}

function reliabilityForTime(accuracy?: BirthTimeAccuracy) {
  if (accuracy === "unknown") return 0.35;
  if (accuracy === "approximate") return 0.75;
  return 1;
}

function classicalPlanets(planets: SimilarityPlanet[]) {
  const byName = new Map<string, SimilarityPlanet>();
  for (const planet of planets) {
    if (CLASSICAL_SET.has(planet.planet) && !byName.has(planet.planet)) {
      byName.set(planet.planet, planet);
    }
  }
  return byName;
}

function conjunctionMap(planets: SimilarityPlanet[]) {
  const classical = [...classicalPlanets(planets).values()];
  const pairs = new Map<string, { label: string; sign: string }>();
  for (let i = 0; i < classical.length; i += 1) {
    for (let j = i + 1; j < classical.length; j += 1) {
      const first = classical[i]!;
      const second = classical[j]!;
      if (first.sign !== second.sign) continue;
      const names = [first.planet, second.planet].sort();
      pairs.set(names.join("+"), { label: names.join(" + "), sign: first.sign });
    }
  }
  return pairs;
}

function exchangeMap(planets: SimilarityPlanet[]) {
  const patterns = detectBnnPatterns(planets).filter((pattern) => pattern.kind === "exchange");
  return new Map(patterns.map((pattern) => [pattern.id, pattern]));
}

function yogaMap(yogas: SimilarityChart["yogas"]) {
  const byCode = new Map<string, string>();
  for (const yoga of yogas) {
    if (yoga.code && !byCode.has(yoga.code)) byCode.set(yoga.code, yoga.name || yoga.code);
  }
  return byCode;
}

/**
 * Structural kundali similarity. Planet signs and same-sign conjunctions are
 * birth-time independent; Lagna and whole-sign houses are downweighted when a
 * celebrity's birth time is unknown because those charts use local noon.
 */
export function scoreChartSimilarity(
  user: SimilarityChart,
  candidate: SimilarityChart,
  focus: SimilarityFocus = "overall",
): ChartSimilarityScore {
  const userPlanets = classicalPlanets(user.planets);
  const candidatePlanets = classicalPlanets(candidate.planets);
  const userConjunctions = conjunctionMap(user.planets);
  const candidateConjunctions = conjunctionMap(candidate.planets);
  const userExchanges = exchangeMap(user.planets);
  const candidateExchanges = exchangeMap(candidate.planets);
  const candidateYogas = yogaMap(candidate.yogas);
  const userYogas = yogaMap(user.yogas);

  const signals: SimilarSignal[] = [];
  const shared: SharedSignals = {
    conjunctions: [],
    signs: [],
    houses: [],
    yogas: [],
  };

  let corePoints = 0;
  let lagnaPoints = 0;
  let signPoints = 0;
  let housePoints = 0;
  let sharedConjunctionCount = 0;
  let sharedYogaCount = 0;
  let sharedExchangeCount = 0;

  if (user.moonSign && user.moonSign === candidate.moonSign) {
    corePoints += 14;
    signals.push({
      kind: "moon",
      label: "Moon sign",
      detail: `Moon in ${candidate.moonSign} in both charts`,
      points: 14,
    });
  }
  if (user.sunSign && user.sunSign === candidate.sunSign) {
    corePoints += 6;
    signals.push({
      kind: "sun",
      label: "Sun sign",
      detail: `Sun in ${candidate.sunSign} in both charts`,
      points: 6,
    });
  }
  if (user.moonNakshatra && user.moonNakshatra === candidate.moonNakshatra) {
    corePoints += 4;
    signals.push({
      kind: "nakshatra",
      label: "Moon nakshatra",
      detail: `Both Moon in ${candidate.moonNakshatra}`,
      points: 4,
    });
  }
  if (user.lagnaSign && user.lagnaSign === candidate.lagnaSign) {
    lagnaPoints += 18;
    signals.push({
      kind: "lagna",
      label: "Same Lagna",
      detail: `${candidate.lagnaSign} ascendant in both charts`,
      points: 18,
    });
  }

  for (const [name, userPlanet] of userPlanets) {
    const candidatePlanet = candidatePlanets.get(name);
    if (!candidatePlanet) continue;

    if (userPlanet.sign === candidatePlanet.sign) {
      signPoints += 4;
      const detail = `${name} in ${candidatePlanet.sign}`;
      signals.push({ kind: "sign", label: `${name} sign`, detail, points: 4 });
      if (shared.signs.length < 6) shared.signs.push(detail);
    }
    if (userPlanet.house === candidatePlanet.house && userPlanet.house > 0) {
      housePoints += 3;
      const detail = `${name} in ${ordinal(candidatePlanet.house)} house`;
      signals.push({ kind: "house", label: `${name} house`, detail, points: 3 });
      if (shared.houses.length < 6) shared.houses.push(detail);
    }
  }

  for (const [key, userPair] of userConjunctions) {
    const candidatePair = candidateConjunctions.get(key);
    if (!candidatePair) continue;
    sharedConjunctionCount += 1;
    const detail = `${userPair.label} conjunct (${userPair.sign}${
      userPair.sign === candidatePair.sign ? "" : ` / ${candidatePair.sign}`
    })`;
    signals.push({ kind: "conjunction", label: "Shared conjunction", detail, points: 12 });
    if (shared.conjunctions.length < 6) shared.conjunctions.push(userPair.label);
  }

  for (const [id, candidatePattern] of candidateExchanges) {
    if (!userExchanges.has(id)) continue;
    sharedExchangeCount += 1;
    signals.push({
      kind: "exchange",
      label: "Sign exchange",
      detail: candidatePattern.evidence,
      points: 8,
    });
  }

  for (const [code, name] of candidateYogas) {
    if (!userYogas.has(code)) continue;
    sharedYogaCount += 1;
    signals.push({ kind: "yoga", label: "Shared yoga", detail: name, points: 5 });
    if (shared.yogas.length < 6) shared.yogas.push(name);
  }

  const reliability = reliabilityForTime(candidate.timeAccuracy);
  const weights = CATEGORY_WEIGHTS[focus] ?? CATEGORY_WEIGHTS.overall!;
  const categories: Record<CategoryKey, { points: number; cap: number; timeSensitive: boolean }> = {
    core: { points: Math.min(24, corePoints), cap: 24, timeSensitive: false },
    lagna: { points: Math.min(18, lagnaPoints), cap: 18, timeSensitive: true },
    signs: { points: Math.min(36, signPoints), cap: 36, timeSensitive: false },
    houses: { points: Math.min(27, housePoints), cap: 27, timeSensitive: true },
    conjunctions: {
      points: sharedConjunctionCount > 0 ? 48 : 0,
      cap: 48,
      timeSensitive: false,
    },
    yogas: { points: Math.min(25, sharedYogaCount * 12.5), cap: 25, timeSensitive: false },
    exchange: { points: Math.min(16, sharedExchangeCount * 8), cap: 16, timeSensitive: false },
  };

  let score = 0;
  for (const key of Object.keys(categories) as CategoryKey[]) {
    const category = categories[key]!;
    const normalized = category.points / category.cap;
    score += normalized * weights[key] * (category.timeSensitive ? reliability : 1);
  }

  const depthBonus = Math.min(
    6,
    Math.max(0, sharedConjunctionCount - 1) * 3 + Math.max(0, sharedYogaCount - 2),
  );
  score += depthBonus;

  const focusKinds: Record<SimilarityFocus, SimilarSignal["kind"][]> = {
    overall: [],
    conjunctions: ["conjunction", "exchange"],
    placements: ["sign", "house"],
    yogas: ["yoga", "exchange"],
    core: ["lagna", "moon", "sun", "nakshatra"],
  };
  const focused = focusKinds[focus] ?? [];
  const priority = (signal: SimilarSignal) => {
    const index = focused.indexOf(signal.kind);
    return index >= 0 ? 1000 - index : 0;
  };
  signals.sort((a, b) => priority(b) - priority(a) || b.points - a.points);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    signals: signals.slice(0, 6),
    shared,
  };
}

export function reliabilityNote(accuracy: BirthTimeAccuracy) {
  if (accuracy === "unknown")
    return "Noon chart: Lagna and houses are illustrative, so they count less toward the match.";
  if (accuracy === "approximate")
    return "Approximate birth time: Lagna and houses carry reduced weight.";
  return null;
}

const ACCURACY_RANK: Record<BirthTimeAccuracy, number> = {
  published: 0,
  traditional: 1,
  approximate: 2,
  unknown: 3,
};

export type SimilarQuery = {
  focus: SimilarityFocus;
  limit: number;
  minScore: number;
};

export async function getUserSimilarityChart(userId: string) {
  const latest = await horoscopeService.getLatest(userId);
  const horoscope = latest?.horoscope;
  if (!horoscope) return null;

  const storedPlanets = Array.isArray(horoscope.planets)
    ? (horoscope.planets as unknown as SimilarityPlanet[])
    : [];
  const storedYogas = Array.isArray(horoscope.yogas)
    ? (horoscope.yogas as unknown as Array<{ code: string; name?: string }>)
    : [];
  const chart: SimilarityChart = {
    lagnaSign: String(horoscope.lagnaSign || "Aries"),
    moonSign: String(horoscope.moonSign || ""),
    sunSign: String(horoscope.sunSign || ""),
    moonNakshatra: storedPlanets.find((planet) => planet.planet === "Moon")?.nakshatra ?? null,
    planets: storedPlanets,
    yogas: storedYogas,
  };

  return {
    chart,
    basics: {
      lagnaSign: chart.lagnaSign,
      moonSign: chart.moonSign,
      sunSign: chart.sunSign,
    },
    horoscope,
  };
}

export async function findSimilarCelebrities(
  userId: string,
  query: SimilarQuery,
): Promise<SimilarCelebritiesResult> {
  const userRecord = await getUserSimilarityChart(userId);

  if (!userRecord) {
    return {
      hasKundli: false,
      focus: query.focus,
      userChart: null,
      results: [],
      scanned: 0,
    };
  }

  const { chart: user, basics } = userRecord;
  const results: CelebritySimilarity[] = [];
  for (const record of CELEBRITY_CATALOG) {
    try {
      const chart = getCelebrityChart(record.id);
      const score = scoreChartSimilarity(
        user,
        {
          lagnaSign: chart.lagnaSign,
          moonSign: chart.moonSign,
          sunSign: chart.sunSign,
          moonNakshatra: chart.moonNakshatra,
          planets: chart.planets,
          yogas: chart.yogas,
          timeAccuracy: record.timeAccuracy,
        },
        query.focus,
      );
      if (score.score < query.minScore) continue;
      results.push({
        celebrity: celebrityPublicSummary(record),
        ...score,
        timeAccuracy: record.timeAccuracy,
        reliabilityNote: reliabilityNote(record.timeAccuracy),
      });
    } catch (error) {
      logger.warn({ err: error, celebrityId: record.id }, "Skipping celebrity similarity chart");
    }
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      ACCURACY_RANK[a.timeAccuracy] - ACCURACY_RANK[b.timeAccuracy] ||
      a.celebrity.name.localeCompare(b.celebrity.name),
  );

  return {
    hasKundli: true,
    focus: query.focus,
    userChart: basics,
    results: results.slice(0, query.limit),
    scanned: results.length,
  };
}
