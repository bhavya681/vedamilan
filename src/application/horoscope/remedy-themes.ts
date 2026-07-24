/**
 * Deterministic remedial themes keyed by stored dosha codes.
 * Not medical advice. Not AI-invented. Only shown when the chart engine flags the dosha.
 */
export type RemedyTheme = {
  planetaryFactor: string;
  observedTheme: string;
  possibleRemedy: string;
  reason: string;
  durationPractice: string;
};

const DOSHA_REMEDY_MAP: Record<string, RemedyTheme> = {
  MANGLIK: {
    planetaryFactor: "Mars (Mangal) influence on marriage houses",
    observedTheme: "Partnership timing and assertiveness themes",
    possibleRemedy:
      "Tuesday discipline — service, fasting tradition, or constructive physical routine",
    reason: "Classical Manglik literature links Mars heat with partnership friction when unaided",
    durationPractice:
      "Ongoing weekly practice; review with a qualified astrologer for personalization",
  },
  KAAL_SARPA: {
    planetaryFactor: "Rahu–Ketu axis enclosing planets",
    observedTheme: "Intensity, delayed clarity, or transformative life chapters",
    possibleRemedy:
      "Steady spiritual routine — mantra, meditation, or charity on Rahu/Ketu weekdays",
    reason:
      "Traditional Kaal Sarp guidance emphasizes grounding and patience over fear-based rituals",
    durationPractice: "Consistent daily practice for 40–90 days, then reassess with chart context",
  },
  PITRA: {
    planetaryFactor: "Ancestral / Pitra dosha indicators",
    observedTheme: "Family continuity and unresolved lineage themes",
    possibleRemedy: "Respectful ancestral remembrance, charity, or elder-care service",
    reason: "Pitra themes in classical notes stress gratitude and duty toward lineage",
    durationPractice: "Monthly remembrance practice aligned with family tradition",
  },
};

export function remediesForDoshas(
  doshas: Array<{ code: string; present?: boolean; severity?: string | null }>,
): RemedyTheme[] {
  const out: RemedyTheme[] = [];
  for (const d of doshas) {
    if (!d.present) continue;
    const theme = DOSHA_REMEDY_MAP[d.code.toUpperCase()] || DOSHA_REMEDY_MAP[d.code];
    if (theme) out.push(theme);
  }
  return out;
}

export const REMEDY_DISCLAIMER =
  "Traditional Lal Kitab–inspired and classical remedial themes for reflection only. Not medical, legal, or financial advice. Never invent remedies beyond engine-flagged factors.";
