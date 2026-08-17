/**
 * Documented BNN (Bhrigu Nandi Nadi) pattern rules.
 *
 * Only structural patterns that are widely taught in BNN (R.G. Rao school):
 * - planets in the same sign "speak together" (conjunction)
 * - a planet occupying another planet's rashi "gives results through" that depositor
 * - mutual exchange (parivartana)
 * - a two-step depositor chain A → B → C
 *
 * Theme tags fire only when a karaka planet AND a relevant house/lord
 * participate in one of those patterns. No invented event rules.
 */

export type BnnThemeId =
  | "career"
  | "relationships"
  | "wealth"
  | "family"
  | "health"
  | "learning"
  | "travel"
  | "spirituality";

export type BnnPatternKind = "conjunction" | "depositor" | "exchange" | "chain" | "occupancy";

export const BNN_THEME_META: Record<
  BnnThemeId,
  { title: string; karakas: string[]; houses: number[]; note: string }
> = {
  career: {
    title: "Career",
    karakas: ["Saturn", "Sun", "Mercury"],
    houses: [10, 6, 11],
    note: "Saturn (labour/structure), Sun (status), Mercury (skill), houses 6/10/11.",
  },
  relationships: {
    title: "Relationships",
    karakas: ["Venus", "Jupiter", "Mars"],
    houses: [7, 5],
    note: "Venus (partnership), Jupiter (spouse in classical female charts), Mars (energy of union), houses 5/7.",
  },
  wealth: {
    title: "Wealth",
    karakas: ["Jupiter", "Venus"],
    houses: [2, 11],
    note: "Jupiter and Venus as wealth karakas; houses 2 and 11.",
  },
  family: {
    title: "Family",
    karakas: ["Moon", "Venus"],
    houses: [4, 2],
    note: "Moon (mother/mind of the home), Venus (comfort), houses 2/4.",
  },
  health: {
    title: "Health",
    karakas: ["Sun", "Moon", "Mars"],
    houses: [1, 6, 8],
    note: "Luminaries and Mars with houses 1, 6, and 8.",
  },
  learning: {
    title: "Learning",
    karakas: ["Mercury", "Jupiter"],
    houses: [5, 9],
    note: "Mercury and Jupiter with houses 5 and 9.",
  },
  travel: {
    title: "Travel",
    karakas: ["Moon", "Rahu"],
    houses: [3, 9, 12],
    note: "Moon and Rahu with houses 3, 9, and 12.",
  },
  spirituality: {
    title: "Spirituality",
    karakas: ["Ketu", "Jupiter"],
    houses: [9, 12],
    note: "Ketu and Jupiter with houses 9 and 12.",
  },
};

export const BNN_METHODOLOGY =
  "BNN engine v1 detects conjunctions, depositor links, mutual exchanges, and two-step depositor chains from stored D1 positions. Theme cards appear only when a documented karaka and a relevant house/lord share one of those patterns. No event dates are generated.";
