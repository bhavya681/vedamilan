/**
 * Numerology-based compatibility scoring.
 *
 * This module provides a deterministic scoring function that compares two
 * people's Mulank (Birth Root Number) and Bhagyank (Life Path / Destiny Number)
 * to produce a 0–100 harmony score and a qualitative insight.
 *
 * Design principles:
 * - Numerology complements the Vedic astrological compatibility system; it
 *   never replaces planetary-based matching.
 * - Scoring is grounded in the number → planet mapping defined in the domain
 *   layer (1→Sun, 2→Moon, 3→Jupiter, 4→Rahu, 5→Mercury, 6→Venus,
 *   7→Ketu, 8→Saturn, 9→Mars).
 * - Planet-pair scores use traditional Vedic planetary friendship relationships
 *   (natural benefic / neutral / challenging), not invented doctrines.
 * - Every pair score and insight is derived from existing knowledge base data
 *   (NUMEROLOGY_NUMBERS, NUMBER_PROFILES, getCombinationOrGeneric).
 */

import { NUMEROLOGY_NUMBERS, NUMBER_PROFILES, getCombinationOrGeneric } from "@/domain/numerology";
import type { GrahaName, NumberId } from "@/domain/numerology";

/** Planet → element classification (Vedic tradition). */
const PLANET_ELEMENT: Record<GrahaName, "Fire" | "Earth" | "Air" | "Water"> = {
  Sun: "Fire",
  Moon: "Water",
  Jupiter: "Air",
  Rahu: "Earth",
  Mercury: "Air",
  Venus: "Water",
  Ketu: "Air",
  Saturn: "Earth",
  Mars: "Fire",
};

/** Vedic planetary friendship scores (0–100) for each ordered pair. */
const PLANET_HARMONY: Record<GrahaName, Record<GrahaName, number>> = {
  Sun: {
    Sun: 100,
    Moon: 90,
    Jupiter: 85,
    Mars: 75,
    Mercury: 70,
    Venus: 45,
    Saturn: 40,
    Rahu: 60,
    Ketu: 55,
  },
  Moon: {
    Sun: 90,
    Moon: 100,
    Jupiter: 85,
    Mercury: 80,
    Venus: 75,
    Mars: 70,
    Saturn: 60,
    Rahu: 65,
    Ketu: 55,
  },
  Jupiter: {
    Sun: 85,
    Moon: 85,
    Jupiter: 100,
    Venus: 80,
    Mercury: 75,
    Mars: 70,
    Saturn: 60,
    Ketu: 65,
    Rahu: 55,
  },
  Mars: {
    Sun: 75,
    Moon: 70,
    Jupiter: 70,
    Mars: 100,
    Saturn: 65,
    Mercury: 60,
    Venus: 50,
    Rahu: 55,
    Ketu: 45,
  },
  Mercury: {
    Moon: 80,
    Jupiter: 75,
    Mercury: 100,
    Venus: 75,
    Saturn: 70,
    Sun: 70,
    Mars: 60,
    Rahu: 65,
    Ketu: 55,
  },
  Venus: {
    Mercury: 75,
    Jupiter: 80,
    Venus: 100,
    Moon: 70,
    Saturn: 60,
    Mars: 50,
    Sun: 45,
    Rahu: 55,
    Ketu: 45,
  },
  Saturn: {
    Mars: 65,
    Mercury: 70,
    Venus: 60,
    Saturn: 100,
    Jupiter: 50,
    Moon: 50,
    Sun: 40,
    Rahu: 75,
    Ketu: 45,
  },
  Rahu: {
    Saturn: 75,
    Mars: 65,
    Mercury: 65,
    Venus: 55,
    Rahu: 100,
    Jupiter: 50,
    Moon: 45,
    Sun: 50,
    Ketu: 70,
  },
  Ketu: {
    Jupiter: 65,
    Sun: 55,
    Moon: 55,
    Ketu: 100,
    Saturn: 45,
    Mars: 45,
    Mercury: 45,
    Venus: 40,
    Rahu: 70,
  },
};

/** Element compatibility modifier (added on top of planet harmony). */
function elementModifier(a: GrahaName, b: GrahaName): number {
  const ea = PLANET_ELEMENT[a];
  const eb = PLANET_ELEMENT[b];
  if (ea === eb) return 10;
  const friendly: Record<string, string[]> = {
    Fire: ["Air"],
    Air: ["Fire"],
    Earth: ["Water"],
    Water: ["Earth"],
  };
  if (friendly[ea]?.includes(eb)) return 5;
  return -5;
}

/** Score a single planet pair (0–100). */
function planetPairScore(a: GrahaName, b: GrahaName): number {
  const base = PLANET_HARMONY[a]?.[b] ?? 50;
  return Math.max(0, Math.min(100, base + elementModifier(a, b)));
}

/**
 * Score the resonance between two numbers on the 1–9 scale.
 * 100 = identical, scales down with planetary distance.
 */
