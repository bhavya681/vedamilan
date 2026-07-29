"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EastIndianKundli,
  isEastChart,
  isNorthChart,
  isSouthChart,
  NorthIndianKundli,
  SouthIndianKundli,
} from "@/features/horoscope/components/kundli-charts";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type HoroscopePayload = {
  horoscope?: {
    lagnaSign?: string;
    lagnaDegree?: number;
    lagnaNakshatra?: string | null;
    lagnaNakshatraPada?: number | null;
    moonSign?: string;
    sunSign?: string;
    manglikStatus?: string;
    planets?: Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
      nakshatraPada?: number;
      dignity?: string | null;
      isRetrograde?: boolean;
      longitude?: number;
    }>;
    yogas?: Array<{ name: string; category: string }>;
    chartNorth?: unknown;
    chartSouth?: unknown;
    chartEast?: unknown;
    calculatedAt?: string;
  };
  dasha?: {
    currentMaha?: string | null;
    currentAntar?: string | null;
  };
  manglikNote?: string;
};

const GEN_STEPS = [
  "Birth details verified",
  "Planetary positions calculated",
  "Nakshatra identified",
  "Ascendant calculated",
  "Dasha timeline prepared",
];

export default function KundliPage() {
  const [data, setData] = useState<HoroscopePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [style, setStyle] = useState<"north" | "south" | "east">("north");
  const [showChart, setShowChart] = useState(true);
  const [needsRegen, setNeedsRegen] = useState(false);

  async function load() {
    const [chartRes, birthRes] = await Promise.all([
      fetch("/api/horoscope").then((r) => r.json()),
      fetch("/api/birth-details").then((r) => r.json()),
    ]);
    if (chartRes.success) setData(chartRes.data);
    else setError(chartRes.error?.message || "Failed to load");

    const birthUpdated = birthRes.success ? birthRes.data?.updatedAt : null;
    const calcAt = chartRes.success ? chartRes.data?.horoscope?.calculatedAt : null;
    if (birthUpdated && calcAt && new Date(birthUpdated) > new Date(calcAt)) {
      setNeedsRegen(true);
    } else {
      setNeedsRegen(false);
    }
  }

  useEffect(() => {
    void load().catch(() => setError("Failed to load kundli"));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    setGenPhase(0);
    for (let i = 1; i <= GEN_STEPS.length; i += 1) {
      await new Promise((r) => setTimeout(r, 280));
      setGenPhase(i);
    }
    const res = await fetch("/api/horoscope", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    setGenPhase(0);
    if (!json.success) {
      setError(
        json.error?.message ||
          "Generation failed. Save birth details and ensure Swiss Ephemeris files are available.",
      );
      return;
    }
    setData(json.data);
    setNeedsRegen(false);
    setMessage("Your Vedic profile is ready.");
  }

  const h = data?.horoscope;
  const north = h?.chartNorth;
  const south = h?.chartSouth;
  const east = h?.chartEast;
  const hasChart = isNorthChart(north) || isSouthChart(south) || isEastChart(east);
  const moonNak = h?.planets?.find((p) => p.planet === "Moon")?.nakshatra;
  const lagnaNak = h?.lagnaNakshatra;

  const insight =
    h?.moonSign && h?.lagnaSign
      ? `With ${h.lagnaSign} rising${lagnaNak ? ` (${lagnaNak})` : ""} and a ${h.moonSign} Moon${moonNak ? ` in ${moonNak}` : ""}, your chart is calculated sidereal Lahiri — AstroSage-compatible.`
      : null;

  const links = [
    { t: "Charts (Moon/Sun/D9)", h: routes.divisionalCharts },
    { t: "Ashtakavarga", h: routes.ashtakavarga },
    { t: "Varna & Gana", h: routes.natalProfile },
    { t: "Raja Yogas", h: routes.rajaYogas },
    { t: "Yogas & doshas", h: routes.yogas },
    { t: "Lal Kitab", h: routes.lalKitab },
    { t: "Live Gochar", h: routes.gochar },
    { t: "Predictions", h: routes.predictions },
  ];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="My Kundli"
        title="Your Vedic profile"
        description="Simple summary first — open advanced details when you want them."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void generate()} disabled={loading}>
              {loading ? "Calculating…" : h ? "Regenerate chart" : "Generate chart"}
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.birthDetails}>Birth details</Link>
            </Button>
          </div>
        }
      />

      {needsRegen ? (
        <GlassCard className="border-primary/30 bg-primary/5 space-y-3">
          <p className="font-medium">Your birth details changed.</p>
          <p className="text-muted-foreground text-sm">
            Your Kundli and compatibility results may need to be recalculated.
          </p>
          <Button type="button" onClick={() => void generate()} disabled={loading}>
            Regenerate Kundli
          </Button>
        </GlassCard>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-emerald text-sm">{message}</p> : null}

      {loading && genPhase > 0 ? (
        <GlassCard className="space-y-3">
          <p className="font-display text-xl">Calculating your Vedic chart…</p>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            {GEN_STEPS.map((label, i) => (
              <li key={label} className={cn(genPhase > i && "text-foreground")}>
                {genPhase > i ? "✓" : "·"} {label}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      {h ? (
        <GlassCard className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              [
                "Ascendant",
                h.lagnaSign
                  ? `${h.lagnaSign}${h.lagnaDegree != null ? ` ${Math.floor(h.lagnaDegree)}°` : ""}`
                  : null,
              ],
              [
                "Lagna Nakshatra",
                h.lagnaNakshatra
                  ? `${h.lagnaNakshatra}${h.lagnaNakshatraPada ? ` P${h.lagnaNakshatraPada}` : ""}`
                  : null,
              ],
              ["Moon Sign", h.moonSign],
              ["Moon Nakshatra", moonNak],
              ["Sun Sign", h.sunSign],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-muted/30 rounded-xl px-3 py-3">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                  {label}
                </p>
                <p className="font-display mt-1 text-xl">{value || "—"}</p>
              </div>
            ))}
          </div>
          {data?.dasha?.currentMaha ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Current Dasha · </span>
              <span className="font-medium">
                {data.dasha.currentMaha}
                {data.dasha.currentAntar ? ` / ${data.dasha.currentAntar}` : ""}
              </span>
            </p>
          ) : null}
          {insight ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{insight}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={routes.matrimony}>Find compatible partners</Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowChart((v) => !v)}>
              {showChart ? "Hide chart" : "Show chart"}
            </Button>
            <Button asChild variant="ai">
              <Link href={routes.aiInsights}>Explain my chart</Link>
            </Button>
          </div>
        </GlassCard>
      ) : !loading ? (
        <EmptyState
          title="No kundli yet"
          description="Add your birth details, then generate your chart to unlock matches and compatibility."
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : null}

      {showChart && hasChart ? (
        <>
          <GlassCard className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-xl">Birth chart</p>
                <p className="text-muted-foreground text-sm">
                  Traditional kundli · calculated from your birth data
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["north", "North"],
                    ["south", "South"],
                    ["east", "East"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={style === key ? "default" : "outline"}
                    onClick={() => setStyle(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-center py-2">
              {style === "north" && isNorthChart(north) ? (
                <NorthIndianKundli chart={north} />
              ) : null}
              {style === "south" && isSouthChart(south) ? (
                <SouthIndianKundli chart={south} />
              ) : null}
              {style === "east" && isEastChart(east) ? <EastIndianKundli chart={east} /> : null}
            </div>
          </GlassCard>

          {h?.planets?.length ? (
            <GlassCard>
              <div className="mb-3 flex items-center gap-2">
                <p className="font-display text-xl">Planets</p>
                <Badge variant="outline">{h.planets.length}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {h.planets.slice(0, 12).map((p) => (
                  <div
                    key={p.planet}
                    className="border-border/50 rounded-xl border px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {p.planet}
                      {p.dignity === "Exalted" ? " ↑" : ""}
                      {p.dignity === "Debilitated" ? " ↓" : ""}
                      {p.dignity === "Own" ? " ◉" : ""}
                      {p.isRetrograde ? " ℞" : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {p.sign} · H{p.house} · {p.nakshatra}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {links.map((i) => (
              <Link key={i.t} href={i.h}>
                <GlassCard className="transition hover:-translate-y-0.5">
                  <p className="font-display text-xl">{i.t}</p>
                  <p className="text-muted-foreground mt-1 text-xs">Open detailed view</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      {showChart && !hasChart && h ? (
        <p className="text-muted-foreground text-sm">
          Regenerate your chart to view diagram and planet tables.
        </p>
      ) : null}
    </div>
  );
}
