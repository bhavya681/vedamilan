/**
 * Presentation catalogs for stable machine codes.
 * Engines and DB store codes / enums — never translated display strings as source of truth.
 */

export const GENDER_CODES = ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"] as const;
export type GenderCode = (typeof GENDER_CODES)[number];

export const MARITAL_STATUS_CODES = [
  "NEVER_MARRIED",
  "DIVORCED",
  "WIDOWED",
  "AWAITING_DIVORCE",
] as const;
export type MaritalStatusCode = (typeof MARITAL_STATUS_CODES)[number];

export const ALIGNMENT_CODES = ["STRONG", "GOOD", "MIXED", "NEEDS_DISCUSSION"] as const;
export type AlignmentCode = (typeof ALIGNMENT_CODES)[number];

export const DECISION_SUMMARY_CODES = [
  "excellent_match",
  "very_good_match",
  "good_match",
  "needs_conscious_effort",
  "high_challenge",
  "not_recommended",
] as const;
export type DecisionSummaryCode = (typeof DECISION_SUMMARY_CODES)[number];

/** Map engine English verdict → stable code (backward compatible). */
export const DECISION_SUMMARY_FROM_LABEL: Record<string, DecisionSummaryCode> = {
  "Excellent Match": "excellent_match",
  "Very Good Match": "very_good_match",
  "Good Match": "good_match",
  "Needs Conscious Effort": "needs_conscious_effort",
  "High Challenge": "high_challenge",
  "Not Recommended": "not_recommended",
};

export const COMPAT_MOOD_CODES = [
  "excellent",
  "strong",
  "balanced",
  "cautious",
  "challenging",
] as const;
export type CompatMoodCode = (typeof COMPAT_MOOD_CODES)[number];

export const KOOTA_CODES = [
  "Varna",
  "Vashya",
  "Tara",
  "Yoni",
  "GrahaMaitri",
  "Gana",
  "Bhakoot",
  "Nadi",
] as const;

export function kootaCodeFromName(koota: string): string {
  return koota.replace(/\s+/g, "");
}

export function decisionSummaryCodeFromLabel(label: string): DecisionSummaryCode {
  return DECISION_SUMMARY_FROM_LABEL[label] || "good_match";
}

export function moodCodeFromScore(score: number): CompatMoodCode {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "balanced";
  if (score >= 40) return "cautious";
  return "challenging";
}

export function alignmentCodeToKey(code: AlignmentCode): string {
  switch (code) {
    case "STRONG":
      return "compatibility.strongAlignment";
    case "GOOD":
      return "compatibility.goodAlignment";
    case "MIXED":
      return "compatibility.mixedAlignment";
    case "NEEDS_DISCUSSION":
      return "compatibility.needsDiscussion";
    default:
      return "compatibility.mixedAlignment";
  }
}
