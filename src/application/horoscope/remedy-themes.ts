/**
 * Backward-compatible dosha remedy helpers.
 * Full Lal Kitab house/sutra engine lives in `lal-kitab.ts`.
 */

import { buildLalKitabRemedies, LAL_KITAB_DISCLAIMER } from "@/application/horoscope/lal-kitab";

export type RemedyTheme = {
  planetaryFactor: string;
  observedTheme: string;
  possibleRemedy: string;
  reason: string;
  durationPractice: string;
};

export function remediesForDoshas(
  doshas: Array<{
    code: string;
    present?: boolean;
    severity?: string | null;
    name?: string;
    notes?: string;
  }>,
): RemedyTheme[] {
  const cards = buildLalKitabRemedies({
    placements: [],
    sutras: [],
    doshas: doshas.map((d) => ({
      ...d,
      // Normalise legacy spelling
      code: d.code?.toUpperCase() === "KAAL_SARPA" ? "KALA_SARPA" : d.code,
    })),
  });
  return cards.map((c) => ({
    planetaryFactor: c.planetaryFactor,
    observedTheme: c.observedTheme,
    possibleRemedy: c.possibleRemedy,
    reason: c.reason,
    durationPractice: c.durationPractice,
  }));
}

export const REMEDY_DISCLAIMER = LAL_KITAB_DISCLAIMER;
