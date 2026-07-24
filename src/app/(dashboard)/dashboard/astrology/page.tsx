"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Stars } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal, DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

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
  { title: "Career", href: routes.rajaYogas, hint: "Raja Yogas and recognition themes" },
  { title: "Charts", href: routes.divisionalCharts, hint: "Moon, Sun, and Navamsha views" },
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
    <div className="relative space-y-8 sm:space-y-10">
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-40 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_10%,transparent),transparent_70%)]" />

      <ContentReveal className="space-y-8 sm:space-y-10">
        <PageHeader
          title={`${greeting}, ${firstName}`}
          description="Your Vedic astrology overview — what is active in your chart right now."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href={routes.kundli}>
                  Open Kundli
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={routes.aiInsights}>Ask AI Guru</Link>
              </Button>
            </div>
          }
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {bundle ? (
          <>
            <section className="border-border/70 from-card via-card to-gold/5 shadow-soft grid gap-4 rounded-2xl border bg-gradient-to-br p-5 sm:grid-cols-3 sm:p-6">
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
                  <Link href={routes.dasha}>View periods</Link>
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Snapshot</p>
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
                  Live astrological weather
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
                      ? "Live transit analysis needs birth details and a calculated Kundli."
                      : "Loading live Gochar…"}
                  </p>
                )}
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.gochar}>Open Gochar</Link>
                </Button>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  Calculated from your Kundli · Verified planetary data
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="font-display text-2xl">Today&apos;s insight</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  AI Guru interpretation of engine-generated chart context — not a fresh
                  calculation.
                </p>
              </div>
              {bundle.insight ? (
                <div className="border-border/70 bg-card shadow-soft rounded-2xl border p-5 sm:p-6">
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Guru Interpretation
                  </p>
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {bundle.insight}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={routes.aiInsights}>Continue with AI Guru</Link>
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="Ask AI Guru for today’s reading"
                  description="Insights appear once your chart is ready and the guide has context."
                  action={
                    <Button asChild>
                      <Link href={routes.aiInsights}>Open AI Guru</Link>
                    </Button>
                  }
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">Areas of life</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Explore themes without leaving your astrology workspace.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LIFE_AREAS.map((area) => (
                  <Link
                    key={area.title}
                    href={area.href}
                    className={cn(
                      "border-border/60 bg-card hover:border-gold/35 group rounded-2xl border p-4 transition-colors",
                    )}
                  >
                    <p className="font-medium">{area.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{area.hint}</p>
                    <span className="text-gold mt-3 inline-flex items-center gap-1 text-sm font-medium">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="border-border/70 bg-card shadow-soft rounded-2xl border p-5 sm:p-6">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                AI Guru · Your personal Vedic guide
              </p>
              <h2 className="font-display mt-2 text-xl">Ask me anything about your chart</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_PROMPTS.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`${routes.aiInsights}?q=${encodeURIComponent(prompt)}`}
                    className="border-border/60 bg-muted/40 hover:border-gold/30 rounded-full border px-3 py-1.5 text-xs transition-colors sm:text-sm"
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