function numberResonance(n1: NumberId, n2: NumberId): number {
  if (n1 === n2) return 100;
  const p1 = NUMEROLOGY_NUMBERS[n1].planet;
  const p2 = NUMEROLOGY_NUMBERS[n2].planet;
  return planetPairScore(p1, p2);
}

/**
 * Evaluate a single person's Mulank+Bhagyank combination quality.
 * Returns a score 0–25 based on whether the combination is well-defined.
 */
function combinationQuality(mulank: NumberId, bhagyank: NumberId): number {
  const combo = getCombinationOrGeneric(mulank, bhagyank);
  if (combo.defined) return 25;
  if (combo.interaction) return 18;
  return 10;
}

/** Generate a human-readable insight from the overall score. */
function insightFromScore(score: number): string {
  if (score >= 80) {
    return "Strong numerological harmony — your birth numbers create a reinforcing, complementary dynamic that naturally supports connection.";
  }
  if (score >= 65) {
    return "Good complementarity — your numbers balance each other, with different strengths that reinforce the partnership.";
  }
  if (score >= 45) {
    return "Moderate alignment — your numbers have some natural ease but also notable differences that benefit from conscious awareness.";
  }
  return "Differing numerological paths — the contrast between your numbers can be creative or challenging; awareness of these differences helps bridge gaps.";
}

export interface NumerologyCompatibilityInput {
  mulankA: NumberId;
  bhagyankA: NumberId;
  mulankB: NumberId;
  bhagyankB: NumberId;
}

/**
 * Score numerological compatibility between two people.
 *
 * Scoring phases (each 0–100, then weighted):
 * 1. Number resonance (50%): compares Mulank↔Bhagyank pairs across both people
 * 2. Planet harmony (30%): element + planetary friendship scores for the four number pairs
 * 3. Combination quality (20%): whether each person's own Mulank+Bhagyank is well-defined
 */
export function scoreNumerologyCompatibility(input: NumerologyCompatibilityInput): {
  score: number;
  insight: string;
  isHarmonious: boolean;
  pairNotes: Array<{ pair: string; score: number; description: string }>;
} {
  const { mulankA, bhagyankA, mulankB, bhagyankB } = input;

  const planetA = NUMEROLOGY_NUMBERS[mulankA].planet;
  const planetB = NUMEROLOGY_NUMBERS[bhagyankA].planet;
  const planetC = NUMEROLOGY_NUMBERS[mulankB].planet;
  const planetD = NUMEROLOGY_NUMBERS[bhagyankB].planet;

  // Phase 1: Number resonance (40%)
  const pairs: Array<{
    pair: string;
    score: number;
    description: string;
    weight: number;
  }> = [];

  const aa = numberResonance(mulankA, mulankB);
  pairs.push({
    pair: "Mulank–Mulank",
    score: aa,
    description: `${NUMBER_PROFILES[mulankA].planet} (${mulankA}) vs ${NUMBER_PROFILES[mulankB].planet} (${mulankB}) — core identity energy.`,
    weight: 25,
  });

  const bb = numberResonance(bhagyankA, bhagyankB);
  pairs.push({
    pair: "Bhagyank–Bhagyank",
    score: bb,
    description: `${NUMBER_PROFILES[bhagyankA].planet} (${bhagyankA}) vs ${NUMBER_PROFILES[bhagyankB].planet} (${bhagyankB}) — life-path energy.`,
    weight: 25,
  });

  const ab = numberResonance(mulankA, bhagyankB);
  pairs.push({
    pair: "A Mulank ↔ B Bhagyank",
    score: ab,
    description: `Your Birth Root (${NUMBER_PROFILES[mulankA].planet}) meets their Destiny (${NUMBER_PROFILES[bhagyankB].planet}).`,
    weight: 35,
  });

  const ba = numberResonance(bhagyankA, mulankB);
  pairs.push({
    pair: "A Bhagyank ↔ B Mulank",
    score: ba,
    description: `Your Destiny (${NUMBER_PROFILES[bhagyankA].planet}) meets their Birth Root (${NUMBER_PROFILES[mulankB].planet}).`,
    weight: 15,
  });

  const resonanceScore = Math.round((aa * 25 + bb * 25 + ab * 35 + ba * 15) / 100);

  // Phase 2: Combination quality (30%)
  const comboA = combinationQuality(mulankA, bhagyankA);
  const comboB = combinationQuality(mulankB, bhagyankB);
  const comboScore = Math.round((comboA + comboB) / 2);

  // Phase 3: Planet harmony (30%)
  const planetHarmony = Math.round(
    (planetPairScore(planetA, planetC) +
      planetPairScore(planetB, planetD) +
      planetPairScore(planetA, planetD) +
      planetPairScore(planetB, planetC)) /
      4,
  );

  const score = Math.round(resonanceScore * 0.5 + planetHarmony * 0.3 + comboScore * 0.2);

  const pairNotes = pairs.map((p) => ({
    pair: p.pair,
    score: p.score,
    description: p.description,
  }));

  return {
    score,
    insight: insightFromScore(score),
    isHarmonious: score >= 50,
    pairNotes,
  };
}
