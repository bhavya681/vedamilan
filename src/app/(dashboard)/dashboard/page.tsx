"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Stars } from "lucide-react";

import { PageHeader, AuroraBackground, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard, MatchCard, GlassCard } from "@/components/ui/premium-cards";
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
};

export default function DashboardPage() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, profile, matches, ai, notes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/recommendations").then((r) => r.json()),
          fetch("/api/ai/insights").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
        ]);

        const profileData = profile.success ? profile.data : null;
        const horoscope = profileData?.completion; // may not include chart
        const chartRes = await fetch("/api/horoscope").then((r) => r.json());
        const chart = chartRes.success ? chartRes.data : null;

        const matchItems = matches.success ? matches.data.data || [] : [];
        const insight =
          ai.success && ai.data.insights?.[0]?.body
            ? ai.data.insights[0].body
            : "Ask AI Insights after generating your kundli for explainable guidance.";

        setBundle({
          userName: me.user?.name || profileData?.user?.name || "friend",
          completion: profileData?.completion?.score ?? 0,
          hasBirth: Boolean(profileData?.birthDetails),
          hasChart: Boolean(chart?.horoscope),
          moonSign: chart?.horoscope?.moonSign || null,
          currentMaha: chart?.dasha?.currentMaha || null,
          matches: matchItems.slice(0, 4),
          insight: String(insight).slice(0, 420),
          unread: notes.success ? notes.data.unread || 0 : 0,
        });
        void horoscope;
      } catch {
        setError("Failed to load dashboard");
      }
    }
    void load();
  }, []);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";
  const steps = [
    {
      done: (bundle?.completion ?? 0) >= 40,
      label: "Complete profile",
      href: routes.editProfile,
    },
    { done: Boolean(bundle?.hasBirth), label: "Add birth details", href: routes.birthDetails },
    { done: Boolean(bundle?.hasChart), label: "Generate kundli", href: routes.kundli },
    { done: (bundle?.matches.length ?? 0) > 0, label: "Explore matches", href: routes.matches },
  ];

  return (
    <div className="relative space-y-6 sm:space-y-8">
      <AuroraBackground className="opacity-50" />

      <PageHeader
        eyebrow="Welcome"
        title={`Namaste, ${firstName}`}
        description="Your workspace for matches, charts, timing, and AI guidance."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href={routes.matches}>
              View matches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile"
          value={`${bundle?.completion ?? 0}%`}
          hint="Completion score"
          tone="gold"
        />
        <StatCard
          label="Moon sign"
          value={bundle?.moonSign || "—"}
          hint={bundle?.hasChart ? "From your kundli" : "Generate kundli"}
          tone="ai"
        />
        <StatCard label="Mahadasha" value={bundle?.currentMaha || "—"} hint="Current period" />
        <StatCard
          label="Alerts"
          value={String(bundle?.unread ?? 0)}
          hint="Unread notifications"
          tone="rose"
        />
      </div>

      {!bundle?.hasChart || (bundle?.completion ?? 0) < 80 ? (
        <GlassCard className="relative">
          <h2 className="font-display text-2xl">Get started</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Finish these steps so matching and AI explanations use your real chart data.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {steps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className="border-border/50 hover:bg-muted/40 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
              >
                <span>
                  {step.done ? "✓ " : "○ "}
                  {step.label}
                </span>
                <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <div className="relative grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" glow>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-secondary flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                <Stars className="h-3.5 w-3.5" />
                Chart snapshot
              </p>
              <h2 className="font-display mt-2 text-2xl sm:text-3xl">
                {bundle?.hasChart
                  ? `${bundle.moonSign} Moon · ${bundle.currentMaha || "Dasha"}`
                  : "No kundli yet"}
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={routes.kundli}>{bundle?.hasChart ? "Open kundli" : "Generate"}</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            {bundle?.hasChart
              ? "Deterministic engines calculated your chart. Open AI Insights for plain-language explanations."
              : "Add birth details, then generate your kundli. Swiss/Moshier engines calculate — AI only explains."}
          </p>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Profile readiness</span>
              <span>{bundle?.completion ?? 0}%</span>
            </div>
            <Progress value={bundle?.completion ?? 0} />
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-ai flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI insight
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-wrap">
            {bundle?.insight}
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
            <Link href={routes.aiInsights}>Ask AI</Link>
          </Button>
        </GlassCard>
      </div>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Recommended matches</h2>
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
            description="Complete profile and kundli so Ashta Koota ranking can surface compatible members."
            action={
              <Button asChild>
                <Link href={routes.birthDetails}>Add birth details</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
