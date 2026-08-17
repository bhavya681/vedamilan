"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { SIGNS } from "@/application/horoscope/vedic-constants";

type PlanetShadbala = {
  planet: string;
  sign: string;
  house: number;
  total: number;
  virupas: number;
  rupas: number;
  requiredVirupas: number;
  ratio: number;
  meetsMinimum: boolean;
  ishtaPhala: number;
  kashtaPhala: number;
  percentage: number;
  grade: "Excellent" | "Good" | "Average" | "Weak";
  components: Array<{
    name: string;
    sanskrit: string;
    score: number;
    max: number;
    virupas: number;
    virupaMax: number;
    note: string;
  }>;
  interpretation: string;
};

type ShadbalaLab = {
  methodology: string;
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
const BALA_ORDER = ["Sthana", "Dig", "Kala", "Chesta", "Naisargika", "Drik"] as const;

const BALA_EDUCATION: Record<string, { what: string; how: string; why: string }> = {
  Sthana: {
    what: "Positional strength based on house and sign placement.",
    how: "Kendra, Trikona, own sign and exaltation add weight. Debilitation and dusthana houses reduce it.",
    why: "A planet in a strong position can express its nature more freely.",
  },
  Dig: {
    what: "Directional strength from the sign the planet occupies.",
    how: "Each graha has a preferred direction. Placement in that direction raises Dig Bala.",
    why: "Directional alignment affects how easily a planet can act.",
  },
  Kala: {
    what: "Temporal strength from time-related factors.",
    how: "Day/night nature, retrograde motion, and angularity from the lagna contribute.",
    why: "Even a well-placed planet may be weaker if its time conditions are adverse.",
  },
  Chesta: {
    what: "Motional strength from the planet's movement.",
    how: "Retrograde motion increases Chesta Bala. Malefics gain more intensity when retrograde.",
    why: "Retrograde planets often operate with greater internal focus.",
  },
  Naisargika: {
    what: "Inherent natural strength of the planet.",
    how: "Fixed values: Sun and Jupiter are naturally strong; Saturn is naturally weaker.",
    why: "Some planets are innately more potent regardless of placement.",
  },
  Drik: {
    what: "Aspectual strength from other planets.",
    how: "Benefic aspects raise Drik Bala; malefic aspects reduce it.",
    why: "No planet acts in isolation — the chart environment modifies its strength.",
  },
};

function ratioTone(ratio: number): string {
  if (ratio >= 1.25) return "text-emerald-700 dark:text-emerald-300";
  if (ratio >= 1) return "text-foreground";
  if (ratio >= 0.75) return "text-amber-700 dark:text-amber-300";
  return "text-rose-700 dark:text-rose-300";
}

export default function AstrologyShadbalaPage() {
  const [data, setData] = useState<ShadbalaLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
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

  const ordered = useMemo(() => {
    if (!data) return [];
    return PLANET_ORDER.map((name) => data.planets.find((p) => p.planet === name)).filter(
      (p): p is PlanetShadbala => Boolean(p),
    );
  }, [data]);

  const selected = data?.planets.find((p) => p.planet === selectedPlanet) || null;
  const aboveRequired = data?.planets.filter((p) => p.meetsMinimum).length ?? 0;
  const rank =
    selected && data
      ? [...data.planets]
          .sort((a, b) => b.virupas - a.virupas)
          .findIndex((p) => p.planet === selected.planet) + 1
      : null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Shadbala — six-fold strength"
        title="Shadbala"
        description="Virupas and rupas against classical BPHS minima — the same table layout used in Jagannatha Hora and AstroSage. Ratio ≥ 1.00 means the graha meets required strength."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyAshtakavarga}>Ashtakavarga</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyPlanetStrength}>Planet Strength</Link>
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
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Badge variant="outline">60 virupas = 1 rupa</Badge>
            <Badge variant="outline">Ratio ≥ 1.00 meets required</Badge>
            <Badge variant="outline">Ishta / Kashta from uccha × chesta</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Strongest
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.strongest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.strongest
                  ? `${data.strongest.rupas} rupas · ${data.strongest.ratio.toFixed(2)}× required`
                  : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Needs support
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.weakest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.weakest
                  ? `${data.weakest.rupas} rupas · ${data.weakest.ratio.toFixed(2)}× required`
                  : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Above required
              </p>
              <p className="font-display text-2xl sm:text-3xl">
                {aboveRequired}
                <span className="text-muted-foreground text-base"> / {data.planets.length}</span>
              </p>
              <p className="text-muted-foreground text-xs">Grahas meeting BPHS minima</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Reading</p>
              <p className="font-display text-base leading-snug sm:text-lg">{data.overallTheme}</p>
            </GlassCard>
          </div>

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Strength table</TabsTrigger>
              <TabsTrigger value="detail">Planet detail</TabsTrigger>
              <TabsTrigger value="houses">By house</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Six-fold strength (Virupas)</h2>
                  <p className="text-muted-foreground text-xs">
                    Columns match JHora: six balas, total virupas, rupas, required minimum, and
                    ratio. Green ratio means the planet is strong enough to give results.
                  </p>
                </div>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground sticky left-0 bg-[inherit] pr-3 pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          Graha
                        </th>
                        {BALA_ORDER.map((name) => (
                          <th
                            key={name}
                            className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase"
                          >
                            {name}
                          </th>
                        ))}
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Virupas
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Rupas
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Required
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Ratio
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Ishta
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          Kashta
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordered.map((p) => (
                        <tr
                          key={p.planet}
                          className={cn(
                            "border-b last:border-0",
                            selectedPlanet === p.planet && "bg-primary/5",
                          )}
                        >
                          <td className="sticky left-0 py-2.5 pr-3">
                            <button
                              type="button"
                              className="text-left"
                              onClick={() => setSelectedPlanet(p.planet)}
                            >
                              <span className="font-medium">{p.planet}</span>
                              <span className="text-muted-foreground block text-[10px]">
                                {p.sign} · H{p.house}
                              </span>
                            </button>
                          </td>
                          {BALA_ORDER.map((name) => {
                            const c = p.components.find((item) => item.name === name);
                            return (
                              <td key={name} className="py-2.5 text-right tabular-nums">
                                {c?.virupas ?? "—"}
                              </td>
                            );
                          })}
                          <td className="py-2.5 text-right font-medium tabular-nums">
                            {p.virupas}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">{p.rupas.toFixed(2)}</td>
                          <td className="text-muted-foreground py-2.5 text-right tabular-nums">
                            {p.requiredVirupas}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 text-right font-medium tabular-nums",
                              ratioTone(p.ratio),
                            )}
                          >
                            {p.meetsMinimum ? "✓ " : ""}
                            {p.ratio.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">{p.ishtaPhala}</td>
                          <td className="py-2.5 text-right tabular-nums">{p.kashtaPhala}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  {data.methodology}
                </p>
              </GlassCard>
            </TabsContent>

            <TabsContent value="detail">
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
                          <span className="ml-1 text-[10px] opacity-70">
                            {planetData.ratio.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selected && (
                  <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                    <div className="space-y-3">
                      <div>
                        <p className="font-display text-2xl sm:text-3xl">{selected.planet}</p>
                        <p className="text-muted-foreground text-xs">
                          {selected.sign} · House {selected.house}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", GRADE_TONE[selected.grade])}
                          >
                            {selected.grade}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            Rank #{rank}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              selected.meetsMinimum
                                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                : "border-rose/40",
                            )}
                          >
                            {selected.meetsMinimum ? "Meets required" : "Below required"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">Virupas</p>
                          <p className="font-display text-lg">{selected.virupas}</p>
                        </div>
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">Rupas</p>
                          <p className="font-display text-lg">{selected.rupas.toFixed(2)}</p>
                        </div>
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">Required</p>
                          <p className="font-display text-lg">{selected.requiredVirupas}</p>
                        </div>
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">Ratio</p>
                          <p className={cn("font-display text-lg", ratioTone(selected.ratio))}>
                            {selected.ratio.toFixed(2)}
                          </p>
                        </div>
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">Ishta Phala</p>
                          <p className="font-display text-lg">{selected.ishtaPhala}</p>
                        </div>
                        <div className="border-border/60 rounded-xl border p-2">
                          <p className="text-muted-foreground text-[10px] uppercase">
                            Kashta Phala
                          </p>
                          <p className="font-display text-lg">{selected.kashtaPhala}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Vs required minimum</span>
                          <span className="font-medium">{selected.percentage}%</span>
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
                            style={{ width: `${Math.min(100, selected.percentage)}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed">{selected.interpretation}</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Component breakdown (virupas)
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
                                  {c.virupas}
                                  <span className="text-muted-foreground">/{c.virupaMax}</span>
                                </span>
                              </div>
                              <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    COMPONENT_COLORS[c.name] || "bg-muted-foreground",
                                  )}
                                  style={{ width: `${(c.virupas / c.virupaMax) * 100}%` }}
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
            </TabsContent>

            <TabsContent value="houses">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">House-wise planet strength</h2>
                  <p className="text-muted-foreground text-xs">
                    Grahas in each bhava with virupas and ratio vs required.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                    const planetsInHouse = data.planets.filter((p) => p.house === house);
                    const lagnaPlanet = data.planets.find((p) => p.house === 1);
                    const lagnaSign = lagnaPlanet?.sign || "Aries";
                    const lagnaIndex = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
                    const houseSign = SIGNS[(lagnaIndex + house - 1) % 12];
                    return (
                      <div
                        key={house}
                        className="border-border/60 bg-muted/20 rounded-xl border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">House {house}</p>
                          {planetsInHouse.length > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {planetsInHouse.length} graha
                              {planetsInHouse.length === 1 ? "" : "s"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[10px]">{houseSign}</p>
                        <div className="mt-2 space-y-1">
                          {planetsInHouse.length === 0 ? (
                            <p className="text-muted-foreground text-[10px]">No planets</p>
                          ) : (
                            planetsInHouse.map((p) => (
                              <div
                                key={p.planet}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-xs">{p.planet}</span>
                                <span className={cn("text-[10px] font-medium", ratioTone(p.ratio))}>
                                  {p.virupas} · {p.ratio.toFixed(2)}
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
            </TabsContent>
          </Tabs>

          <GlassCard className="border-gold/20 space-y-3 p-4 sm:p-5">
            <p className="text-gold/85 text-[11px] font-medium tracking-[0.16em] uppercase">
              Ask the Astrology AI
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                `Why is my ${selected?.planet || "Sun"} ${selected?.meetsMinimum ? "above" : "below"} required Shadbala?`,
                "Which planet has the highest Shadbala ratio?",
                "How does Shadbala relate to my Dasha?",
                "Explain Ishta and Kashta Phala.",
              ].map((q) => (
                <Button key={q} asChild variant="outline" size="sm" className="text-xs">
                  <Link href={routes.aiInsights}>{q}</Link>
                </Button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="space-y-3 p-4 sm:p-5">
            <h2 className="font-display text-xl">Required minima (BPHS)</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {PLANET_ORDER.map((name) => {
                const p = data.planets.find((item) => item.planet === name);
                return (
                  <div key={name} className="border-border/60 rounded-xl border p-2 text-center">
                    <p className="text-xs font-medium">{name}</p>
                    <p className="text-muted-foreground text-[10px]">
                      {p?.requiredVirupas ?? "—"} vp
                    </p>
                    <p className={cn("font-display text-sm", p ? ratioTone(p.ratio) : "")}>
                      {p ? p.ratio.toFixed(2) : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Sun 390, Moon 360, Mars 300, Mercury 420, Jupiter 390, Venus 330, Saturn 300 virupas.
              This is a teaching approximation scaled to Parashara maxima — consult a professional
              for full degree-based Shadbala.
            </p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
