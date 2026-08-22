"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Stars } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal, DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import {
  fetchJson,
  fetchJsonWhenAuthed,
  isAbortError,
  isUnauthorizedPayload,
} from "@/lib/http/session-fetch";
import { formatPersonName } from "@/lib/utils/person-name";

type AstrologyBundle = {
  userName: string;
  ascendant: string | null;
  moonSign: string | null;
  sunSign: string | null;
  nakshatra: string | null;
  currentMaha: string | null;
  currentAntar: string | null;
  insight: string | null;
  gocharHighlights: string[];
  gocharError: boolean;
};

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const LIFE_AREAS = [
  { title: "Dashas", href: routes.astrologyDasha, hint: "Mahadasha and Antardasha timeline" },
  { title: "Yogas", href: routes.astrologyYogas, hint: "Yogas, doshas, and karmic patterns" },
  {
    title: "Charts",
    href: routes.astrologyDivisionalCharts,
    hint: "Moon, Sun, D9, D10, D7, D12 & more Vargas",
  },
  { title: "Predictions", href: routes.predictions, hint: "Life-area forecasts from your chart" },
  { title: "Nakshatra", href: routes.astrologyNakshatra, hint: "Janma Nakshatra intelligence" },
  {
    title: "Horizon",
    href: routes.astrologyNorthHorizon,
    hint: "See what is rising, setting, and moving across the sky",
  },
  { title: "Remedies", href: routes.lalKitab, hint: "Lal Kitab–inspired guidance" },
  {
    title: "Graha Katha",
    href: routes.grahaKatha,
    hint: "Stories, symbolism & 12-house wisdom of the Grahas",
  },
] as const;

const ADVANCED_AREAS = [
  {
    title: "Planet Strength",
    href: routes.astrologyPlanetStrength,
    hint: "Dignity, house, and retrograde analysis",
  },
  {
    title: "Shadbala",
    href: routes.astrologyShadbala,
    hint: "Six-fold planetary strength analysis",
  },
  {
    title: "Ashtakavarga",
    href: routes.astrologyAshtakavarga,
    hint: "SAV and BAV bindu strength by house",
  },
  {
    title: "Jaimini Karakas",
    href: routes.astrologyJaimini,
    hint: "Chara Karakas, Atmakaraka, Darakaraka",
  },
  {
    title: "BNN",
    href: routes.astrologyBnn,
    hint: "Bhrigu Nandi Nadi planetary patterns",
  },
  {
    title: "Panchanga & Muhurta",
    href: routes.astrologyPanchanga,
    hint: "Daily five limbs and auspicious windows",
  },
  { title: "Varna & Gana", href: routes.natalProfile, hint: "Your Moon-based guna profile" },
  {
    title: "Chart Comparison",
    href: routes.astrologyChartComparison,
    hint: "Structural comparison with another chart",
  },
] as const;

const AI_PROMPTS = [
  "Why am I feeling stuck lately?",
  "What is influencing my career right now?",
  "What does my current Dasha mean?",
  "What should I focus on this month?",
  "What does my chart say about marriage?",
] as const;

type ProfilePayload = {
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
    user?: { name?: string };
    birthDetails?: { birthDate?: string };
  };
};

type ChartPayload = {
  success?: boolean;
  data?: {
    horoscope?: {
      lagnaSign?: string;
      ascendant?: string;
      lagna?: string;
      moonSign?: string;
      sunSign?: string;
      moonNakshatra?: string;
      nakshatra?: string;
    };
    dasha?: { currentMaha?: string; currentAntar?: string };
  };
};

