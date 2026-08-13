"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipProvider } from "@/components/ui/tooltip";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type SavRow = { house: number; sign: string; bindus: number; note: string };
type Ashtaka = {
  methodology: string;
  lagnaSign: string;
  sarva: SavRow[];
  bhinna: Record<string, Array<{ house: number; sign: string; bindus: number }>>;
  highlights: string[];
};

const HOUSE_THEMES: Record<number, { area: string; theme: string }> = {
  1: { area: "Self", theme: "Identity, vitality, new beginnings, physical body" },
  2: { area: "Wealth", theme: "Speech, family, resources, values, food" },
  3: { area: "Courage", theme: "Siblings, effort, short travel, communication" },
  4: { area: "Home", theme: "Mother, home, emotional roots, peace, education" },
  5: { area: "Creativity", theme: "Children, romance, intellect, creativity, speculation" },
  6: { area: "Health", theme: "Enemies, obstacles, service, health, pets" },
  7: { area: "Partnership", theme: "Marriage, partnerships, public, contracts" },
  8: { area: "Transformation", theme: "Longevity, occult, shared resources, transformation" },
  9: { area: "Dharma", theme: "Fortune, mentors, higher learning, long travel, philosophy" },
  10: { area: "Career", theme: "Profession, status, authority, public image" },
  11: { area: "Gains", theme: "Income, networks, friends, aspirations, elder siblings" },
  12: { area: "Liberation", theme: "Foreign lands, expenses, spirituality, moksha, solitude" },
};

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

function strengthLabel(bindus: number): string {
  if (bindus >= 30) return "Strong";
  if (bindus >= 20) return "Supportive";
  if (bindus >= 12) return "Average";
  return "Sensitive";
}

function strengthTone(bindus: number): string {
  if (bindus >= 30)
    return "text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (bindus >= 20) return "text-foreground border-gold/40 bg-gold/10";
  if (bindus >= 12) return "text-foreground border-amber-500/40 bg-amber-500/10";
  return "text-foreground border-rose/40 bg-rose/10";
}

function binduProgress(bindus: number): number {
  return Math.min(100, Math.max(0, (bindus / 56) * 100));
}

const BINDU_COLORS: Record<number, string> = {
  0: "border-border/40 bg-muted/20",
  1: "border-border/40 bg-muted/20",
  2: "border-border/40 bg-muted/20",
  3: "border-border/40 bg-muted/20",
  4: "border-border/40 bg-muted/20",
  5: "border-border/40 bg-muted/20",
  6: "border-border/40 bg-muted/20",
  7: "border-border/40 bg-muted/20",
  8: "border-border/40 bg-muted/20",
  9: "border-border/40 bg-muted/20",
  10: "border-border/40 bg-muted/20",
  11: "border-border/40 bg-muted/20",
  12: "border-amber-500/30 bg-amber-500/5",
  13: "border-amber-500/30 bg-amber-500/5",
  14: "border-amber-500/30 bg-amber-500/5",
  15: "border-amber-500/30 bg-amber-500/5",
  16: "border-amber-500/30 bg-amber-500/5",
  17: "border-amber-500/30 bg-amber-500/5",
  18: "border-amber-500/30 bg-amber-500/5",
  19: "border-amber-500/30 bg-amber-500/5",
  20: "border-gold/30 bg-primary/5",
  21: "border-gold/30 bg-primary/5",
  22: "border-gold/30 bg-primary/5",
  23: "border-gold/30 bg-primary/5",
  24: "border-gold/30 bg-primary/5",
  25: "border-gold/30 bg-primary/5",
  26: "border-gold/30 bg-primary/5",
  27: "border-gold/30 bg-primary/5",
  28: "border-gold/30 bg-primary/5",
  29: "border-gold/30 bg-primary/5",
  30: "border-emerald-500/30 bg-emerald-500/5",
  31: "border-emerald-500/30 bg-emerald-500/5",
  32: "border-emerald-500/30 bg-emerald-500/5",
  33: "border-emerald-500/30 bg-emerald-500/5",
  34: "border-emerald-500/30 bg-emerald-500/5",
  35: "border-emerald-500/30 bg-emerald-500/5",
  36: "border-emerald-500/30 bg-emerald-500/5",
  37: "border-emerald-500/30 bg-emerald-500/5",
  38: "border-emerald-500/30 bg-emerald-500/5",
  39: "border-emerald-500/30 bg-emerald-500/5",
  40: "border-emerald-500/30 bg-emerald-500/5",
};

