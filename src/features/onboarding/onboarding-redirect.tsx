"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { routes } from "@/lib/constants/routes";

/** Routes allowed while onboarding is incomplete */
const ALLOW_WHILE_INCOMPLETE = [
  routes.onboarding,
  routes.birthDetails,
  routes.kundli,
  routes.editProfile,
  routes.preferences,
  routes.settings,
  routes.security,
  routes.privacySettings,
];

/**
 * Hard gate: members must complete profile basics, birth details, and kundli
 * before using matches / compatibility / home content.
 */
export function OnboardingRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const checking = useRef(false);

  useEffect(() => {
    if (ALLOW_WHILE_INCOMPLETE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return;
    }

    // `/dashboard` resolves its own gate to avoid racing astrology/matrimony homes.
    if (pathname === routes.dashboard) return;

    let cancelled = false;
    void (async () => {
      if (checking.current) return;
      checking.current = true;
      try {
        const [profileRes, chartRes] = await Promise.all([
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
        ]);
        if (cancelled || !profileRes.success) return;

        const profile = profileRes.data?.profile;
        const readiness = evaluateOnboardingReadiness({
          gender: profile?.gender,
          city: profile?.city,
          profession: profile?.profession,
          education: profile?.education,
          dateOfBirth: profile?.dateOfBirth,
          photos: profile?.photos,
          completionScore: profile?.completion?.score,
          hasBirthDetails: Boolean(profileRes.data?.birthDetails?.birthDate),
          hasChart: Boolean(chartRes.success && chartRes.data?.horoscope),
        });

        if (!readiness.ready) {
          router.replace(routes.onboarding);
        }
      } catch {
        /* ignore network blips */
      } finally {
        checking.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
