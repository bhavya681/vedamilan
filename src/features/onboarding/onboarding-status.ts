/**
 * Shared readiness checks for compulsory onboarding.
 * Members must finish basics + birth + kundli before using the dashboard.
 *
 * Date of birth and city are collected once in astrology/birth details,
 * then copied onto the profile — not asked again on the first step.
 */

export type OnboardingReadiness = {
  ready: boolean;
  hasGender: boolean;
  hasBasics: boolean;
  hasPhoto: boolean;
  hasBirth: boolean;
  hasChart: boolean;
  completion: number;
  missing: string[];
};

/** First segment of "City, Region, Country" for the profile city field. */
export function cityFromPlaceName(placeName: string | null | undefined): string {
  return (
    String(placeName || "")
      .split(",")[0]
      ?.trim() || ""
  );
}

export function evaluateOnboardingReadiness(input: {
  gender?: string | null;
  city?: string | null;
  profession?: string | null;
  education?: string | null;
  photos?: unknown[] | null;
  completionScore?: number | null;
  hasBirthDetails?: boolean;
  hasChart?: boolean;
}): OnboardingReadiness {
  const gender = String(input.gender || "").toUpperCase();
  const hasGender = gender === "MALE" || gender === "FEMALE";
  const hasPhoto = Array.isArray(input.photos) && input.photos.length > 0;
  const hasBirth = Boolean(input.hasBirthDetails);
  const hasChart = Boolean(input.hasChart);
  const completion = Number(input.completionScore ?? 0);
  // City/DOB live on the birth-details step; basics are identity + work only.
  const hasBasics = Boolean(input.profession && input.education && hasGender);

  const missing: string[] = [];
  if (!hasGender) missing.push("gender");
  if (!hasPhoto) missing.push("photo");
  if (!input.profession) missing.push("profession");
  if (!input.education) missing.push("education");
  if (!hasBirth) missing.push("birthDetails");
  if (!hasChart) missing.push("kundli");

  const ready = hasGender && hasBasics && hasPhoto && hasBirth && hasChart;

  return {
    ready,
    hasGender,
    hasBasics,
    hasPhoto,
    hasBirth,
    hasChart,
    completion,
    missing,
  };
}
