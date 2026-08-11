/**
 * Shared readiness checks for compulsory onboarding.
 * Members must finish basics + birth + kundli before using the dashboard.
 *
 * Note: Date of birth (dob) is not part of basics, as it is handled in the astrology/birth details section.
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

export function evaluateOnboardingReadiness(input: {
  gender?: string | null;
  city?: string | null;
  profession?: string | null;
  education?: string | null;
  // dateOfBirth removed from basics, as DOB is gathered via birth details, not here
  photos?: unknown[] | null;
  completionScore?: number | null;
  hasBirthDetails?: boolean;
  hasChart?: boolean;
}): OnboardingReadiness {
  const gender = String(input.gender || "").toUpperCase();
  const hasGender = gender === "MALE" || gender === "FEMALE";
  const hasPhoto = Array.isArray(input.photos) && input.photos.length > 0;
  // 'hasBasics' no longer includes dateOfBirth
  const hasBasics = Boolean(input.city && input.profession && input.education && hasGender);
  const hasBirth = Boolean(input.hasBirthDetails);
  const hasChart = Boolean(input.hasChart);
  const completion = Number(input.completionScore ?? 0);

  const missing: string[] = [];
  if (!hasGender) missing.push("gender");
  if (!hasPhoto) missing.push("photo");
  if (!input.city) missing.push("city");
  if (!input.profession) missing.push("profession");
  if (!input.education) missing.push("education");
  // Do not require dateOfBirth here; it's part of birthDetails only
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
