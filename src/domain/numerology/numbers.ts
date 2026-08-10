/**
 * Number → Planet knowledge system for Vedic numerology.
 *
 * Traditional association: number 1–9 maps to the nine grahas.
 * This is the single source of truth for the mapping — everything else
 * (interpretations, remedies) reads from here.
 */

import type { GrahaName, NumberId, NumberTheme } from "./types";

/** 1→Sun, 2→Moon, 3→Jupiter, 4→Rahu, 5→Mercury, 6→Venus, 7→Ketu, 8→Saturn, 9→Mars */
export const NUMEROLOGY_NUMBERS: Record<NumberId, { planet: GrahaName; theme: NumberTheme }> = {
  1: { planet: "Sun", theme: "leadership" },
  2: { planet: "Moon", theme: "emotions" },
  3: { planet: "Jupiter", theme: "wisdom" },
  4: { planet: "Rahu", theme: "innovation" },
  5: { planet: "Mercury", theme: "communication" },
  6: { planet: "Venus", theme: "harmony" },
  7: { planet: "Ketu", theme: "intuition" },
  8: { planet: "Saturn", theme: "discipline" },
  9: { planet: "Mars", theme: "courage" },
};

/** Short label shown on number profile cards. */
export const NUMBER_KEYWORDS: Record<NumberId, string> = {
  1: "Leadership",
  2: "Emotional intelligence",
  3: "Wisdom",
  4: "Unconventional thinking",
  5: "Communication",
  6: "Beauty & material harmony",
  7: "Intuition & detachment",
  8: "Discipline & endurance",
  9: "Courage & action",
};

/** A single-sentence core energy line per number. */
export const NUMBER_CORE_ENERGY: Record<NumberId, string> = {
  1: "Initiative that begins and leads.",
  2: "Balance that connects and nurtures.",
  3: "Joy that teaches and expands.",
  4: "Structure that builds and grounds.",
  5: "Movement that communicates and adapts.",
  6: "Care that harmonises and refines.",
  7: "Depth that questions and withdraws.",
  8: "Effort that endures and realigns.",
  9: "Drive that completes and protects.",
};

export function planetForNumber(n: NumberId): GrahaName {
  return NUMEROLOGY_NUMBERS[n].planet;
}

export function themeForNumber(n: NumberId): NumberTheme {
  return NUMEROLOGY_NUMBERS[n].theme;
}

export function numberForPlanet(planet: string): NumberId | null {
  const entry = Object.entries(NUMEROLOGY_NUMBERS).find(([, v]) => v.planet === planet);
  return (entry ? Number(entry[0]) : null) as NumberId | null;
}
