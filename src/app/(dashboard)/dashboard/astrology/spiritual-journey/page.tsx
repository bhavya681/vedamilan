"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type SpiritualTheme = {
  house: number;
  theme: string;
  description: string;
  activePlanets: string[];
  lord: string;
  strength: "high" | "moderate" | "emerging";
};

type SpiritualJourney = {
  themes: SpiritualTheme[];
  currentDasha: string | null;
  currentAntar: string | null;
  journeyPhase: string;
  practices: string[];
  reflections: string[];
  learningMilestones: string[];
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  Learning: "Foundation building through study and awareness.",
  Discipline: "Structured practice and consistent effort.",
  Reflection: "Inner turn — solitude, meditation, and self-inquiry.",
  Detachment: "Witnessing outcomes without clinging.",
  Wisdom: "Integrated understanding — teaching and guidance emerge.",
  Service: "Selfless action — seva and compassionate outreach.",
};

export default function AstrologySpiritualJourneyPage() {
  const [data, setData] = useState<SpiritualJourney | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/astrology/spiritual-journey")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load spiritual journey");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load spiritual journey"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Traditional Jyotish perspective"
        title="Spiritual Journey"
        description="Explore 5th, 9th, and 12th house themes, Jupiter and Ketu influences, and your current dasha phase — presented as guidance, not enlightenment claims."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyPanchanga}>Panchanga</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={6} /> : null}
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <>
          <GlassCard className="border-gold/25 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                Current phase
              </p>
              <Badge variant="secondary">{data.journeyPhase}</Badge>
            </div>
            <p className="font-display text-xl leading-snug sm:text-2xl">
              {PHASE_DESCRIPTIONS[data.journeyPhase] || "Continue exploring your chart."}
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
              <span>Dasha: {data.currentDasha || "—"}</span>
              <span>Antar: {data.currentAntar || "—"}</span>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.themes.map((theme) => (
              <GlassCard key={theme.house} className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    {theme.house}th House
                  </p>
                  <h2 className="font-display text-lg">{theme.theme}</h2>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{theme.description}</p>
                <div className="flex flex-wrap gap-2">
                  {theme.activePlanets.map((p) => (
                    <Badge key={p} variant="outline">
                      {p}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Lord: {theme.lord} · Strength: {theme.strength}
                </p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Suggested practices</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.practices.map((practice) => (
                <li key={practice} className="text-sm leading-relaxed">
                  · {practice}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Learning milestones</h2>
            <ul className="space-y-2">
              {data.learningMilestones.map((milestone) => (
                <li key={milestone} className="text-sm leading-relaxed">
                  · {milestone}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Reflections</h2>
            <ul className="space-y-2">
              {data.reflections.map((reflection) => (
                <li key={reflection} className="text-muted-foreground text-sm leading-relaxed">
                  · {reflection}
                </li>
              ))}
            </ul>
          </GlassCard>
        </>
      ) : null}
    </div>
  );
}
