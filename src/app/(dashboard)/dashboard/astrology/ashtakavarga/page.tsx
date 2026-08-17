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

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type SavRow = { house: number; sign: string; bindus: number; note: string };
type BavRow = { house: number; sign: string; bindus: number };
type Ashtaka = {
  methodology: string;
  lagnaSign: string;
  sarva: SavRow[];
  bhinna: Record<string, BavRow[]>;
  planetTotals?: Record<string, number>;
  totalBindus?: number;
  highlights: string[];
};

const HOUSE_THEMES: Record<number, { area: string; theme: string }> = {
  1: { area: "Self", theme: "Identity, vitality, body" },
  2: { area: "Wealth", theme: "Speech, family, resources" },
  3: { area: "Courage", theme: "Siblings, effort, short travel" },
  4: { area: "Home", theme: "Mother, home, emotional roots" },
  5: { area: "Creativity", theme: "Children, intellect, speculation" },
  6: { area: "Health", theme: "Obstacles, service, illness" },
  7: { area: "Partnership", theme: "Marriage, contracts, public" },
  8: { area: "Transformation", theme: "Longevity, occult, shared resources" },
  9: { area: "Dharma", theme: "Fortune, mentors, higher learning" },
  10: { area: "Career", theme: "Profession, status, authority" },
  11: { area: "Gains", theme: "Income, networks, aspirations" },
  12: { area: "Liberation", theme: "Expenses, foreign lands, moksha" },
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

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

function savLabel(bindus: number): string {
  if (bindus >= 30) return "Strong";
  if (bindus >= 25) return "Supportive";
  if (bindus >= 20) return "Average";
  return "Sensitive";
}

function savTone(bindus: number): string {
  if (bindus >= 30)
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
  if (bindus >= 25) return "border-gold/40 bg-gold/10";
  if (bindus >= 20) return "border-amber-500/40 bg-amber-500/10";
  return "border-rose/40 bg-rose/10";
}

function savFill(bindus: number): string {
  if (bindus >= 30) return "#10B981";
  if (bindus >= 25) return "#D4AF37";
  if (bindus >= 20) return "#F59E0B";
  return "#F43F5E";
}

function bavTone(bindus: number): string {
  if (bindus >= 5) return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300";
  if (bindus >= 4) return "bg-gold/20";
  if (bindus >= 3) return "bg-amber-500/15";
  return "bg-rose/15 text-rose-800 dark:text-rose-300";
}

function SavKundli({ sarva, lagnaSign }: { sarva: SavRow[]; lagnaSign: string }) {
  const byHouse = Object.fromEntries(sarva.map((r) => [r.house, r]));
  const cell = (house: number) => {
    const row = byHouse[house];
    if (!row) return null;
    return (
      <div
        className={cn(
          "flex h-full min-h-[72px] flex-col items-center justify-center border p-1",
          savTone(row.bindus),
        )}
      >
        <span className="text-muted-foreground text-[9px]">H{house}</span>
        <span className="font-display text-lg leading-none">{row.bindus}</span>
        <span className="text-[9px] opacity-80">{row.sign.slice(0, 3)}</span>
      </div>
    );
  };

  return (
    <div className="mx-auto grid aspect-square w-full max-w-md grid-cols-4 grid-rows-4 overflow-hidden rounded-xl border">
      <div className="col-start-1 row-start-1">{cell(12)}</div>
      <div className="col-start-2 row-start-1">{cell(1)}</div>
      <div className="col-start-3 row-start-1">{cell(2)}</div>
      <div className="col-start-4 row-start-1">{cell(3)}</div>
      <div className="col-start-1 row-start-2">{cell(11)}</div>
      <div className="col-start-4 row-start-2">{cell(4)}</div>
      <div className="col-start-1 row-start-3">{cell(10)}</div>
      <div className="col-start-4 row-start-3">{cell(5)}</div>
      <div className="col-start-1 row-start-4">{cell(9)}</div>
      <div className="col-start-2 row-start-4">{cell(8)}</div>
      <div className="col-start-3 row-start-4">{cell(7)}</div>
      <div className="col-start-4 row-start-4">{cell(6)}</div>
      <div className="bg-muted/30 col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center border">
        <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Lagna</p>
        <p className="font-display text-xl">{lagnaSign}</p>
        <p className="text-muted-foreground text-[10px]">SAV bindus</p>
      </div>
    </div>
  );
}

export default function AstrologyAshtakavargaPage() {
  const [data, setData] = useState<Ashtaka | null>(null);
  const [planet, setPlanet] = useState("Sun");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matrixView, setMatrixView] = useState<"house" | "sign">("house");
  const [transit, setTransit] = useState<{
    jupiter?: { house: number; sign: string; retrograde: boolean };
    saturn?: { house: number; sign: string; retrograde: boolean };
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
        if (cancelled || !json.success) return;
        const findPlanet = (name: string) =>
          (json.data?.planets || []).find(
            (p: {
              planet: string;
              houseFromNatalLagna: number;
              sign: string;
              isRetrograde: boolean;
            }) => p.planet === name,
          );
        const jupiter = findPlanet("Jupiter");
        const saturn = findPlanet("Saturn");
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
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!data?.sarva) return null;
    const total = data.totalBindus ?? data.sarva.reduce((s, r) => s + r.bindus, 0);
    const avg = total / data.sarva.length;
    const sorted = [...data.sarva].sort((a, b) => b.bindus - a.bindus);
    return {
      total,
      avg,
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1],
    };
  }, [data]);

  const planetStats = useMemo(() => {
    if (!data?.bhinna || !planet) return null;
    const rows = data.bhinna[planet] || [];
    const total = data.planetTotals?.[planet] ?? rows.reduce((s, r) => s + r.bindus, 0);
    const best = [...rows].sort((a, b) => b.bindus - a.bindus)[0];
    const worst = [...rows].sort((a, b) => a.bindus - b.bindus)[0];
    return { total, best, worst };
  }, [data, planet]);

  const kakshya = (name: "Jupiter" | "Saturn", house?: number) => {
    if (!data || !house) return null;
    const sav = data.sarva[house - 1];
    const bav = data.bhinna[name]?.[house - 1];
    return { sav, bav };
  };

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Sarvashtakavarga · Bhinnashtakavarga"
        title="Ashtakavarga"
        description="SAV house bindus (classical total ≈ 337) and BAV 0–8 matrix — the same two views Jagannatha Hora and AstroSage lead with. SAV ≥ 30 is strong; BAV ≥ 5 supports that planet's transit."
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
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10">
              SAV ≥ 30 strong
            </Badge>
            <Badge variant="outline" className="border-rose/40 bg-rose/10">
              SAV &lt; 25 sensitive
            </Badge>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10">
              BAV ≥ 5 supportive transit
            </Badge>
            <Badge variant="outline">8 contributors · 0–8 bindus</Badge>
          </div>

          {metrics && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard className="space-y-1 p-3 sm:p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  SAV total
                </p>
                <p className="font-display text-2xl sm:text-3xl">{metrics.total}</p>
                <p className="text-muted-foreground text-xs">
                  Classical reference ≈ 337 · avg {metrics.avg.toFixed(1)} / house
                </p>
              </GlassCard>
              <GlassCard className="space-y-1 p-3 sm:p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Strongest house
                </p>
                <p className="font-display text-2xl sm:text-3xl">
                  H{metrics.strongest?.house} · {metrics.strongest?.sign}
                </p>
                <p className="text-muted-foreground text-xs">
                  {metrics.strongest?.bindus} SAV bindus
                </p>
              </GlassCard>
              <GlassCard className="space-y-1 p-3 sm:p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Weakest house
                </p>
                <p className="font-display text-2xl sm:text-3xl">
                  H{metrics.weakest?.house} · {metrics.weakest?.sign}
                </p>
                <p className="text-muted-foreground text-xs">
                  {metrics.weakest?.bindus} SAV bindus
                </p>
              </GlassCard>
              <GlassCard className="space-y-1 p-3 sm:p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Lagna</p>
                <p className="font-display text-2xl sm:text-3xl">{data.lagnaSign}</p>
                <p className="text-muted-foreground text-xs">Houses counted from lagna</p>
              </GlassCard>
            </div>
          )}

          <Tabs defaultValue="sav">
            <TabsList>
              <TabsTrigger value="sav">Sarvashtakavarga</TabsTrigger>
              <TabsTrigger value="bav">Bhinnashtakavarga</TabsTrigger>
              <TabsTrigger value="transit">Transit kakshya</TabsTrigger>
            </TabsList>

            <TabsContent value="sav" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <GlassCard className="space-y-3">
                  <div>
                    <h2 className="font-display text-xl">SAV chart</h2>
                    <p className="text-muted-foreground text-xs">
                      Bindus in each bhava from lagna. Read like JHora's numeric kundli.
                    </p>
                  </div>
                  <SavKundli sarva={data.sarva} lagnaSign={data.lagnaSign} />
                </GlassCard>
                <GlassCard className="space-y-3">
                  <h2 className="font-display text-xl">House profile</h2>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.sarva}>
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
                            <Cell key={entry.house} fill={savFill(entry.bindus)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="space-y-3">
                <h2 className="font-display text-lg">SAV by house</h2>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          House
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          Sign
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          Area
                        </th>
                        <th className="text-muted-foreground pb-2 text-right text-[10px] font-medium tracking-wider uppercase">
                          SAV
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          Strength
                        </th>
                        <th className="text-muted-foreground pb-2 text-left text-[10px] font-medium tracking-wider uppercase">
                          Reading
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sarva.map((row) => (
                        <tr key={row.house} className="border-b last:border-0">
                          <td className="py-2.5 font-medium">H{row.house}</td>
                          <td className="py-2.5">{row.sign}</td>
                          <td className="text-muted-foreground py-2.5 text-xs">
                            {HOUSE_THEMES[row.house]?.area}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="font-display text-base">{row.bindus}</span>
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", savTone(row.bindus))}
                            >
                              {savLabel(row.bindus)}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground py-2.5 text-xs">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="bav" className="space-y-4">
              <GlassCard className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl">BAV matrix (0–8)</h2>
                    <p className="text-muted-foreground text-xs">
                      Each cell is bindus contributed to that house for the planet. ≥ 5 is a
                      supportive kakshya for transits of that graha.
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={matrixView === "house" ? "secondary" : "ghost"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setMatrixView("house")}
                    >
                      By house
                    </Button>
                    <Button
                      variant={matrixView === "sign" ? "secondary" : "ghost"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setMatrixView("sign")}
                    >
                      By sign
                    </Button>
                  </div>
                </div>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[720px] text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground sticky left-0 pb-2 text-left font-medium">
                          Planet
                        </th>
                        {matrixView === "house"
                          ? data.sarva.map((r) => (
                              <th
                                key={r.house}
                                className="text-muted-foreground pb-2 text-center font-medium"
                              >
                                H{r.house}
                              </th>
                            ))
                          : SIGNS.map((sign) => (
                              <th
                                key={sign}
                                className="text-muted-foreground pb-2 text-center font-medium"
                              >
                                {sign.slice(0, 3)}
                              </th>
                            ))}
                        <th className="text-muted-foreground pb-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLANET_ORDER.map((name) => {
                        const rows = data.bhinna[name] || [];
                        const total =
                          data.planetTotals?.[name] ?? rows.reduce((s, r) => s + r.bindus, 0);
                        const signBindus: Record<string, number> = {};
                        for (const r of rows) signBindus[r.sign] = r.bindus;
                        return (
                          <tr
                            key={name}
                            className={cn(
                              "border-b last:border-0",
                              planet === name && "bg-primary/5",
                            )}
                          >
                            <td className="sticky left-0 py-1.5 font-medium">
                              <button type="button" onClick={() => setPlanet(name)}>
                                {name}
                              </button>
                            </td>
                            {matrixView === "house"
                              ? rows.map((r) => (
                                  <td key={r.house} className="py-1.5 text-center">
                                    <span
                                      className={cn(
                                        "inline-flex h-7 w-7 items-center justify-center rounded-md tabular-nums",
                                        bavTone(r.bindus),
                                      )}
                                    >
                                      {r.bindus}
                                    </span>
                                  </td>
                                ))
                              : SIGNS.map((sign) => {
                                  const val = signBindus[sign] ?? 0;
                                  return (
                                    <td key={sign} className="py-1.5 text-center">
                                      <span
                                        className={cn(
                                          "inline-flex h-7 w-7 items-center justify-center rounded-md tabular-nums",
                                          bavTone(val),
                                        )}
                                      >
                                        {val}
                                      </span>
                                    </td>
                                  );
                                })}
                            <td className="py-1.5 text-right font-medium tabular-nums">{total}</td>
                          </tr>
                        );
                      })}
                      {matrixView === "house" ? (
                        <tr>
                          <td className="py-2 font-medium">SAV</td>
                          {data.sarva.map((r) => (
                            <td key={r.house} className="py-2 text-center font-medium tabular-nums">
                              {r.bindus}
                            </td>
                          ))}
                          <td className="py-2 text-right font-medium tabular-nums">
                            {metrics?.total}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                {matrixView === "sign" && (
                  <p className="text-muted-foreground text-[10px]">
                    Sign columns follow the rashi occupying each natal house from lagna. SAV row is
                    shown only in house view.
                  </p>
                )}
              </GlassCard>

              <GlassCard className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg">{planet} BAV</h2>
                    <p className="text-muted-foreground text-xs">
                      Individual kakshya for this graha. Total near the classical planet quota.
                    </p>
                  </div>
                  {planetStats && <Badge variant="secondary">Total {planetStats.total}</Badge>}
                </div>
                <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
                  {PLANET_ORDER.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlanet(p)}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                        planet === p
                          ? "border-gold/40 bg-primary/12 text-foreground"
                          : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {planetStats && (
                  <p className="text-muted-foreground text-xs">
                    Best H{planetStats.best?.house} ({planetStats.best?.bindus} bindus) · Sensitive
                    H{planetStats.worst?.house} ({planetStats.worst?.bindus} bindus)
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {(data.bhinna[planet] || []).map((row) => (
                    <div
                      key={row.house}
                      className={cn("rounded-lg border p-2 text-center", bavTone(row.bindus))}
                    >
                      <p className="text-muted-foreground text-[10px]">H{row.house}</p>
                      <p className="font-display text-lg">{row.bindus}</p>
                      <p className="text-[10px] opacity-80">{row.sign}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="transit" className="space-y-4">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Transit kakshya</h2>
                  <p className="text-muted-foreground text-xs">
                    When a planet transits a house, read that planet's own BAV in the occupied house
                    (0–8) together with the house SAV. BAV ≥ 5 and SAV ≥ 30 is the classical
                    supportive window.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["Jupiter", "Saturn"] as const).map((name) => {
                    const t = name === "Jupiter" ? transit?.jupiter : transit?.saturn;
                    const k = kakshya(name, t?.house);
                    return (
                      <div
                        key={name}
                        className="border-border/60 bg-muted/20 rounded-xl border p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{name} transit</p>
                          {t ? (
                            <Badge variant="outline" className="text-[10px]">
                              H{t.house} · {t.sign}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Gochar needed
                            </Badge>
                          )}
                        </div>
                        {t && k ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div
                              className={cn("rounded-lg border p-2", bavTone(k.bav?.bindus ?? 0))}
                            >
                              <p className="text-muted-foreground text-[10px] uppercase">
                                {name} BAV
                              </p>
                              <p className="font-display text-2xl">{k.bav?.bindus ?? "—"}</p>
                              <p className="text-[10px]">
                                {(k.bav?.bindus ?? 0) >= 5 ? "Supportive kakshya" : "Lean kakshya"}
                              </p>
                            </div>
                            <div
                              className={cn("rounded-lg border p-2", savTone(k.sav?.bindus ?? 0))}
                            >
                              <p className="text-muted-foreground text-[10px] uppercase">
                                House SAV
                              </p>
                              <p className="font-display text-2xl">{k.sav?.bindus ?? "—"}</p>
                              <p className="text-[10px]">{savLabel(k.sav?.bindus ?? 0)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Current gochar is unavailable. Generate kundli and open Gochar to score
                            this transit.
                          </p>
                        )}
                        {t?.retrograde ? (
                          <p className="text-muted-foreground mt-2 text-[10px]">
                            Currently retrograde
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>

          <GlassCard className="space-y-2 p-4 sm:p-5">
            <h2 className="font-display text-lg">How to read this</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">{data.methodology}</p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
              <li>SAV is the sum of the seven BAV rows — not a separate 8-contributor chart.</li>
              <li>BAV 5–8 in a house supports that planet when it transits there.</li>
              <li>SAV 30+ houses are traditionally chosen for important activity.</li>
            </ul>
          </GlassCard>

          <GlassCard className="border-gold/20 space-y-3 p-4 sm:p-5">
            <p className="text-gold/85 text-[11px] font-medium tracking-[0.16em] uppercase">
              Ask the Astrology AI
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Which houses have stronger Ashtakavarga support?",
                "How should I read my BAV matrix?",
                "Is Jupiter's current kakshya supportive?",
              ].map((q) => (
                <Button key={q} asChild variant="outline" size="sm" className="text-xs">
                  <Link href={routes.aiInsights}>{q}</Link>
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
