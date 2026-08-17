"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  houseKinds?: string[];
  interpretation?: string;
  isClassical?: boolean;
};

type StrengthLab = {
  planets: PlanetStrength[];
  strongest: PlanetStrength | null;
  weakest: PlanetStrength | null;
  overallTheme: string;
};

const CLASSICAL_ORDER = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

const STRENGTH_STYLE: Record<string, string> = {
  strong: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  moderate: "border-gold/40 bg-gold/10 text-foreground",
  "needs-attention": "border-rose/40 bg-rose/10 text-foreground",
};

const DIGNITY_STYLE: Record<string, string> = {
  Exalted: "text-emerald-700 dark:text-emerald-300",
  Own: "text-foreground",
  Debilitated: "text-rose-700 dark:text-rose-300",
};

function scoreFill(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 45) return "bg-gold";
  return "bg-rose-500";
}

export default function AstrologyPlanetStrengthPage() {
  const [data, setData] = useState<StrengthLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/astrology/planet-strength")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load planet strength");
          return;
        }
        setData(json.data);
        const first =
          json.data.planets.find((p: PlanetStrength) => p.planet === "Moon") ||
          json.data.planets[0];
        if (first) setSelectedPlanet(first.planet);
      })
      .catch(() => setError("Unable to load planet strength"))
      .finally(() => setLoading(false));
  }, []);

  const classical = useMemo(() => {
    if (!data) return [];
    const byName = new Map(data.planets.map((p) => [p.planet, p]));
    return CLASSICAL_ORDER.map((name) => byName.get(name)).filter((p): p is PlanetStrength =>
      Boolean(p),
    );
  }, [data]);

  const outer = useMemo(() => {
    if (!data) return [];
    return data.planets.filter(
      (p) => !CLASSICAL_ORDER.includes(p.planet as (typeof CLASSICAL_ORDER)[number]),
    );
  }, [data]);

  const ranked = useMemo(() => [...classical].sort((a, b) => b.score - a.score), [classical]);

  const selected = data?.planets.find((p) => p.planet === selectedPlanet) || null;
  const strongCount = classical.filter((p) => p.strength === "strong").length;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Dignity · house · nakshatra"
        title="Planet Strength"
        description="A readable ranking of the nine grahas from dignity, house kind, nakshatra, and retrograde status. For virupas against BPHS minima, open Shadbala."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyShadbala}>Shadbala</Link>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Strongest
              </p>
              <p className="font-display text-2xl">{data.strongest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.strongest
                  ? `${data.strongest.sign} · H${data.strongest.house} · ${data.strongest.score}/100`
                  : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Needs attention
              </p>
              <p className="font-display text-2xl">{data.weakest?.planet ?? "—"}</p>
              <p className="text-muted-foreground text-xs">
                {data.weakest
                  ? `${data.weakest.sign} · H${data.weakest.house} · ${data.weakest.score}/100`
                  : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Strong grahas
              </p>
              <p className="font-display text-2xl">
                {strongCount}
                <span className="text-muted-foreground text-base"> / {classical.length || 9}</span>
              </p>
              <p className="text-muted-foreground text-xs">Score 70 and above</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Reading</p>
              <p className="text-sm leading-snug">{data.overallTheme}</p>
            </GlassCard>
          </div>

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Ranking</TabsTrigger>
              <TabsTrigger value="detail">Planet detail</TabsTrigger>
              <TabsTrigger value="guide">How to read</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Graha ranking</h2>
                  <p className="text-muted-foreground text-xs">
                    Sorted by lab score. House kind uses Kendra, Trikona, Dusthana, Upachaya, and
                    Maraka.
                  </p>
                </div>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead>
                      <tr className="border-b">
                        {[
                          "#",
                          "Graha",
                          "Dignity",
                          "House",
                          "Kind",
                          "Nakshatra",
                          "Rx",
                          "Score",
                          "Grade",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-muted-foreground pr-3 pb-2 text-left text-[10px] font-medium tracking-wider uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((p, i) => (
                        <tr
                          key={p.planet}
                          className={cn(
                            "cursor-pointer border-b last:border-0",
                            selectedPlanet === p.planet ? "bg-gold/10" : "hover:bg-muted/40",
                          )}
                          onClick={() => setSelectedPlanet(p.planet)}
                        >
                          <td className="text-muted-foreground py-2.5 pr-3">{i + 1}</td>
                          <td className="py-2.5 pr-3 font-medium">{p.planet}</td>
                          <td className={cn("py-2.5 pr-3", DIGNITY_STYLE[p.dignity || ""] || "")}>
                            {p.dignity || "—"}
                          </td>
                          <td className="py-2.5 pr-3">
                            {p.sign} · {p.house}
                          </td>
                          <td className="py-2.5 pr-3 text-xs">
                            {(p.houseKinds || []).join(" · ") || "—"}
                          </td>
                          <td className="py-2.5 pr-3">{p.nakshatra}</td>
                          <td className="py-2.5 pr-3">{p.isRetrograde ? "Rx" : "—"}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                                <div
                                  className={cn("h-full", scoreFill(p.score))}
                                  style={{ width: `${p.score}%` }}
                                />
                              </div>
                              <span className="tabular-nums">{p.score}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge className={cn("border text-[10px]", STRENGTH_STYLE[p.strength])}>
                              {p.strength.replace("-", " ")}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {outer.length > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Outer planets ({outer.map((p) => p.planet).join(", ")}) are kept off this
                    ranking. Classical Vedic strength uses the nine grahas.
                  </p>
                ) : null}
              </GlassCard>
            </TabsContent>

            <TabsContent value="detail">
              {selected ? (
                <GlassCard className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {selected.sign} · House {selected.house}
                      </p>
                      <h2 className="font-display text-2xl">{selected.planet}</h2>
                      <p className="text-muted-foreground text-xs">{selected.nakshatra}</p>
                    </div>
                    <Badge className={cn("border", STRENGTH_STYLE[selected.strength])}>
                      {selected.score}/100 · {selected.strength.replace("-", " ")}
                    </Badge>
                  </div>
                  <Progress value={selected.score} />
                  <p className="text-sm leading-relaxed">
                    {selected.interpretation ||
                      `${selected.planet} scores ${selected.score} from dignity, house, and nakshatra factors.`}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.factors.map((f) => (
                      <Badge key={f} variant="outline">
                        {f}
                      </Badge>
                    ))}
                    {selected.isRetrograde ? <Badge variant="outline">Retrograde</Badge> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={routes.astrologyShadbala}>Open Shadbala for virupas</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={routes.astrologyNakshatra}>Nakshatra detail</Link>
                    </Button>
                  </div>
                </GlassCard>
              ) : null}
            </TabsContent>

            <TabsContent value="guide">
              <GlassCard className="space-y-3 text-sm leading-relaxed">
                <h2 className="font-display text-xl">What this lab measures</h2>
                <p>
                  This is a teaching score from dignity (exaltation, own sign, debilitation), house
                  kind, nakshatra affinity, and retrograde status. It is not Shadbala.
                </p>
                <p>
                  Shadbala measures six-fold strength in virupas and rupas against Parashara minima.
                  Use this page to scan dignity and house condition; use Shadbala when you need the
                  quantitative table.
                </p>
                <p>
                  Kendra (1, 4, 7, 10) supports action. Trikona (1, 5, 9) supports dharma. Dusthana
                  (6, 8, 12) often gives results through effort or delay. Retrograde planets tend to
                  internalise results.
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
