"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/lib/constants/routes";

const SKIP_PREFIXES = [
  routes.onboarding,
  routes.settings,
  routes.security,
  routes.privacySettings,
  routes.birthDetails,
  routes.editProfile,
  routes.preferences,
  routes.kundli,
];

/**
 * Soft gate: incomplete onboarding users (no flag + missing birth/chart)
 * are guided to /dashboard/onboarding. Skipped after "finish later".
 */
export function OnboardingRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

    let cancelled = false;
    void (async () => {
      try {
        const [profileRes, chartRes] = await Promise.all([
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
        ]);
        if (cancelled || !profileRes.success) return;
        const profile = profileRes.data?.profile;
        if (profile?.onboardingCompletedAt) return;
        const hasBirth = Boolean(profileRes.data?.birthDetails?.birthDate);
        const hasChart = Boolean(chartRes.success && chartRes.data?.horoscope);
        if (!hasBirth || !hasChart) {
          router.replace(routes.onboarding);
        }
      } catch {
        /* ignore — do not block dashboard on network blips */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
