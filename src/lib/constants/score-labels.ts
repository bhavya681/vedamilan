/**
 * Product distinction — discovery ranking vs deep compare.
 * Algorithms stay separate; this is information architecture only.
 * Prefer i18n keys via `compatibility.score.*` in UI.
 */
export const MATCH_SCORE = {
  labelKey: "compatibility.score.matchLabel",
  shortKey: "compatibility.score.matchShort",
  meaningKey: "compatibility.score.matchMeaning",
  detailKey: "compatibility.score.matchDetail",
  /** @deprecated English fallback — use labelKey with t() */
  label: "Match score",
  shortLabel: "Match",
  meaning: "Approx. core kundli fit for you — best chart matches appear first.",
  detail:
    "Fast Vedic preview from your kundli: Ashta Koota, Shukra Milan, Manglik harmony, and Moon element (plus a mind/temperament approx). Preferences only break ties. Open Compatibility for the full deep analysis.",
} as const;

export const COMPATIBILITY_SCORE = {
  labelKey: "compatibility.score.compatLabel",
  shortKey: "compatibility.score.compatShort",
  meaningKey: "compatibility.score.compatMeaning",
  detailKey: "compatibility.score.compatDetail",
  /** @deprecated English fallback — use labelKey with t() */
  label: "Compatibility score",
  shortLabel: "Compatibility",
  meaning: "Deep chart compare — how your minds, emotions, and life themes may align.",
  detail:
    "Full compatibility engine: Ashta Koota, Shukra Milan, and weighted relationship modules (mind, emotion, family, longevity, and more). Use this for detailed analysis beyond the discovery Match %.",
} as const;
