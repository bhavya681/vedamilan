"use client";

import { useEffect, useRef } from "react";

import { useAppPathname, useLocaleRouter } from "@/components/i18n/locale-navigation";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { fetchJsonWhenAuthed, isAbortError } from "@/lib/http/session-fetch";

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
  routes.languageRegion,
  routes.appearance,
  routes.vedicWisdom,
  routes.askTheSages,
  routes.wisdomJournal,
];

/**
 * Hard gate: members must complete profile basics, birth details, and kundli
 * before using matches / compatibility / home content.
 */
export function OnboardingRedirect() {
  const pathname = useAppPathname();
  const router = useLocaleRouter();
  const { isPending } = useSession();
  const checking = useRef(false);

  useEffect(() => {
    if (isPending) return;
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
        const [profileResRaw, chartResRaw] = await Promise.all([
          fetchJsonWhenAuthed("/api/profile"),
          fetchJsonWhenAuthed("/api/horoscope"),
        ]);
        const profileRes = profileResRaw as {
          success?: boolean;
          data?: {
            profile?: {
              gender?: string;
              city?: string;
              profession?: string;
              education?: string;
              photos?: unknown[];
              completion?: { score?: number };
            };
            birthDetails?: { birthDate?: string };
          };
        };
        const chartRes = chartResRaw as { success?: boolean; data?: { horoscope?: unknown } };
        if (cancelled || !profileRes.success) return;

        const profile = profileRes.data?.profile;
        const readiness = evaluateOnboardingReadiness({
          gender: profile?.gender,
          city: profile?.city,
          profession: profile?.profession,
          education: profile?.education,
          photos: profile?.photos,
          completionScore: profile?.completion?.score,
          hasBirthDetails: Boolean(profileRes.data?.birthDetails?.birthDate),
          hasChart: Boolean(chartRes.success && chartRes.data?.horoscope),
        });

        if (!readiness.ready) {
          router.replace(routes.onboarding);
        }
      } catch (error) {
        if (isAbortError(error)) return;
        /* ignore network blips */
      } finally {
        checking.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPending, pathname, router]);

  return null;
}
