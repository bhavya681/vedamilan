"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EastIndianKundli,
  isNorthChart,
  isSouthChart,
  NorthIndianKundli,
  SouthIndianKundli,
} from "@/features/horoscope/components/kundli-charts";
import { routes } from "@/lib/constants/routes";

type HoroscopePayload = {
  horoscope?: {
    lagnaSign?: string;
    moonSign?: string;
    sunSign?: string;
    manglikStatus?: string;
    planets?: Array<{ planet: string; sign: string; house: number; nakshatra: string }>;
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

export default function KundliPage() {
  const [data, setData] = useState<HoroscopePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<"north" | "south" | "east">("north");

  async function load() {
    const res = await fetch("/api/horoscope");
    const json = await res.json();
    if (json.success) setData(json.data);
    else setError(json.error?.message || "Failed to load");
  }

  useEffect(() => {
    void load().catch(() => setError("Failed to load kundli"));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/horoscope", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(
        json.error?.message ||
          "Generation failed. Save birth details and ensure Swiss Ephemeris files are available.",
      );
      return;
    }
    setData(json.data);
    setMessage("Chart generated and stored.");
  }

  const h = data?.horoscope;
  const north = h?.chartNorth;
  const south = h?.chartSouth;
  const east = h?.chartEast;
  const hasChart = isNorthChart(north) || isSouthChart(south);

  const links = [
    { t: "North Indian", h: routes.chartNorth },
    { t: "South Indian", h: routes.chartSouth },
    { t: "East Indian", h: routes.chartEast },
    { t: "Planets", h: routes.planets },
    { t: "Nakshatra", h: routes.nakshatra },
    { t: "Dasha", h: routes.dasha },
    { t: "Transit", h: routes.transit },
    { t: "Marriage Timing", h: routes.marriageTiming },
  ];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Kundli"
        description="Your Vedic chart workspace"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generate} disabled={loading}>
              {loading ? "Generating…" : "Generate chart"}
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.birthDetails}>Birth details</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-emerald text-sm">{message}</p> : null}

      {h ? (
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Lagna</p>
            <p className="font-display mt-2 text-2xl">{h.lagnaSign}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Moon / Sun</p>
            <p className="font-display mt-2 text-2xl">
              {h.moonSign} / {h.sunSign}
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Manglik</p>
            <p className="font-display mt-2 text-2xl">{h.manglikStatus}</p>
            {data?.dasha ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Dasha {data.dasha.currentMaha} / {data.dasha.currentAntar}
              </p>
            ) : null}
          </GlassCard>
        </div>
      ) : (
        <GlassCard>
          <p className="text-muted-foreground text-sm">
            No stored chart yet. Save birth details, then generate. Calculations use Swiss Ephemeris
            — AI never computes astrology.
          </p>
        </GlassCard>
      )}

      {hasChart ? (
        <GlassCard className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">Birth chart</p>
              <p className="text-muted-foreground text-sm">
                Traditional kundli box · Su Mo Ma Me Ju Ve Sa Ra Ke
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
            {style === "north" && isNorthChart(north) ? <NorthIndianKundli chart={north} /> : null}
            {style === "south" && isSouthChart(south) ? <SouthIndianKundli chart={south} /> : null}
            {style === "east" ? (
              isSouthChart(east) ? (
                <EastIndianKundli chart={east} />
              ) : isSouthChart(south) ? (
                <EastIndianKundli chart={south} />
              ) : null
            ) : null}
          </div>
        </GlassCard>
      ) : null}

      {h?.planets?.length ? (
        <GlassCard>
          <div className="mb-3 flex items-center gap-2">
            <p className="font-display text-xl">Planets</p>
            <Badge variant="outline">{h.planets.length}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {h.planets.slice(0, 12).map((p) => (
              <div key={p.planet} className="border-border/50 rounded-xl border px-3 py-2 text-sm">
                <p className="font-medium">{p.planet}</p>
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
              <p className="text-muted-foreground mt-1 text-xs">Open workspace view</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
