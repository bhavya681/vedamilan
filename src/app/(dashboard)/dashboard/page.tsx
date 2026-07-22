"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { PageHeader, AuroraBackground, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MatchCard, GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";

type Bundle = {
  userName: string;
  completion: number;
  hasBirth: boolean;
  hasChart: boolean;
  moonSign: string | null;
  currentMaha: string | null;
  matches: Array<{
    userId: string;
    name: string;
    age: number | null;
    city: string | null;
    profession: string | null;
    compatibilityScore: number;
    headline: string;
    photo: string | null;
  }>;
  insight: string | null;
  unread: number;
  nextSetupHref: string;
  nextSetupLabel: string;
};

export default function DashboardPage() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, profile, matches, ai, notes, chartRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/recommendations").then((r) => r.json()),
          fetch("/api/ai/insights").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
        ]);

        const profileData = profile.success ? profile.data : null;
        const completion = profileData?.profile?.completion?.score ?? 0;
        const hasBirth = Boolean(profileData?.birthDetails?.birthDate);
        const hasChart = Boolean(chartRes.success && chartRes.data?.horoscope);
        const matchItems = matches.success ? matches.data.data || [] : [];
        const insight =
          ai.success && ai.data.insights?.[0]?.body
            ? ai.data.insights[0].body
            : hasChart
              ? "Open AI Insights for a plain-language reading of your chart."
              : null;

        let nextSetupHref: string = routes.onboarding;
        let nextSetupLabel = "Continue Setup";
        if (completion < 40) {
          nextSetupHref = routes.onboarding;
          nextSetupLabel = "Complete your profile";
        } else if (!hasBirth) {
          nextSetupHref = routes.birthDetails;
          nextSetupLabel = "Add your birth details";
        } else if (!hasChart) {
          nextSetupHref = routes.kundli;
          nextSetupLabel = "Generate your Kundli";
        }

        setBundle({
          userName: me.user?.name || profileData?.user?.name || "friend",
          completion,
          hasBirth,
          hasChart,
          moonSign: chartRes.data?.horoscope?.moonSign || null,
          currentMaha: chartRes.data?.dasha?.currentMaha || null,
          matches: matchItems.slice(0, 4),
          insight: insight ? String(insight).slice(0, 420) : null,
          unread: notes.success ? notes.data.unread || 0 : 0,
          nextSetupHref,
          nextSetupLabel,
        });
      } catch {
        setError("Failed to load dashboard");
      }
    }
    void load();
  }, []);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";
  const needsSetup = Boolean(bundle && (!bundle.hasChart || bundle.completion < 60));

  return (
    <div className="relative space-y-6 sm:space-y-8">
      <AuroraBackground className="opacity-50" />

      <PageHeader
        eyebrow={needsSetup ? "Welcome" : "Your compatibility journey"}
        title={`Namaste, ${firstName}`}
        description={
          needsSetup
            ? "A few steps unlock personalized matches and Vedic compatibility."
            : "Discover people aligned with you — astrology supports the decision."
        }
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href={needsSetup ? (bundle?.nextSetupHref ?? routes.onboarding) : routes.matches}>
              {needsSetup ? bundle?.nextSetupLabel || "Continue Setup" : "View matches"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {needsSetup ? (
        <GlassCard className="relative space-y-4">
          <div>
            <h2 className="font-display text-2xl">Complete your VedaMilan profile</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              More details help us find more relevant matches.
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile readiness</span>
            <span className="font-medium">{bundle?.completion ?? 0}%</span>
          </div>
          <Progress value={bundle?.completion ?? 0} />
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>{(bundle?.completion ?? 0) >= 40 ? "✓" : "○"} Basic information</li>
            <li>{bundle?.hasBirth ? "✓" : "○"} Birth details</li>
            <li>{bundle?.hasChart ? "✓" : "○"} Kundli</li>
            <li>{(bundle?.matches.length ?? 0) > 0 ? "✓" : "○"} First recommendations</li>
          </ul>
          <Button asChild>
            <Link href={bundle?.nextSetupHref ?? routes.onboarding}>{bundle?.nextSetupLabel}</Link>
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Recommended for you</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.matches}>See all</Link>
              </Button>
            </div>
            {bundle?.matches?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {bundle.matches.map((m) => (
                  <MatchCard
                    key={m.userId}
                    name={m.name}
                    age={m.age ?? 0}
                    city={m.city || "—"}
                    profession={m.profession || "—"}
                    score={m.compatibilityScore}
                    aiScore={m.compatibilityScore}
                    headline={m.headline}
                    photo={m.photo || undefined}
                    href={`${routes.matchProfile}?id=${m.userId}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matches yet"
                description="We need a few more details — or more members — to surface meaningful matches."
                action={
                  <Button asChild>
                    <Link href={routes.search}>Explore Search</Link>
                  </Button>
                }
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Moon
              </p>
              <p className="font-display mt-2 text-2xl">{bundle?.moonSign || "—"}</p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href={routes.kundli}>Open Kundli</Link>
              </Button>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Dasha
              </p>
              <p className="font-display mt-2 text-2xl">{bundle?.currentMaha || "—"}</p>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Alerts
              </p>
              <p className="font-display mt-2 text-2xl">{bundle?.unread ?? 0}</p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href={routes.notifications}>Notifications</Link>
              </Button>
            </GlassCard>
          </div>

          {bundle?.insight ? (
            <GlassCard>
              <p className="text-ai flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Astrology insight
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                {bundle.insight}
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link href={routes.aiInsights}>Ask AI about my chart</Link>
              </Button>
            </GlassCard>
          ) : null}
        </>
      )}
    </div>
  );
}
