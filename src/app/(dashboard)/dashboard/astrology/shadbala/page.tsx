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
import { SIGNS } from "@/application/horoscope/vedic-constants";

type PlanetShadbala = {
  planet: string;
  sign: string;
  house: number;
  total: number;
  percentage: number;
  grade: "Excellent" | "Good" | "Average" | "Weak";
  components: Array<{
    name: string;
    sanskrit: string;
    score: number;
    max: number;
    note: string;
  }>;
  interpretation: string;
};

type ShadbalaLab = {
  planets: PlanetShadbala[];
  strongest: PlanetShadbala | null;
  weakest: PlanetShadbala | null;
  overallTheme: string;
};

const GRADE_TONE: Record<string, string> = {
  Excellent: "text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  Good: "text-foreground border-gold/40 bg-gold/10",
  Average: "text-foreground border-amber-500/40 bg-amber-500/10",
  Weak: "text-foreground border-rose/40 bg-rose/10",
};

const COMPONENT_COLORS: Record<string, string> = {
  Sthana: "bg-emerald-500",
  Dig: "bg-gold",
  Kala: "bg-sky-500",
  Chesta: "bg-violet-500",
  Naisargika: "bg-amber-500",
  Drik: "bg-rose",
};

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

const BALA_EDUCATION: Record<string, { what: string; how: string; why: string }> = {
  Sthana: {
    what: "Positional strength based on house and sign placement.",
    how: "Scores are added for Kendra (angular), Trikona (trinal), and Lagna placements. Own sign and exaltation add further weight. Debilitation and dusthana houses reduce the score.",
    why: "A planet in a strong position can express its nature more freely and constructively.",
  },
  Dig: {
    what: "Directional strength determined by the sign the planet occupies.",
    how: "Each planet has favorable directions and signs. When placed in those signs, Dig Bala increases. Unfavorable signs reduce it.",
    why: "Directional alignment affects how easily a planet can act in accordance with its natural temperament.",
  },
  Kala: {
    what: "Temporal strength from time-related factors.",
    how: "Factors include whether the planet is stronger during day or night, retrograde motion (Chesta), and angularity from the ascendant.",
    why: "Even a well-placed planet may be weakened if its temporal conditions are adverse.",
  },
  Chesta: {
    what: "Motional strength derived from the planet's movement.",
    how: "Retrograde motion increases Chesta Bala for all planets. Malefics gain more from retrograde intensity than benefics.",
    why: "Retrograde planets often operate with greater internal focus or intensity.",
  },
  Naisargika: {
    what: "Inherent natural strength of the planet.",
    how: "Fixed values are assigned based on the planet's intrinsic nature. The Sun and Jupiter are naturally strong. Saturn is naturally weaker.",
    why: "Some planets are innately more expressive or potent regardless of chart placement.",
  },
  Drik: {
    what: "Aspectual strength from the influence of other planets.",
    how: "Benefic aspects increase Drik Bala. Malefic aspects decrease it. The net balance of surrounding planetary influence determines the final score.",
    why: "No planet acts in isolation — the chart environment modifies its strength.",
  },
};

