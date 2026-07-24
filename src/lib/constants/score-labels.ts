/**
 * Product distinction — discovery ranking vs deep compare.
 * Algorithms stay separate; this is information architecture only.
 */
export const MATCH_SCORE = {
  label: "Match score",
  shortLabel: "Match",
  meaning: "How relevant this profile is for you in discovery.",
  detail:
    "Based on your preferences and a fast Vedic blend (Ashta Koota, Shukra Milan, Manglik, Moon). It ranks who appears in recommendations — not a full relationship assessment.",
} as const;

export const COMPATIBILITY_SCORE = {
  label: "Compatibility score",
  shortLabel: "Compatibility",
  meaning: "How well your profiles and Vedic charts align in a deep compare.",
  detail:
    "From the full compatibility engine: Ashta Koota, Shukra Milan, and weighted relationship modules. Run a deep compare for the complete report.",
} as const;
