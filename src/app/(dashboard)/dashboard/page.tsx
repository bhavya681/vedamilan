"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { fetchJsonWhenAuthed, isAbortError, isUnauthorizedPayload } from "@/lib/http/session-fetch";
import { WORKSPACE_MODE_META } from "@/lib/workspace/mode";

/** Legacy `/dashboard` entry — routes into the active workspace mode home. */
export default function DashboardPage() {
  const router = useRouter();
  const { mode, hydrated } = useWorkspaceMode();
  const { isPending } = useSession();

  useEffect(() => {
    if (!hydrated || isPending) return;

    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      const homePath = WORKSPACE_MODE_META[mode].homePath;
      try {
        const [profileRes, chartRes] = await Promise.all([
          fetchJsonWhenAuthed("/api/profile", ac.signal),
          fetchJsonWhenAuthed("/api/horoscope", ac.signal),
        ]);
        if (cancelled) return;

        const profile = profileRes as {
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
        const chart = chartRes as { success?: boolean; data?: { horoscope?: unknown } };

        if (profile.success) {
          const doc = profile.data?.profile;
          const readiness = evaluateOnboardingReadiness({
            gender: doc?.gender,
            city: doc?.city,
            profession: doc?.profession,
            education: doc?.education,
            photos: doc?.photos,
            completionScore: doc?.completion?.score,
            hasBirthDetails: Boolean(profile.data?.birthDetails?.birthDate),
            hasChart: Boolean(chart.success && chart.data?.horoscope),
          });
          if (!readiness.ready) {
            router.replace(routes.onboarding);
            return;
          }
        } else if (isUnauthorizedPayload(profileRes)) {
          router.replace(homePath);
          return;
        }

        router.replace(homePath);
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        router.replace(homePath);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [hydrated, isPending, mode, router]);

  return <DashboardHomeSkeleton />;
}
