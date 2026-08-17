/**
 * Discovery recommendation bands — ranking stays kundli-first.
 * Ashta Koota 18/36 is the classic floor at which marriage is traditionally considered viable.
 * Blend % is the fast multi-factor preview used for ordering, not a deep compatibility report.
 */

export type RecommendationTier = "BEST" | "STRONG" | "GOOD" | "EXPLORE";

/** Classic Ashta Koota minimum for a marriage that can sustain. */
export const MARRIAGE_SUSTAIN_GUNA = 18;
/** Traditionally “good” Guna Milan. */
export const SOLID_GUNA = 24;
/** Traditionally “very good” Guna Milan. */
export const STRONG_GUNA = 28;

/** High-likelihood core kundli blend (was 80 — too exclusive for discovery). */
export const TIER_BEST_SCORE = 70;
/** Solid multi-factor blend. */
export const TIER_STRONG_SCORE = 58;
/** Marriage-viable blend (~18/36 Ashta Koota). */
export const TIER_GOOD_SCORE = 48;

/** Prefer this many suggestions so Matches is not a thin elite list. */
export const MIN_RECOMMENDATIONS = 36;
/** Cap so ranking stays focused on the strongest charted pool. */
export const MAX_RECOMMENDATIONS = 80;

/**
 * Preference fit may add at most this many points on the kundli 0–100 scale.
 * A clearly better chart still ranks first (e.g. 80% always beats 76% even with a perfect pref match).
 */
export const PREFERENCE_RANK_MAX_BOOST = 4;

export type PreferenceSnapshot = {
  ageMin?: number | null;
  ageMax?: number | null;
  heightMinCm?: number | null;
  heightMaxCm?: number | null;
  religions?: string[] | null;
  communities?: string[] | null;
  motherTongues?: string[] | null;
  countries?: string[] | null;
  cities?: string[] | null;
  educations?: string[] | null;
  professions?: string[] | null;
  maritalStatuses?: string[] | null;
  diet?: string[] | null;
  manglikPreference?: string | null;
  minCompatibilityScore?: number | null;
  preferredLanguages?: string[] | null;
};

export type PreferenceCandidate = {
  age?: number | null;
  heightCm?: number | null;
  religion?: string | null;
  community?: string | null;
  motherTongue?: string | null;
  country?: string | null;
  city?: string | null;
  education?: string | null;
  profession?: string | null;
  maritalStatus?: string | null;
  diet?: string | null;
  manglik?: string | null;
  languages?: string[] | null;
  totalGuna?: number | null;
};

function norm(value: string) {
  return value.trim().toLowerCase();
}

