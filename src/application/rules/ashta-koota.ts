import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";

export type GunaItem = {
  koota: string;
  score: number;
  max: number;
  note: string;
};

export type CompatibilityInput = {
  moonSignA: string;
  moonSignB: string;
  nakshatraA: string;
  nakshatraB: string;
  manglikA: string;
  manglikB: string;
};

function signIndex(sign: string): number {
  const idx = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return idx >= 0 ? idx : 0;
}

function nakIndex(name: string): number {
  const idx = NAKSHATRAS.indexOf(name as (typeof NAKSHATRAS)[number]);
  return idx >= 0 ? idx : 0;
}

/** Classical-inspired deterministic Ashta Koota scoring (rule engine — not AI). */
export function scoreAshtaKoota(input: CompatibilityInput): {
  gunaBreakdown: GunaItem[];
  totalGuna: number;
  maxGuna: number;
  nadiDosha: boolean;
  bhakootDosha: boolean;
  manglikCompatibility: string;
  overallScore: number;
  strengths: string[];
  challenges: string[];
} {
  const sA = signIndex(input.moonSignA);
  const sB = signIndex(input.moonSignB);
  const nA = nakIndex(input.nakshatraA);
  const nB = nakIndex(input.nakshatraB);
  const diff = Math.abs(sA - sB);
  const circ = Math.min(diff, 12 - diff);

  // Varna (1) — simplified by moon sign element class
  const varnaRank = [1, 2, 3, 4] as const;
  const varnaOf = (i: number) => varnaRank[i % 4] ?? 1;
  const varnaScore = varnaOf(sA) >= varnaOf(sB) ? 1 : 0;

  // Vashya (2)
  const vashyaScore = circ <= 3 ? 2 : circ <= 5 ? 1 : 0;

  // Tara (3) — count from A to B in nakshatra wheel
  const taraCount = ((nB - nA + 27) % 27) + 1;
  const taraGroup = ((taraCount - 1) % 9) + 1;
  const taraScore = [1, 2, 4, 6, 8, 9].includes(taraGroup)
    ? 3
    : taraGroup === 3 || taraGroup === 5
      ? 1.5
      : 0;

  // Yoni (4) — pair friendliness by nakshatra mod
  const yoniScore = nA % 7 === nB % 7 ? 4 : Math.abs((nA % 7) - (nB % 7)) <= 2 ? 3 : 2;

  // Graha Maitri (5) — moon sign lords friendship
  const lords = [
    "Mars",
    "Venus",
    "Mercury",
    "Moon",
    "Sun",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Saturn",
    "Jupiter",
  ];
  const lordA = lords[sA] ?? "Mars";
  const lordB = lords[sB] ?? "Mars";
  const friends: Record<string, string[]> = {
    Sun: ["Moon", "Mars", "Jupiter"],
    Moon: ["Sun", "Mercury"],
    Mars: ["Sun", "Moon", "Jupiter"],
    Mercury: ["Sun", "Venus"],
    Jupiter: ["Sun", "Moon", "Mars"],
    Venus: ["Mercury", "Saturn"],
    Saturn: ["Mercury", "Venus"],
  };
  const grahaScore =
    lordA === lordB
      ? 5
      : (friends[lordA]?.includes(lordB) ?? false)
        ? 4
        : (friends[lordB]?.includes(lordA) ?? false)
          ? 3
          : 1;

  // Gana (6) — Deva/Manushya/Rakshasa by nakshatra groups
  const gana = (i: number) => (i % 3 === 0 ? "D" : i % 3 === 1 ? "M" : "R");
  const gA = gana(nA);
  const gB = gana(nB);
  const ganaScore =
    gA === gB ? 6 : (gA === "D" && gB === "M") || (gA === "M" && gB === "D") ? 5 : 1;

  // Bhakoot (7)
  const bhakootHostile = circ === 2 || circ === 5 || circ === 6;
  const bhakootScore = bhakootHostile ? 0 : 7;
  const bhakootDosha = bhakootHostile;

  // Nadi (8)
  const nadiA = nA % 3;
  const nadiB = nB % 3;
  const nadiDosha = nadiA === nadiB;
  const nadiScore = nadiDosha ? 0 : 8;

  const gunaBreakdown: GunaItem[] = [
    { koota: "Varna", score: varnaScore, max: 1, note: "Spiritual temperament alignment." },
    { koota: "Vashya", score: vashyaScore, max: 2, note: "Mutual influence balance." },
    { koota: "Tara", score: taraScore, max: 3, note: "Birth-star harmony." },
    { koota: "Yoni", score: yoniScore, max: 4, note: "Instinctive comfort." },
    { koota: "Graha Maitri", score: grahaScore, max: 5, note: "Mental friendship of Moon lords." },
    { koota: "Gana", score: ganaScore, max: 6, note: "Temperament pairing." },
    {
      koota: "Bhakoot",
      score: bhakootScore,
      max: 7,
      note: bhakootDosha ? "Relative Moon signs need care." : "Relative Moon signs supportive.",
    },
    {
      koota: "Nadi",
      score: nadiScore,
      max: 8,
      note: nadiDosha ? "Same Nadi indicated." : "No Nadi dosha indicated.",
    },
  ];

  const totalGuna = Number(gunaBreakdown.reduce((sum, item) => sum + item.score, 0).toFixed(1));

  let manglikCompatibility = "Compatible";
  if (input.manglikA === "MANGLIK" && input.manglikB === "NON_MANGLIK") {
    manglikCompatibility = "Needs review";
  } else if (input.manglikA === "MANGLIK" && input.manglikB === "MANGLIK") {
    manglikCompatibility = "Both Manglik — traditionally neutralizing";
  } else if (input.manglikA === "PARTIAL" || input.manglikB === "PARTIAL") {
    manglikCompatibility = "Partial Manglik — soft review";
  }

  const strengths: string[] = [];
  const challenges: string[] = [];
  for (const item of gunaBreakdown) {
    if (item.score / item.max >= 0.75) strengths.push(`${item.koota} is strong`);
    if (item.score === 0) challenges.push(`${item.koota} needs attention`);
  }
  if (manglikCompatibility !== "Compatible") challenges.push(`Manglik: ${manglikCompatibility}`);

  const overallScore = Math.round((totalGuna / 36) * 100);

  return {
    gunaBreakdown,
    totalGuna,
    maxGuna: 36,
    nadiDosha,
    bhakootDosha,
    manglikCompatibility,
    overallScore,
    strengths,
    challenges,
  };
}

export function pairKey(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join(":");
}