function binduColor(bindus: number) {
  return BINDU_COLORS[Math.max(0, Math.min(40, bindus))] || "border-border/40 bg-muted/20";
}

export default function AstrologyAshtakavargaPage() {
  const [data, setData] = useState<Ashtaka | null>(null);
  const [planet, setPlanet] = useState("Sun");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showBavMatrix, setShowBavMatrix] = useState(false);
  const [showHouseMap, setShowHouseMap] = useState(false);
  const [transit, setTransit] = useState<{
    jupiter?: { house: number; sign: string; retrograde: boolean };
    saturn?: { house: number; sign: string; retrograde: boolean };
    highlights: string[];
  } | null>(null);

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Ashtakavarga");
          return;
        }
        setData(json.data.ashtakavarga);
        const first = Object.keys(json.data.ashtakavarga?.bhinna || {})[0];
        if (first) setPlanet(first);
      })
      .catch(() => setError("Unable to load Ashtakavarga"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/gochar")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) return;
        const jupiter = (json.data?.planets || []).find(
          (p: {
            planet: string;
            houseFromNatalLagna: number;
            sign: string;
            isRetrograde: boolean;
          }) => p.planet === "Jupiter",
        );
        const saturn = (json.data?.planets || []).find(
          (p: {
            planet: string;
            houseFromNatalLagna: number;
            sign: string;
            isRetrograde: boolean;
          }) => p.planet === "Saturn",
        );
        setTransit({
          jupiter: jupiter
            ? {
                house: jupiter.houseFromNatalLagna,
                sign: jupiter.sign,
                retrograde: jupiter.isRetrograde,
              }
            : undefined,
          saturn: saturn
            ? {
                house: saturn.houseFromNatalLagna,
                sign: saturn.sign,
                retrograde: saturn.isRetrograde,
              }
            : undefined,
          highlights: json.data?.highlights || [],
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!data?.sarva) return null;
    const sarva = data.sarva;
    const total = sarva.reduce((s, r) => s + r.bindus, 0);
    const avg = total / sarva.length;
    const sorted = [...sarva].sort((a, b) => b.bindus - a.bindus);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const top5 = sorted.slice(0, 5);
    const bottom5 = [...sorted].reverse().slice(0, 5);
    return { total, avg, strongest, weakest, top5, bottom5 };
  }, [data]);

  const planetStats = useMemo(() => {
    if (!data?.bhinna || !planet) return null;
    const rows = data.bhinna[planet] || [];
    const total = rows.reduce((s, r) => s + r.bindus, 0);
    const avg = total / Math.max(1, rows.length);
    const best = [...rows].sort((a, b) => b.bindus - a.bindus)[0];
    const worst = [...rows].sort((a, b) => a.bindus - b.bindus)[0];
    return { total, avg, best, worst };
  }, [data, planet]);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Sarvashtakavarga · Bhinnashtakavarga"
        title="Ashtakavarga"
        description="Classical bindu strength analysis — SAV shows total house strength, BAV shows per-planet contributions. Higher bindus indicate stronger support for that house's themes."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyDivisionalCharts}>Charts</Link>
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
        <TooltipProvider delayDuration={200}>
          <div className="space-y-5">
            {/* Summary Metrics */}
            {metrics && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <GlassCard className="space-y-1 p-3 sm:p-4">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Total SAV
                  </p>
                  <p className="font-display text-2xl sm:text-3xl">{metrics.total}</p>
                  <p className="text-muted-foreground text-xs">
                    Average {metrics.avg.toFixed(1)} per house
                  </p>
                </GlassCard>
                <GlassCard className="space-y-1 p-3 sm:p-4">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Strongest House
                  </p>
                  <p className="font-display text-2xl sm:text-3xl">
                    H{metrics.strongest?.house} ({metrics.strongest?.sign})
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {metrics.strongest?.bindus} bindus
                  </p>
                </GlassCard>
                <GlassCard className="space-y-1 p-3 sm:p-4">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Weakest House
                  </p>
                  <p className="font-display text-2xl sm:text-3xl">
                    H{metrics.weakest?.house} ({metrics.weakest?.sign})
                  </p>
                  <p className="text-muted-foreground text-xs">{metrics.weakest?.bindus} bindus</p>
                </GlassCard>
                <GlassCard className="space-y-1 p-3 sm:p-4">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Lagna Reference
                  </p>
                  <p className="font-display text-2xl sm:text-3xl">{data.lagnaSign}</p>
                  <p className="text-muted-foreground text-xs">House counting from Lagna</p>
                </GlassCard>
              </div>
            )}

            {/* AI Insights */}
            {metrics && (
              <GlassCard className="border-gold/25 space-y-2 p-4 sm:p-5">
                <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase">
                  AI Insight
                </p>
                <p className="font-display text-lg leading-snug sm:text-xl">
                  {metrics.strongest && metrics.strongest.bindus >= 30
                    ? `House ${metrics.strongest.house} (${metrics.strongest.sign}) shows strong bindu support. Traditionally, this may indicate easier expression of that house's themes.`
                    : "No extremely strong houses — balanced chart with moderate support across areas."}
                </p>
                {metrics.weakest && metrics.weakest.bindus <= 18 && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    House {metrics.weakest.house} ({metrics.weakest.sign}) has relatively fewer
                    bindus. Traditional interpretation suggests this area may require more conscious
                    effort or remedial focus.
                  </p>
                )}
              </GlassCard>
            )}

            {/* Sarvashtakavarga Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">Sarvashtakavarga (SAV)</h2>
                <Badge variant="outline" className="text-[10px]">
                  Total bindu contribution from all planets
                </Badge>
              </div>

              {/* SAV Visualization */}
              {data?.sarva && (
                <GlassCard className="space-y-3">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.sarva}
                        onClick={(e) => {
                          if (e?.activeLabel) setExpandedHouse(Number(e.activeLabel));
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis
                          dataKey="house"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(v) => `H${v}`}
                        />
                        <YAxis domain={[0, 56]} tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          formatter={(value) => [`${value} bindus`, "SAV"]}
                          labelFormatter={(label) => `House ${label}`}
                        />
                        <Bar dataKey="bindus" radius={[4, 4, 0, 0]}>
                          {data.sarva.map((entry) => (
                            <Cell
                              key={entry.house}
                              fill={
                                entry.bindus >= 30
                                  ? "#10B981"
                                  : entry.bindus >= 20
                                    ? "#D4AF37"
                                    : entry.bindus >= 12
                                      ? "#F59E0B"
                                      : "#F43F5E"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              )}

              {/* SAV Detailed Table */}
              <GlassCard className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg">SAV by House</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowHouseMap(!showHouseMap)}
                  >
                    {showHouseMap ? "Hide house map" : "Show house map"}
                  </Button>
                </div>
                {showHouseMap && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {data.sarva.map((row) => {
                      const theme = HOUSE_THEMES[row.house] || { area: "", theme: "" };
                      return (
                        <div
                          key={row.house}
                          className={cn("rounded-xl border p-3", binduColor(row.bindus))}
                        >
                          <p className="text-sm font-medium">
                            H{row.house} · {row.sign}
                          </p>
                          <p className="text-muted-foreground text-[10px]">{theme.area}</p>
                          <p className="font-display text-lg">{row.bindus}</p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", strengthTone(row.bindus))}
                          >
                            {strengthLabel(row.bindus)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                          House
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                          Sign
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                          SAV Score
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                          Strength
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                          Meaning
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sarva.map((row) => (
                        <tr key={row.house} className="border-b last:border-0">
                          <td className="py-2.5 font-medium">H{row.house}</td>
                          <td className="py-2.5">{row.sign}</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-base">{row.bindus}</span>
                              <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    row.bindus >= 30
                                      ? "bg-emerald-500"
                                      : row.bindus >= 20
                                        ? "bg-gold"
                                        : row.bindus >= 12
                                          ? "bg-amber-500"
                                          : "bg-rose",
                                  )}
                                  style={{ width: `${binduProgress(row.bindus)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", strengthTone(row.bindus))}
                            >
                              {strengthLabel(row.bindus)}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground py-2.5 text-xs">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>

            {/* House-wise Analysis */}
            <GlassCard className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">House-wise Analysis</h2>
                  <p className="text-muted-foreground text-xs">
                    Click any house to see detailed bindu breakdown, life area, and interpretation.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {data.sarva.map((row) => {
                  const isExpanded = expandedHouse === row.house;
                  const theme = HOUSE_THEMES[row.house] || { area: "", theme: "" };
                  return (
                    <div
                      key={row.house}
                      className={cn(
                        "cursor-pointer rounded-xl border p-3 transition-all",
                        binduColor(row.bindus),
                        isExpanded && "ring-gold/40 ring-1",
                      )}
                      onClick={() => setExpandedHouse(isExpanded ? null : row.house)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            H{row.house} · {row.sign}
                          </p>
                          <p className="text-muted-foreground text-[10px]">{theme.area}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg">{row.bindus}</p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", strengthTone(row.bindus))}
                          >
                            {strengthLabel(row.bindus)}
                          </Badge>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-border/50 mt-3 space-y-2 border-t pt-3">
                          <p className="text-xs leading-relaxed">{theme.theme}</p>
                          <p className="text-muted-foreground text-xs">{row.note}</p>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            {data.bhinna[planet]
                              ?.filter((b) => b.house === row.house)
                              .map((b) => (
                                <div key={b.house} className="flex justify-between">
                                  <span>{planet}</span>
                                  <span className="font-medium">{b.bindus} bindus</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Bhinnashtakavarga Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">Bhinnashtakavarga (BAV)</h2>
                  <p className="text-muted-foreground text-xs">
                    Per-planet bindu contributions by house and sign.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowBavMatrix(!showBavMatrix)}
                >
                  {showBavMatrix ? "Hide matrix" : "Show BAV matrix"}
                </Button>
              </div>

              {showBavMatrix && data && (
                <GlassCard className="space-y-3">
                  <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[720px] text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-muted-foreground pb-2 text-left font-medium">
                            Planet
                          </th>
                          {SIGNS.map((sign) => (
                            <th
                              key={sign}
                              className="text-muted-foreground pb-2 text-center font-medium"
                            >
                              {sign.slice(0, 3)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.bhinna).map(([p, rows]) => {
                          const signBindus: Record<string, number> = {};
                          for (const r of rows) {
                            signBindus[r.sign] = (signBindus[r.sign] || 0) + r.bindus;
                          }
                          return (
                            <tr key={p} className="border-b last:border-0">
                              <td className="py-2 font-medium">{p}</td>
                              {SIGNS.map((sign) => {
                                const val = signBindus[sign] || 0;
                                return (
                                  <td key={sign} className="py-2 text-center">
                                    <span
                                      className={cn(
                                        "inline-block rounded px-1.5 py-0.5",
                                        val >= 8
                                          ? "bg-emerald-500/15 text-emerald-700"
                                          : val >= 5
                                            ? "bg-gold/15"
                                            : val >= 3
                                              ? "bg-amber-500/15"
                                              : "bg-rose/10",
                                      )}
                                    >
                                      {val}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    BAV matrix shows per-planet bindu contributions aggregated by sign/rashi. Higher
                    values indicate stronger sign support for that planet.
                  </p>
                </GlassCard>
              )}

              <GlassCard className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg">Per-Planet BAV</h2>
                    <p className="text-muted-foreground text-xs">
                      Select a planet to see its house-wise bindu contributions.
                    </p>
                  </div>
                  {planetStats && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Total: {planetStats.total}</Badge>
                      <Badge variant="outline">Avg: {planetStats.avg.toFixed(1)}</Badge>
                    </div>
                  )}
                </div>
                <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch]">
                  {Object.keys(data.bhinna).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlanet(p)}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                        planet === p
                          ? "border-gold/40 bg-primary/12 text-foreground"
                          : "border-border/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {planetStats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Best House
                      </p>
                      <p className="font-display text-base sm:text-lg">
                        H{planetStats.best?.house} ({planetStats.best?.sign})
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {planetStats.best?.bindus} bindus
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Challenging House
                      </p>
                      <p className="font-display text-base sm:text-lg">
                        H{planetStats.worst?.house} ({planetStats.worst?.sign})
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {planetStats.worst?.bindus} bindus
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Total Bindus
                      </p>
                      <p className="font-display text-base sm:text-lg">{planetStats.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Average
                      </p>
                      <p className="font-display text-base sm:text-lg">
                        {planetStats.avg.toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {(data.bhinna[planet] || []).map((row) => (
                    <div
                      key={row.house}
                      className={cn("rounded-lg border p-2 text-center", binduColor(row.bindus))}
                    >
                      <p className="text-muted-foreground text-[10px]">H{row.house}</p>
                      <p className="font-display text-lg sm:text-xl">{row.bindus}</p>
                      <p className="text-muted-foreground text-[10px]">{row.sign}</p>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground text-[10px]">
                  Bhinnashtakavarga shows how {planet} individually contributes bindus to each
                  house. Higher bindus mean that planet supports the house&apos;s themes more
                  strongly.
                </p>
              </GlassCard>
            </div>

            {/* Transit Integration */}
            {(transit?.jupiter || transit?.saturn) && (
              <GlassCard className="space-y-3">
                <h2 className="font-display text-xl">Transit Interaction</h2>
                <p className="text-muted-foreground text-xs">
                  How current Jupiter and Saturn transits influence your Ashtakavarga scores.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {transit.jupiter && (
                    <div className="border-border/60 bg-muted/20 rounded-xl border p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Jupiter Transit</p>
                        <Badge variant="outline" className="text-[10px]">
                          H{transit.jupiter.house}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Currently in {transit.jupiter.sign}
                        {transit.jupiter.retrograde ? " (retrograde)" : ""} — house{" "}
                        {transit.jupiter.house} from Lagna
                      </p>
                      {(() => {
                        const row = data?.sarva?.[transit.jupiter.house - 1];
                        return row ? (
                          <p className="mt-2 text-xs leading-relaxed">
                            This house has {row.bindus} SAV bindus
                            {row.bindus >= 25
                              ? " — supportive transit for expansion and growth in this area."
                              : " — growth here may need more patience or remedial focus."}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  )}
                  {transit.saturn && (
                    <div className="border-border/60 bg-muted/20 rounded-xl border p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Saturn Transit</p>
                        <Badge variant="outline" className="text-[10px]">
                          H{transit.saturn.house}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Currently in {transit.saturn.sign}
                        {transit.saturn.retrograde ? " (retrograde)" : ""} — house{" "}
                        {transit.saturn.house} from Lagna
                      </p>
                      {(() => {
                        const row = data?.sarva?.[transit.saturn.house - 1];
                        return row ? (
                          <p className="mt-2 text-xs leading-relaxed">
                            This house has {row.bindus} SAV bindus
                            {row.bindus >= 25
                              ? " — Saturn&apos;s discipline may strengthen existing support."
                              : " — Saturn&apos;s influence may require structured effort here."}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Advanced / Methodology Toggle */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowMethodology(!showMethodology)}
              >
                <span>How is this calculated?</span>
                <span className="text-muted-foreground text-xs">
                  {showMethodology ? "Hide" : "Show"}
                </span>
              </Button>
              {showMethodology && (
                <GlassCard className="space-y-2 p-4 sm:p-5">
                  <p className="text-sm leading-relaxed">{data.methodology}</p>
                  <p className="text-muted-foreground text-xs">
                    SAV aggregates contributions from Sun, Moon, Mars, Mercury, Jupiter, Venus,
                    Saturn, and Lagna. Each contributor adds a bindu to specific houses based on its
                    sign position. BAV isolates each planet&apos;s individual contribution pattern.
                  </p>
                </GlassCard>
              )}

              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span>Advanced View — Raw Matrix</span>
                <span className="text-muted-foreground text-xs">
                  {showAdvanced ? "Hide" : "Show"}
                </span>
              </Button>
              {showAdvanced && (
                <GlassCard className="space-y-3 p-4 sm:p-5">
                  <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[720px] text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-muted-foreground pb-2 text-left font-medium">
                            Planet
                          </th>
                          {data.sarva.map((r) => (
                            <th
                              key={r.house}
                              className="text-muted-foreground pb-2 text-center font-medium"
                            >
                              H{r.house}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.bhinna).map(([p, rows]) => (
                          <tr key={p} className="border-b last:border-0">
                            <td className="py-2 font-medium">{p}</td>
                            {rows.map((r) => (
                              <td key={r.house} className="py-2 text-center">
                                <span
                                  className={cn(
                                    "inline-block rounded px-1.5 py-0.5",
                                    r.bindus >= 30
                                      ? "bg-emerald-500/15 text-emerald-700"
                                      : r.bindus >= 20
                                        ? "bg-gold/15"
                                        : r.bindus >= 12
                                          ? "bg-amber-500/15"
                                          : "bg-rose/10",
                                  )}
                                >
                                  {r.bindus}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* AI Suggestions */}
            <GlassCard className="border-gold/20 space-y-3 p-4 sm:p-5">
              <p className="text-gold/85 text-[11px] font-medium tracking-[0.16em] uppercase">
                Ask the Astrology AI
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Which houses have stronger Ashtakavarga support?",
                  "How does my Sarvashtakavarga compare?",
                  "Which planet contributes most to my 10th house?",
                  "How should I read my Ashtakavarga?",
                  "Explain this like a beginner.",
                ].map((q) => (
                  <Button key={q} variant="outline" size="sm" className="text-xs">
                    {q}
                  </Button>
                ))}
              </div>
              <p className="text-muted-foreground text-[10px]">
                AI uses your calculated Ashtakavarga data to explain bindu strength. It does not
                recalculate astrology.
              </p>
            </GlassCard>
          </div>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