function listHit(
  list: string[] | null | undefined,
  value: string | null | undefined,
): boolean | null {
  if (!list?.length) return null;
  if (!value) return false;
  const needle = norm(value);
  return list.some((item) => {
    const hay = norm(item);
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

function anyLanguageHit(
  wanted: string[] | null | undefined,
  languages: string[] | null | undefined,
) {
  if (!wanted?.length) return null;
  if (!languages?.length) return false;
  return wanted.some((w) => listHit(languages, w) === true);
}

function manglikHit(
  preference: string | null | undefined,
  manglik: string | null | undefined,
): boolean | null {
  if (!preference || preference === "ANY") return null;
  if (!manglik || manglik === "UNKNOWN") return false;
  if (preference === "PARTIAL_OK") return manglik === "NON_MANGLIK" || manglik === "PARTIAL";
  return manglik === preference;
}

/**
 * 0–100 probability that this profile matches the viewer's stated partner preferences.
 * Neutral 50 when they have not set any comparable preferences.
 */
export function preferenceFitScore(
  prefs: PreferenceSnapshot | null | undefined,
  candidate: PreferenceCandidate,
): number {
  if (!prefs) return 50;
  const checks: boolean[] = [];

  if (prefs.ageMin != null || prefs.ageMax != null) {
    if (candidate.age != null) {
      checks.push(
        (prefs.ageMin == null || candidate.age >= prefs.ageMin) &&
          (prefs.ageMax == null || candidate.age <= prefs.ageMax),
      );
    }
  }
  if (prefs.heightMinCm != null || prefs.heightMaxCm != null) {
    if (candidate.heightCm != null) {
      checks.push(
        (prefs.heightMinCm == null || candidate.heightCm >= prefs.heightMinCm) &&
          (prefs.heightMaxCm == null || candidate.heightCm <= prefs.heightMaxCm),
      );
    }
  }

  const listChecks: Array<[string[] | null | undefined, string | null | undefined]> = [
    [prefs.religions, candidate.religion],
    [prefs.communities, candidate.community],
    [prefs.motherTongues, candidate.motherTongue],
    [prefs.countries, candidate.country],
    [prefs.cities, candidate.city],
    [prefs.educations, candidate.education],
    [prefs.professions, candidate.profession],
    [prefs.maritalStatuses, candidate.maritalStatus],
    [prefs.diet, candidate.diet],
  ];
  for (const [list, value] of listChecks) {
    const hit = listHit(list, value);
    if (hit != null) checks.push(hit);
  }

  const langHit = anyLanguageHit(prefs.preferredLanguages, candidate.languages);
  if (langHit != null) checks.push(langHit);

  const manglik = manglikHit(prefs.manglikPreference, candidate.manglik);
  if (manglik != null) checks.push(manglik);

  if (prefs.minCompatibilityScore != null && candidate.totalGuna != null) {
    checks.push(candidate.totalGuna >= prefs.minCompatibilityScore);
  }

  if (!checks.length) return 50;
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/** Kundli score with a small preference probability boost — never enough to bury a clearly better chart. */
export function rankingScore(compatibilityScore: number, preferenceFit: number): number {
  return (
    compatibilityScore +
    (Math.max(0, Math.min(100, preferenceFit)) / 100) * PREFERENCE_RANK_MAX_BOOST
  );
}

export function compareRecommendedMatches(
  a: {
    compatibilityScore: number;
    totalGuna: number;
    preferenceFit?: number | null;
    name?: string;
  },
  b: {
    compatibilityScore: number;
    totalGuna: number;
    preferenceFit?: number | null;
    name?: string;
  },
): number {
  const ra = rankingScore(a.compatibilityScore, a.preferenceFit ?? 50);
  const rb = rankingScore(b.compatibilityScore, b.preferenceFit ?? 50);
  if (rb !== ra) return rb - ra;
  if (b.compatibilityScore !== a.compatibilityScore)
    return b.compatibilityScore - a.compatibilityScore;
  if (b.totalGuna !== a.totalGuna) return b.totalGuna - a.totalGuna;
  if ((b.preferenceFit ?? 50) !== (a.preferenceFit ?? 50)) {
    return (b.preferenceFit ?? 50) - (a.preferenceFit ?? 50);
  }
  return (a.name || "").localeCompare(b.name || "");
}

export function isMarriageSustainable(compatibilityScore: number, totalGuna: number): boolean {
  return totalGuna >= MARRIAGE_SUSTAIN_GUNA || compatibilityScore >= TIER_GOOD_SCORE;
}

export function recommendationTier(
  compatibilityScore: number,
  totalGuna: number,
): RecommendationTier {
  if (compatibilityScore >= TIER_BEST_SCORE || totalGuna >= 32) return "BEST";
  if (compatibilityScore >= TIER_STRONG_SCORE || totalGuna >= STRONG_GUNA) return "STRONG";
  if (compatibilityScore >= TIER_GOOD_SCORE || totalGuna >= MARRIAGE_SUSTAIN_GUNA) return "GOOD";
  return "EXPLORE";
}

export function gunaMilanReason(
  totalGuna: number,
  maxGuna: number,
  compatibilityScore: number,
): string | null {
  if (totalGuna >= STRONG_GUNA) {
    return `Strong Ashta Koota (${totalGuna}/${maxGuna}) · ~${compatibilityScore}% core`;
  }
  if (totalGuna >= SOLID_GUNA) {
    return `Solid Guna Milan (${totalGuna}/${maxGuna}) · ~${compatibilityScore}% core`;
  }
  if (totalGuna >= MARRIAGE_SUSTAIN_GUNA) {
    return `Marriage-viable Guna Milan (${totalGuna}/${maxGuna}) · ~${compatibilityScore}% core`;
  }
  return null;
}

/**
 * Keep marriage-sustainable matches first (already score-sorted), then fill with the
 * next-highest charted scores so a small elite band does not empty the list.
 */
export function selectRecommendedMatches<
  T extends { compatibilityScore: number; totalGuna: number },
>(ranked: T[], options?: { min?: number; max?: number }): T[] {
  const min = options?.min ?? MIN_RECOMMENDATIONS;
  const max = options?.max ?? MAX_RECOMMENDATIONS;
  const sustainable = ranked.filter((m) =>
    isMarriageSustainable(m.compatibilityScore, m.totalGuna),
  );
  if (sustainable.length >= min) {
    return sustainable.slice(0, max);
  }
  const seen = new Set(sustainable);
  const fill = ranked.filter((m) => !seen.has(m));
  return [...sustainable, ...fill].slice(0, Math.max(min, sustainable.length));
}
