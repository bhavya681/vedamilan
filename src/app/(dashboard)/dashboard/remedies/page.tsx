"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import {
  remediesForDoshas,
  REMEDY_DISCLAIMER,
  type RemedyTheme,
} from "@/application/horoscope/remedy-themes";
import { routes } from "@/lib/constants/routes";

export default function RemediesPage() {
  const [themes, setThemes] = useState<RemedyTheme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/horoscope")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !json.data?.horoscope) {
          setError("Generate your kundli to see remedial themes linked to flagged factors.");
          return;
        }
        setThemes(remediesForDoshas(json.data.horoscope.doshas || []));
      })
      .catch(() => setError("Failed to load remedies"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Structured guidance"
        title="Lal Kitab"
        description="Traditional Lal Kitab–inspired themes mapped only to engine-flagged chart factors."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.yogas}>Yogas & doshas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.rajaYogas}>Raja Yogas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          </div>
        }
      />

      <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{REMEDY_DISCLAIMER}</p>

      {loading ? <PanelSkeleton lines={4} /> : null}
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && !error && themes.length === 0 ? (
        <EmptyState
          title="No remedial themes flagged"
          description="Your chart has no mapped dosha themes in the current Lal Kitab catalog. Ask AI Guru for chart-backed reflection."
          action={
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          }
        />
      ) : null}

      <div className="space-y-4">
        {themes.map((theme) => (
          <GlassCard key={theme.planetaryFactor} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Traditional guidance</Badge>
              <Badge variant="outline">Not medical advice</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Planetary factor
                </p>
                <p className="mt-1 text-sm font-medium">{theme.planetaryFactor}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Observed theme
                </p>
                <p className="mt-1 text-sm">{theme.observedTheme}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Possible remedy
                </p>
                <p className="mt-1 text-sm">{theme.possibleRemedy}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Reason
                </p>
                <p className="mt-1 text-sm">{theme.reason}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Duration / practice · {theme.durationPractice}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