export default function AstrologyShadbalaPage() {
  const [data, setData] = useState<ShadbalaLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [expandedBala, setExpandedBala] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/astrology/shadbala")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Shadbala");
          return;
        }
        setData(json.data);
        if (json.data.planets.length > 0) {
          setSelectedPlanet(json.data.planets[0].planet);
        }
      })
      .catch(() => setError("Unable to load Shadbala"))
      .finally(() => setLoading(false));
  }, []);

  const selected = data?.planets.find((p) => p.planet === selectedPlanet) || null;
  const rank =
    selected && data
      ? data.planets
          .slice()
          .sort((a, b) => b.total - a.total)
          .findIndex((p) => p.planet === selected.planet) + 1
      : null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Shadbala — Six-Fold Strength"
        title="Shadbala"
        description="Classical six-fold planetary strength analysis — Sthana, Dig, Kala, Chesta, Naisargika, and Drik Bala. Higher scores indicate stronger planetary expression."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyPlanetStrength}>Planet Strength</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={8} /> : null}
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
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Strongest Planet
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.strongest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.strongest ? `${data.strongest.percentage}% — ${data.strongest.grade}` : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Weakest Planet
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.weakest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.weakest ? `${data.weakest.percentage}% — ${data.weakest.grade}` : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Planets Analyzed
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.planets.length}</p>
              <p className="text-muted-foreground text-xs">Sun through Saturn</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Overall Theme
              </p>
              <p className="font-display text-lg leading-snug sm:text-xl">{data.overallTheme}</p>
            </GlassCard>
          </div>

          {/* Planet Selector */}
          <GlassCard className="space-y-3">
            <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch]">
              {PLANET_ORDER.map((p) => {
                const planetData = data.planets.find((pd) => pd.planet === p);
                const isActive = selectedPlanet === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlanet(p)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                      isActive
                        ? "border-gold/40 bg-primary/12 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p}
                    {planetData && (
                      <span className="ml-1 text-[10px] opacity-70">{planetData.percentage}%</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                {/* Left: Planet Overview */}
                <div className="space-y-3">
                  <div className="text-center sm:text-left">
                    <p className="font-display text-2xl sm:text-3xl">{selected.planet}</p>
                    <p className="text-muted-foreground text-xs">
                      {selected.sign} · House {selected.house}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", GRADE_TONE[selected.grade])}
                      >
                        {selected.grade}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Rank #{rank}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Overall Strength</span>
                      <span className="font-medium">{selected.total} / 330</span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          selected.grade === "Excellent"
                            ? "bg-emerald-500"
                            : selected.grade === "Good"
                              ? "bg-gold"
                              : selected.grade === "Average"
                                ? "bg-amber-500"
                                : "bg-rose",
                        )}
                        style={{ width: `${selected.percentage}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-[10px]">
                      {selected.percentage}% of maximum theoretical strength
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Why this strength?
                    </p>
                    <p className="text-xs leading-relaxed">{selected.interpretation}</p>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-between text-xs"
                    onClick={() => setShowCalculation(!showCalculation)}
                  >
                    <span>Calculation Details</span>
                    <span className="text-muted-foreground">
                      {showCalculation ? "Hide" : "Show"}
                    </span>
                  </Button>
                  {showCalculation && (
                    <GlassCard className="space-y-2 p-3 text-xs">
                      <p className="text-muted-foreground">
                        Engine: Classical Shadbala approximation v1
                      </p>
                      <p className="text-muted-foreground">
                        Components: Sthana (max 60) + Dig (max 20) + Kala (max 20) + Chesta (max 20)
                        + Naisargika (max 60) + Drik (max 20) = 330 max
                      </p>
                      <p className="text-muted-foreground">
                        Source: Stored planetary positions from your latest calculated chart.
                      </p>
                    </GlassCard>
                  )}
                </div>

                {/* Right: Component Breakdown */}
                <div className="space-y-3">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Component Breakdown
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.components.map((c) => {
                      const isExpanded = expandedBala === c.name;
                      const edu = BALA_EDUCATION[c.name];
                      return (
                        <div
                          key={c.sanskrit}
                          className="border-border/60 bg-muted/20 rounded-xl border p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{c.name}</p>
                              <p className="text-muted-foreground text-[10px]">{c.sanskrit}</p>
                            </div>
                            <span className="font-display text-sm">
                              {c.score}
                              <span className="text-muted-foreground">/{c.max}</span>
                            </span>
                          </div>
                          <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                COMPONENT_COLORS[c.name] || "bg-muted-foreground",
                              )}
                              style={{ width: `${(c.score / c.max) * 100}%` }}
                            />
                          </div>
                          <p className="text-muted-foreground mt-1.5 text-[10px]">{c.note}</p>
                          <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground mt-2 h-auto p-0 text-[10px]"
                            onClick={() => setExpandedBala(isExpanded ? null : c.name)}
                          >
                            {isExpanded ? "Hide explanation" : "What is this?"}
                          </Button>
                          {isExpanded && edu && (
                            <div className="border-border/50 mt-2 space-y-1 border-t pt-2 text-[10px]">
                              <p>
                                <span className="font-medium">What:</span> {edu.what}
                              </p>
                              <p>
                                <span className="font-medium">How:</span> {edu.how}
                              </p>
                              <p>
                                <span className="font-medium">Why:</span> {edu.why}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* House-wise Planet Strength */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">House-wise Planet Strength</h2>
                <p className="text-muted-foreground text-xs">
                  Planets placed in each house with their Shadbala scores.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                const planetsInHouse = data.planets.filter((p) => p.house === house);
                const houseTotal = planetsInHouse.reduce((sum, p) => sum + p.total, 0);
                const houseAvg = planetsInHouse.length ? houseTotal / planetsInHouse.length : 0;
                const lagnaPlanet = data.planets.find((p) => p.house === 1);
                const lagnaSign = lagnaPlanet?.sign || "Aries";
                const lagnaIndex = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
                const houseSign = SIGNS[(lagnaIndex + house - 1) % 12];
                return (
                  <div key={house} className="border-border/60 bg-muted/20 rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">House {house}</p>
                      {planetsInHouse.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          Avg {houseAvg.toFixed(0)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[10px]">{houseSign}</p>
                    <div className="mt-2 space-y-1">
                      {planetsInHouse.length === 0 ? (
                        <p className="text-muted-foreground text-[10px]">No planets</p>
                      ) : (
                        planetsInHouse.map((p) => (
                          <div key={p.planet} className="flex items-center justify-between gap-2">
                            <span className="text-xs">{p.planet}</span>
                            <span className={cn("text-[10px] font-medium", GRADE_TONE[p.grade])}>
                              {p.total}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Planet Ranking */}
          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Planet Ranking</h2>
            <p className="text-muted-foreground text-xs">
              All planets ranked by total Shadbala score.
            </p>
            <div className="space-y-2">
              {[...data.planets]
                .sort((a, b) => b.total - a.total)
                .map((p, idx) => (
                  <div key={p.planet} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-4 text-right text-xs">#{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{p.planet}</p>
                        <Badge variant="outline" className={cn("text-[10px]", GRADE_TONE[p.grade])}>
                          {p.total}
                        </Badge>
                      </div>
                      <div className="bg-muted mt-1 h-1 w-full overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            p.grade === "Excellent"
                              ? "bg-emerald-500"
                              : p.grade === "Good"
                                ? "bg-gold"
                                : p.grade === "Average"
                                  ? "bg-amber-500"
                                  : "bg-rose",
                          )}
                          style={{ width: `${p.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>

          {/* AI Suggestions */}
          <GlassCard className="border-gold/20 space-y-3 p-4 sm:p-5">
            <p className="text-gold/85 text-[11px] font-medium tracking-[0.16em] uppercase">
              Ask the Astrology AI
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                `Why is my ${selected?.planet || "Sun"} ${selected?.grade?.toLowerCase() || "strong"}?`,
                "Which planet has the highest Shadbala?",
                "How does Shadbala relate to my Dasha?",
                "Explain Shadbala like a beginner.",
                "Show me the technical calculation.",
              ].map((q) => (
                <Button key={q} variant="outline" size="sm" className="text-xs">
                  {q}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-[10px]">
              AI uses your calculated Shadbala data to explain planetary strength. It does not
              recalculate astrology.
            </p>
          </GlassCard>

          {/* Educational */}
          <GlassCard className="space-y-3 p-4 sm:p-5">
            <h2 className="font-display text-xl">Understanding Shadbala</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Sthana Bala",
                  desc: "Positional strength from house and sign placement. Kendra and Trikona houses enhance it.",
                },
                {
                  name: "Dig Bala",
                  desc: "Directional strength based on the sign the planet occupies and its natural direction.",
                },
                {
                  name: "Kala Bala",
                  desc: "Temporal strength from time of day, day/night, and angularity.",
                },
                {
                  name: "Chesta Bala",
                  desc: "Motional strength from retrograde motion and planetary speed.",
                },
                {
                  name: "Naisargika Bala",
                  desc: "Inherent natural strength based on the planet's intrinsic nature.",
                },
                {
                  name: "Drik Bala",
                  desc: "Aspectual strength from favorable or challenging aspects from other planets.",
                },
              ].map((item) => (
                <div key={item.name} className="border-border/60 bg-muted/20 rounded-xl border p-3">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              This Shadbala is computed from your stored planetary positions using classical
              approximation rules. For precise Shadbala, consult a professional astrologer with
              exact degree-based calculations.
            </p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
