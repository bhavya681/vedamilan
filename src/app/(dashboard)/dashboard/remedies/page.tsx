"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import type {
  LalKitabPlacement,
  LalKitabRemedyCard,
  LalKitabSutraHit,
  LalKitabRating,
} from "@/application/horoscope/lal-kitab";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Tab = "placements" | "sutras" | "remedies";

type Report = {
  lagnaSign: string | null;
  placements: LalKitabPlacement[];
  sutras: LalKitabSutraHit[];
  remedies: LalKitabRemedyCard[];
  summary: string;
  methodology: string;
  disclaimer: string;
};

const RATING_STYLE: Record<LalKitabRating, string> = {
  pakka: "border-gold/40 bg-gold/10 text-foreground",
  exalted: "border-primary/40 bg-primary/10 text-foreground",
  favorable: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  neutral: "border-border/60 bg-muted/40 text-muted-foreground",
  challenging: "border-rose/40 bg-rose/10 text-foreground",
};

const RATING_LABEL: Record<LalKitabRating, string> = {
  pakka: "Pakka ghar",
  exalted: "Strong house",
  favorable: "Favourable",
  neutral: "Mixed",
  challenging: "Needs care",
};

export default function RemediesPage() {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("placements");

  useEffect(() => {
    void fetch("/api/lal-kitab")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json?.error?.message || "Generate your kundli to open Lal Kitab analysis.");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Failed to load Lal Kitab analysis"))
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(
    () =>
      [
        {
          id: "placements" as const,
          label: "House placements",
          count: data?.placements.length || 0,
        },
        { id: "sutras" as const, label: "Sutras", count: data?.sutras.length || 0 },
        { id: "remedies" as const, label: "Remedies", count: data?.remedies.length || 0 },
      ] as const,
    [data],
  );

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Structured guidance · house-based"
        title="Lal Kitab"
        description="Planet×house predictions, combination sutras, and everyday upayas mapped from your stored kundli — Lal Kitab style."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.yogas}>Yogas & doshas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>My Kundli</Link>
            </Button>
            <Button asChild variant="ai">
              <Link href={routes.aiInsights}>
                <Sparkles className="h-4 w-4" />
                Ask AI Guru
              </Link>
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
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <>
          <section className="border-border/50 from-muted/35 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-5 sm:p-6">
            <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase">
              <BookOpen className="h-3.5 w-3.5" />
              Lal Kitab house scan
              {data.lagnaSign ? ` · Lagna ${data.lagnaSign}` : ""}
            </p>
            <p className="font-display mt-2 text-xl leading-snug sm:text-2xl">{data.summary}</p>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
              {data.methodology}
            </p>
          </section>

          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  tab === t.id
                    ? "border-gold/45 bg-gold/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span className="text-muted-foreground ml-1.5 tabular-nums">{t.count}</span>
              </button>
            ))}
          </div>

          {tab === "placements" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.placements.map((pl) => (
                <GlassCard key={`${pl.planet}-${pl.house}`} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg">
                      {pl.planet} · {pl.house}th
                    </p>
                    <Badge className={cn("border text-[10px]", RATING_STYLE[pl.rating])}>
                      {RATING_LABEL[pl.rating]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Sign · {pl.sign} · {pl.sutraNote}
                  </p>
                  <p className="text-sm leading-relaxed">{pl.prediction}</p>
                  <div className="border-border/40 space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Everyday upaya
                    </p>
                    <p className="text-sm leading-relaxed">{pl.remedy}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Avoid · {pl.avoid}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : null}

          {tab === "sutras" ? (
            <div className="space-y-3">
              {data.sutras.length === 0 ? (
                <EmptyState
                  title="No combination sutras flagged"
                  description="No major Lal Kitab combination patterns matched this chart view."
                />
              ) : (
                data.sutras.map((s) => (
                  <GlassCard key={s.code} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          s.severity === "caution"
                            ? "destructive"
                            : s.severity === "supportive"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {s.severity}
                      </Badge>
                      {s.house ? <Badge variant="outline">House {s.house}</Badge> : null}
                      {s.planets.map((p) => (
                        <Badge key={p} variant="outline">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="font-display text-xl">{s.title}</h2>
                    <p className="text-sm leading-relaxed">{s.description}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Upaya ·{" "}
                      </span>
                      {s.remedy}
                    </p>
                  </GlassCard>
                ))
              )}
            </div>
          ) : null}

          {tab === "remedies" ? (
            <div className="space-y-3">
              {data.remedies.length === 0 ? (
                <EmptyState
                  title="No priority upayas"
                  description="No challenging placements or caution sutras required a priority remedy card. Review house placements for supportive practices."
                  action={
                    <Button type="button" variant="outline" onClick={() => setTab("placements")}>
                      View placements
                    </Button>
                  }
                />
              ) : (
                data.remedies.map((theme) => (
                  <GlassCard key={theme.id} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{theme.source}</Badge>
                      <Badge variant="outline">Not medical advice</Badge>
                      <h2 className="font-display w-full text-lg sm:w-auto">{theme.title}</h2>
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
                        <p className="mt-1 text-sm leading-relaxed">{theme.observedTheme}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Possible remedy
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{theme.possibleRemedy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Reason
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{theme.reason}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Duration / practice · {theme.durationPractice}
                    </p>
                  </GlassCard>
                ))
              )}
            </div>
          ) : null}

          <p className="text-muted-foreground text-xs leading-relaxed">{data.disclaimer}</p>
        </>
      ) : null}
    </div>
  );
}
