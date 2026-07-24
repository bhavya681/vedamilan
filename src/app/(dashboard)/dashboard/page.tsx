"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { routes } from "@/lib/constants/routes";
import { WORKSPACE_MODE_META } from "@/lib/workspace/mode";

/** Legacy `/dashboard` entry — routes into the active workspace mode home. */
export default function DashboardPage() {
  const router = useRouter();
  const { mode, hydrated } = useWorkspaceMode();
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const [profileRes, chartRes] = await Promise.all([
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
        ]);
        if (cancelled) return;

        if (profileRes.success) {
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
            return;
          }
        }

        router.replace(WORKSPACE_MODE_META[mode].homePath);
      } catch {
        if (!cancelled) router.replace(WORKSPACE_MODE_META[mode].homePath);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, mode, router]);

  return <DashboardHomeSkeleton />;
}
