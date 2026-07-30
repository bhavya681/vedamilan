/**
 * Fast multi-factor match preview for ranking — not a substitute for deep compare.
 * Weights: Ashta Koota 45% · Shukra Milan 30% · Manglik harmony 15% · Moon element 10%.
 */
import { scoreAshtaKoota, type GunaItem } from "./ashta-koota";
import { scoreShukraMilan, type ChartPlanetLite } from "./shukra-milan";
import { SIGNS } from "@/application/horoscope/vedic-constants";

function elementOf(sign: string): "Fire" | "Earth" | "Air" | "Water" {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return (["Fire", "Earth", "Air", "Water"] as const)[i % 4] ?? "Fire";
}

function moonElementScore(signA: string, signB: string) {
  const ea = elementOf(signA);
  const eb = elementOf(signB);
  if (ea === eb) return 88;
  const friendly: Record<string, string[]> = {
    Fire: ["Air"],
    Air: ["Fire"],
    Earth: ["Water"],
    Water: ["Earth"],
  };
  if (friendly[ea]?.includes(eb)) return 78;
  return 58;
}

function manglikScore(a: string, b: string) {
  if (a === "UNKNOWN" || b === "UNKNOWN") return 70;
  if (a === b) return 90;
  if ((a === "MANGLIK" && b === "NON_MANGLIK") || (b === "MANGLIK" && a === "NON_MANGLIK")) {
    return 48;
  }
  if (a === "PARTIAL" || b === "PARTIAL") return 72;
  return 65;
}

export type MatchBlendInput = {
  moonSignA: string;
  moonSignB: string;
  nakshatraA: string;
  nakshatraB: string;
  manglikA: string;
  manglikB: string;
  planetsA?: ChartPlanetLite[];
  planetsB?: ChartPlanetLite[];
};

export type MatchBlendResult = {
  /** Approx core kundli match % for discovery ranking (not deep compatibility). */
  compatibilityScore: number;
  /** Approx mind/temperament alignment (Gana + Graha Maitri + Moon element). */
  mindApprox: number;
  totalGuna: number;
  maxGuna: number;
  gunaBreakdown: GunaItem[];
  strengths: string[];
  challenges: string[];
  strengthCodes: string[];
  challengeCodes: string[];
  factors: Array<{ name: string; score: number; weight: number }>;
};

function kootaPercent(items: GunaItem[], name: string, fallback = 70) {
  const row = items.find((g) => g.koota === name);
  if (!row || !row.max) return fallback;
  return Math.max(0, Math.min(100, Math.round((row.score / row.max) * 100)));
}

/** Mental / temperamental preview — not the deep communication module. */
export function scoreMindApprox(gunaBreakdown: GunaItem[], moonElement: number): number {
  const graha = kootaPercent(gunaBreakdown, "Graha Maitri");
  const gana = kootaPercent(gunaBreakdown, "Gana");
  return Math.max(0, Math.min(100, Math.round(graha * 0.4 + gana * 0.35 + moonElement * 0.25)));
}

export function scoreMatchBlend(input: MatchBlendInput): MatchBlendResult {
  const ashta = scoreAshtaKoota({
    moonSignA: input.moonSignA,
    moonSignB: input.moonSignB,
    nakshatraA: input.nakshatraA,
    nakshatraB: input.nakshatraB,
    manglikA: input.manglikA,
    manglikB: input.manglikB,
  });

  const shukra =
    input.planetsA?.length && input.planetsB?.length
      ? scoreShukraMilan(input.planetsA, input.planetsB)
      : null;

  const moonEl = moonElementScore(input.moonSignA, input.moonSignB);

  const factors = [
    { name: "Ashta Koota", score: ashta.overallScore, weight: 45 },
    {
      name: "Shukra Milan",
      score: shukra?.percent ?? ashta.overallScore,
      weight: 30,
    },
    {
      name: "Manglik harmony",
      score: manglikScore(input.manglikA, input.manglikB),
      weight: 15,
    },
    {
      name: "Moon element",
      score: moonEl,
      weight: 10,
    },
  ];

  const compatibilityScore = Math.max(
    0,
    Math.min(100, Math.round(factors.reduce((s, f) => s + (f.score * f.weight) / 100, 0))),
  );

  const mindApprox = scoreMindApprox(ashta.gunaBreakdown, moonEl);

  const strengths = [
    ...ashta.strengths.slice(0, 2),
    ...(shukra?.positives || []).slice(0, 1),
  ].slice(0, 3);

  const challenges = [
    ...ashta.challenges.slice(0, 2),
    ...(shukra?.challenges || []).slice(0, 1),
  ].slice(0, 3);

  const strengthCodes = ashta.strengthCodes.slice(0, 3);
  const challengeCodes = ashta.challengeCodes.slice(0, 3);

  return {
    compatibilityScore,
    mindApprox,
    totalGuna: ashta.totalGuna,
    maxGuna: ashta.maxGuna,
    gunaBreakdown: ashta.gunaBreakdown,
    strengths: strengths.length ? strengths : ashta.strengths.slice(0, 3),
    challenges,
    strengthCodes,
    challengeCodes,
    factors,
  };
}

function toPlanetsLite(horoscope: { planets?: unknown }): ChartPlanetLite[] {
  const raw = Array.isArray(horoscope.planets) ? horoscope.planets : [];
  return raw.map((item) => {
    const p = item as Record<string, unknown>;
    return {
      planet: String(p.planet || ""),
      sign: String(p.sign || "Aries"),
      house: Number(p.house || 1),
      longitude: typeof p.longitude === "number" ? p.longitude : undefined,
      isRetrograde: Boolean(p.isRetrograde),
      dignity: (p.dignity as string | null | undefined) ?? null,
      nakshatra: p.nakshatra ? String(p.nakshatra) : undefined,
    };
  });
}

export { toPlanetsLite };
