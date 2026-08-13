"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type PlanetStrength = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  dignity: string | null;
  isRetrograde: boolean;
  strength: "strong" | "moderate" | "needs-attention";
  score: number;
  factors: string[];
};

type StrengthLab = {
  planets: PlanetStrength[];
  strongest: PlanetStrength | null;
  weakest: PlanetStrength | null;
  overallTheme: string;
};

const STRENGTH_STYLE: Record<string, string> = {
  strong: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  moderate: "border-gold/40 bg-gold/10 text-foreground",
  "needs-attention": "border-rose/40 bg-rose/10 text-foreground",
};

export default function AstrologyPlanetStrengthPage() {
  const [data, setData] = useState<StrengthLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/astrology/planet-strength")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load planet strength");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load planet strength"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Planetary power analysis"
        title="Planet Strength Lab"
        description="Dignity, house placement, nakshatra, and retrograde status for each planet — educational read, not deterministic prediction."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyYogas}>Yogas</Link>
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
          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Overall theme</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{data.overallTheme}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.strongest ? (
                <div className="rounded-xl border border-emerald-500/30 p-3">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Strongest
                  </p>
                  <p className="font-display text-lg">{data.strongest.planet}</p>
                  <p className="text-muted-foreground text-xs">
                    {data.strongest.sign} · House {data.strongest.house} · Score{" "}
                    {data.strongest.score}
                  </p>
                </div>
              ) : null}
              {data.weakest ? (
                <div className="border-rose/30 rounded-xl border p-3">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Needs attention
                  </p>
                  <p className="font-display text-lg">{data.weakest.planet}</p>
                  <p className="text-muted-foreground text-xs">
                    {data.weakest.sign} · House {data.weakest.house} · Score {data.weakest.score}
                  </p>
                </div>
              ) : null}
            </div>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.planets.map((p) => (
              <GlassCard key={p.planet} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base">{p.planet}</p>
                  <Badge className={cn("border text-[10px]", STRENGTH_STYLE[p.strength])}>
                    {p.strength}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {p.sign} · House {p.house} · {p.nakshatra}
                </p>
                <p className="text-muted-foreground text-xs">
                  Dignity: {p.dignity || "N/A"} {p.isRetrograde ? "· Retrograde" : ""}
                </p>
                <p className="text-muted-foreground text-xs">Score: {p.score}/100</p>
                <div className="flex flex-wrap gap-1">
                  {p.factors.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