export default function AstrologyHomePage() {
  const router = useRouter();
  const { isPending } = useSession();
  const { setMode } = useWorkspaceMode();
  const [bundle, setBundle] = useState<AstrologyBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMode("astrology", { navigate: false });
  }, [setMode]);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (isPending) return;

    const ac = new AbortController();
    let cancelled = false;
    let redirecting = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [meRaw, profileRaw, chartRaw] = await Promise.all([
          fetchJsonWhenAuthed("/api/auth/me", ac.signal),
          fetchJsonWhenAuthed("/api/profile", ac.signal),
          fetchJsonWhenAuthed("/api/horoscope", ac.signal),
        ]);
        if (cancelled) return;

        const me = meRaw as { user?: { name?: string } };
        const profile = profileRaw as ProfilePayload;
        const chartRes = chartRaw as ChartPayload;

        if (isUnauthorizedPayload(profileRaw) || isUnauthorizedPayload(meRaw)) {
          setError("Failed to load astrology overview");
          return;
        }

        if (!profile.success) {
          setError("Failed to load astrology overview");
          return;
        }

        const profileData = profile.data;
        const profileDoc = profileData?.profile;
        const chart = chartRes.success ? chartRes.data : null;
        const horoscope = chart?.horoscope;
        const dasha = chart?.dasha;

        const readiness = evaluateOnboardingReadiness({
          gender: profileDoc?.gender,
          city: profileDoc?.city,
          profession: profileDoc?.profession,
          education: profileDoc?.education,
          photos: profileDoc?.photos,
          completionScore: profileDoc?.completion?.score ?? 0,
          hasBirthDetails: Boolean(profileData?.birthDetails?.birthDate),
          hasChart: Boolean(horoscope),
        });

        if (!readiness.ready) {
          redirecting = true;
          router.replace(routes.onboarding);
          return;
        }

        setBundle({
          userName: formatPersonName(me.user?.name || profileData?.user?.name, "Friend"),
          ascendant: horoscope?.lagnaSign || horoscope?.ascendant || horoscope?.lagna || null,
          moonSign: horoscope?.moonSign || null,
          sunSign: horoscope?.sunSign || null,
          nakshatra: horoscope?.moonNakshatra || horoscope?.nakshatra || null,
          currentMaha: dasha?.currentMaha || null,
          currentAntar: dasha?.currentAntar || null,
          insight: null,
          gocharHighlights: [],
          gocharError: false,
        });

        void Promise.all([
          fetchJson("/api/ai/insights", ac.signal),
          fetchJson("/api/gochar", ac.signal),
        ])
          .then(([aiRaw, gocharRaw]) => {
            if (cancelled) return;
            const ai = aiRaw as {
              success?: boolean;
              data?: { insights?: Array<{ body?: string }>; openingMessage?: string };
            };
            const gocharRes = gocharRaw as {
              success?: boolean;
              data?: { highlights?: string[] };
            };
            const insightBody = ai.success
              ? ai.data?.insights?.[0]?.body || ai.data?.openingMessage
              : null;
            setBundle((prev) =>
              prev
                ? {
                    ...prev,
                    insight: insightBody ? String(insightBody).slice(0, 360) : null,
                    gocharHighlights: gocharRes.success ? gocharRes.data?.highlights || [] : [],
                    gocharError: !gocharRes.success,
                  }
                : prev,
            );
          })
          .catch((error) => {
            if (cancelled || isAbortError(error)) return;
            setBundle((prev) => (prev ? { ...prev, gocharError: true } : prev));
          });
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        setError("Failed to load astrology overview");
      } finally {
        if (!cancelled && !redirecting) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [isPending, router]);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";

  if (loading && !bundle) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="min-w-0 space-y-7 sm:space-y-10">
      <ContentReveal className="min-w-0 space-y-7 sm:space-y-10">
        <PageHeader
          title={`${greeting}, ${firstName}`}
          description="Your Vedic profile — what is active in your chart right now."
          actions={
            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href={routes.kundli}>
                  Open Kundli
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={routes.aiInsights}>Ask about your chart</Link>
              </Button>
            </div>
          }
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {bundle ? (
          <>
            <section className="border-border/60 grid min-w-0 gap-5 border-y py-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
              <div className="min-w-0">
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wide uppercase">
                  <Stars className="h-3.5 w-3.5 shrink-0" /> Current Dasha
                </p>
                <p className="font-display mt-2 text-2xl break-words sm:text-3xl">
                  {bundle.currentMaha || "—"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm break-words">
                  Antardasha: {bundle.currentAntar || "—"}
                </p>
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.dasha}>Open full Dashas</Link>
                </Button>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Your Vedic profile
                </p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">Lagna</dt>
                    <dd className="text-right font-medium break-words">
                      {bundle.ascendant || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">Moon</dt>
                    <dd className="text-right font-medium break-words">{bundle.moonSign || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">Sun</dt>
                    <dd className="text-right font-medium break-words">{bundle.sunSign || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground shrink-0">Nakshatra</dt>
                    <dd className="text-right font-medium break-words">
                      {bundle.nakshatra || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="min-w-0 sm:col-span-2 md:col-span-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Current transits
                </p>
                {bundle.gocharHighlights.length ? (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {bundle.gocharHighlights.slice(0, 3).map((h) => (
                      <li key={h} className="break-words">
                        · {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed">
                    {bundle.gocharError
                      ? "Transit analysis needs birth details and a calculated Kundli."
                      : "Loading Gochar…"}
                  </p>
                )}
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.gochar}>Open Gochar</Link>
                </Button>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  Calculated from your Kundli · deterministic planetary data
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl">Dashas</h2>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                    Your Vimshottari timeline — Mahadasha for the long arc, Antardasha for the
                    chapter you are in now.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={routes.dasha}>
                    Explore Dashas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="border-border/60 grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 sm:p-5">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                    Mahadasha
                  </p>
                  <p className="font-display mt-1 text-2xl">{bundle.currentMaha || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                    Antardasha
                  </p>
                  <p className="font-display mt-1 text-2xl">{bundle.currentAntar || "—"}</p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed sm:col-span-2">
                  Open Dashas for progress bars, the full Mahadasha list, and expandable Antardasha
                  sub-periods.
                </p>
              </div>
            </section>

            {bundle.insight ? (
              <section className="space-y-3">
                <div>
                  <h2 className="font-display text-2xl">What this means for you</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Interpretation of your chart context — astrology calculates; guidance explains.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{bundle.insight}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={routes.aiInsights}>Continue the conversation</Link>
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">Areas of life</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Explore themes without leaving your astrology workspace.
                </p>
              </div>
              <div className="divide-border/60 border-border/60 divide-y border-y">
                {LIFE_AREAS.map((area) => (
                  <Link
                    key={area.title}
                    href={area.href}
                    className="group hover:bg-muted/40 flex min-w-0 items-center justify-between gap-3 py-3.5 transition-colors sm:gap-4 sm:px-1"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{area.title}</p>
                      <p className="text-muted-foreground mt-0.5 text-sm leading-snug">
                        {area.hint}
                      </p>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">Vedic Intelligence Studio</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Deeper chart analysis, timing, and personalized guidance.
                </p>
              </div>
              <div className="divide-border/60 border-border/60 divide-y border-y">
                {ADVANCED_AREAS.map((area) => (
                  <Link
                    key={area.title}
                    href={area.href}
                    className="group hover:bg-muted/40 flex min-w-0 items-center justify-between gap-3 py-3.5 transition-colors sm:gap-4 sm:px-1"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{area.title}</p>
                      <p className="text-muted-foreground mt-0.5 text-sm leading-snug">
                        {area.hint}
                      </p>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="border-border/60 space-y-3 border-t pt-8">
              <h2 className="font-display text-xl">Reflect on your chart</h2>
              <p className="text-muted-foreground text-sm">
                Start a conversation grounded in your calculated Kundli.
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_PROMPTS.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`${routes.aiInsights}?q=${encodeURIComponent(prompt)}`}
                    className="border-border/60 hover:border-foreground/25 rounded-md border px-3 py-1.5 text-xs transition-colors sm:text-sm"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </section>

            <CrossModeCta />
          </>
        ) : null}
      </ContentReveal>
    </div>
  );
}
