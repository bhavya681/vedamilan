"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MatchCard } from "@/components/ui/premium-cards";
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
    headline: string | null;
    cardSummary?: string;
    reasons?: string[];
    photo: string | null;
  }>;
  insight: string | null;
  unread: number;
  nextSetupHref: string;
  nextSetupLabel: string;
};

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

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
              ? "Open Insights for a plain-language reading of your chart."
              : null;

        let nextSetupHref: string = routes.onboarding;
        let nextSetupLabel = "Continue setup";
        if (completion < 40) {
          nextSetupHref = routes.onboarding;
          nextSetupLabel = "Help us understand you";
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
          matches: matchItems.slice(0, 3),
          insight: insight ? String(insight).slice(0, 320) : null,
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
    <div className="relative space-y-8 sm:space-y-10">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={
          needsSetup
            ? "A few thoughtful steps unlock personalized matches and deeper compatibility."
            : "Your journey toward meaningful compatibility continues."
        }
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href={needsSetup ? (bundle?.nextSetupHref ?? routes.onboarding) : routes.matches}>
              {needsSetup ? bundle?.nextSetupLabel || "Continue setup" : "View matches"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {needsSetup ? (
        <section className="border-border/70 bg-card shadow-soft space-y-4 rounded-2xl border p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">Help us understand you</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The more we know, the more meaningful your matches become.
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile readiness</span>
            <span className="font-medium">{bundle?.completion ?? 0}%</span>
          </div>
          <Progress value={bundle?.completion ?? 0} />
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>{(bundle?.completion ?? 0) >= 40 ? "·" : "·"} Basic information</li>
            <li className={bundle?.hasBirth ? "text-foreground" : undefined}>
              {bundle?.hasBirth ? "Birth details added" : "Birth details needed"}
            </li>
            <li className={bundle?.hasChart ? "text-foreground" : undefined}>
              {bundle?.hasChart ? "Kundli ready" : "Kundli needed"}
            </li>
          </ul>
          <Button asChild>
            <Link href={bundle?.nextSetupHref ?? routes.onboarding}>{bundle?.nextSetupLabel}</Link>
          </Button>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">People to consider</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  A few aligned profiles to start with.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.matches}>See all</Link>
              </Button>
            </div>
            {bundle?.matches?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {bundle.matches.map((m) => (
                  <MatchCard
                    key={m.userId}
                    name={m.name}
                    age={m.age ?? 0}
                    city={m.city || "—"}
                    profession={m.profession || "—"}
                    score={m.compatibilityScore}
                    headline={
                      m.reasons?.[0] || m.cardSummary || m.headline || "Explore this connection"
                    }
                    photo={m.photo || undefined}
                    href={`${routes.matchProfile}?id=${m.userId}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Finding meaningful connections"
                description="We need a few more details — or more members — to surface aligned people."
                action={
                  <Button asChild>
                    <Link href={routes.search}>Explore Search</Link>
                  </Button>
                }
              />
            )}
          </section>

          <section className="border-border/60 grid gap-6 border-t pt-8 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Your Vedic note</p>
              <p className="font-display mt-2 text-3xl">{bundle?.moonSign || "—"}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Moon · Dasha {bundle?.currentMaha || "—"}
              </p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href={routes.kundli}>Open your Kundli</Link>
              </Button>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Activity</p>
              <p className="font-display mt-2 text-3xl">{bundle?.unread ?? 0}</p>
              <p className="text-muted-foreground mt-1 text-sm">Unread notifications</p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href={routes.notifications}>View activity</Link>
              </Button>
            </div>
          </section>

          {bundle?.insight ? (
            <section className="border-border/70 bg-card shadow-soft rounded-2xl border p-5 sm:p-6">
              <p className="text-muted-foreground text-sm">Compatibility insight</p>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{bundle.insight}</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={routes.aiInsights}>Ask AI Guru</Link>
              </Button>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
