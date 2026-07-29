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
import { routes } from "@/lib/constants/routes";

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
  { title: "Dashas", href: routes.dasha, hint: "Mahadasha and Antardasha timeline" },
  { title: "Career", href: routes.rajaYogas, hint: "Raja Yogas and recognition themes" },
  { title: "Charts", href: routes.divisionalCharts, hint: "Moon, Sun, D9, D10, D30 & more Vargas" },
  { title: "Ashtakavarga", href: routes.ashtakavarga, hint: "House bindu strength" },
  { title: "Varna & Gana", href: routes.natalProfile, hint: "Your Moon-based guna profile" },
  { title: "Doshas", href: routes.yogas, hint: "Manglik, Kaal Sarp and more" },
  { title: "Remedies", href: routes.lalKitab, hint: "Lal Kitab–inspired guidance" },
] as const;

const AI_PROMPTS = [
  "Why am I feeling stuck lately?",
  "What is influencing my career right now?",
  "What does my current Dasha mean?",
  "What should I focus on this month?",
  "What does my chart say about marriage?",
] as const;

export default function AstrologyHomePage() {
  const router = useRouter();
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
    async function load() {
      try {
        const [me, profile, ai, chartRes, gocharRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/ai/insights").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
          fetch("/api/gochar").then((r) => r.json()),
        ]);

        const profileData = profile.success ? profile.data : null;
        const profileDoc = profileData?.profile;
        const chart = chartRes.success ? chartRes.data : null;
        const horoscope = chart?.horoscope;
        const dasha = chart?.dasha;

        const readiness = evaluateOnboardingReadiness({
          gender: profileDoc?.gender,
          city: profileDoc?.city,
          profession: profileDoc?.profession,
          education: profileDoc?.education,
          dateOfBirth: profileDoc?.dateOfBirth,
          photos: profileDoc?.photos,
          completionScore: profileDoc?.completion?.score ?? 0,
          hasBirthDetails: Boolean(profileData?.birthDetails?.birthDate),
          hasChart: Boolean(horoscope),
        });

        if (!readiness.ready) {
          router.replace(routes.onboarding);
          return;
        }

        const insight =
          ai.success && ai.data.insights?.[0]?.body
            ? String(ai.data.insights[0].body).slice(0, 360)
            : null;

        setBundle({
          userName: me.user?.name || profileData?.user?.name || "friend",
          ascendant: horoscope?.lagnaSign || horoscope?.ascendant || horoscope?.lagna || null,
          moonSign: horoscope?.moonSign || null,
          sunSign: horoscope?.sunSign || null,
          nakshatra: horoscope?.moonNakshatra || horoscope?.nakshatra || null,
          currentMaha: dasha?.currentMaha || null,
          currentAntar: dasha?.currentAntar || null,
          insight,
          gocharHighlights: gocharRes.success ? gocharRes.data?.highlights || [] : [],
          gocharError: !gocharRes.success,
        });
      } catch {
        setError("Failed to load astrology overview");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";

  if (loading && !bundle) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <ContentReveal className="space-y-8 sm:space-y-10">
        <PageHeader
          title={`${greeting}, ${firstName}`}
          description="Your Vedic profile — what is active in your chart right now."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
            <section className="border-border/60 grid gap-5 border-y py-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wide uppercase">
                  <Stars className="h-3.5 w-3.5" /> Current Dasha
                </p>
                <p className="font-display mt-2 text-2xl sm:text-3xl">
                  {bundle.currentMaha || "—"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Antardasha: {bundle.currentAntar || "—"}
                </p>
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.dasha}>Open full Dashas</Link>
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Your Vedic profile
                </p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Lagna</dt>
                    <dd className="font-medium">{bundle.ascendant || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Moon</dt>
                    <dd className="font-medium">{bundle.moonSign || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Sun</dt>
                    <dd className="font-medium">{bundle.sunSign || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Nakshatra</dt>
                    <dd className="font-medium">{bundle.nakshatra || "—"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Current transits
                </p>
                {bundle.gocharHighlights.length ? (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {bundle.gocharHighlights.slice(0, 3).map((h) => (
                      <li key={h}>· {h}</li>
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
                    className="group hover:bg-muted/40 flex items-center justify-between gap-4 py-3.5 transition-colors sm:px-1"
                  >
                    <div>
                      <p className="font-medium">{area.title}</p>
                      <p className="text-muted-foreground mt-0.5 text-sm">{area.hint}</p>
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
