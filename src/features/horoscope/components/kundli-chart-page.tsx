"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import {
  EastIndianKundli,
  isEastChart,
  isNorthChart,
  isSouthChart,
  NorthIndianKundli,
  SouthIndianKundli,
} from "@/features/horoscope/components/kundli-charts";
import { useHoroscope } from "@/hooks/use-horoscope";
import { routes } from "@/lib/constants/routes";

export function KundliChartPage({
  title,
  description,
  pick,
}: {
  title: string;
  description: string;
  pick: "chartNorth" | "chartSouth" | "chartEast";
}) {
  const { data, error, loading } = useHoroscope();
  const chart = data?.horoscope?.[pick];
  const h = data?.horoscope;

  let body: ReactNode = null;
  if (pick === "chartNorth" && isNorthChart(chart)) {
    body = <NorthIndianKundli chart={chart} />;
  } else if (pick === "chartSouth" && isSouthChart(chart)) {
    body = <SouthIndianKundli chart={chart} />;
  } else if (pick === "chartEast" && isEastChart(chart)) {
    body = <EastIndianKundli chart={chart} />;
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Back to kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.planets}>Planets</Link>
            </Button>
          </div>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading chart…</p> : null}
      {!loading && !body ? (
        <EmptyState
          title="No chart layout yet"
          description="Generate your kundli to render this traditional chart box."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate kundli</Link>
            </Button>
          }
        />
      ) : body ? (
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <GlassCard className="flex flex-col items-center justify-center gap-3 p-4 sm:p-6">
            {body}
            <p className="text-muted-foreground text-center text-xs">
              Lagna {h?.lagnaSign} · Moon {h?.moonSign} · Sun {h?.sunSign}
            </p>
          </GlassCard>
          <GlassCard className="space-y-3">
            <p className="font-display text-xl">How to read</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
              {pick === "chartNorth" ? (
                <>
                  <li>
                    House 1 / Asc always at top; count anti-clockwise (4 left, 7 bottom, 10 right).
                  </li>
                  <li>Same-sign planets share one house (whole-sign from Lagna).</li>
                  <li>↑ Ucch (exalted) · ↓ Neech (debilitated) · ◉ Own · ℞ Retrograde.</li>
                </>
              ) : pick === "chartSouth" ? (
                <>
                  <li>Fixed rashis — Aries is top row, second cell.</li>
                  <li>Corner number = house from Lagna; abbr = sign.</li>
                  <li>↑ Ucch · ↓ Neech · ◉ Own · ℞ Retro with degree.</li>
                </>
              ) : (
                <>
                  <li>Fixed rashis — Aries at top; count houses anti-clockwise from Lagna.</li>
                  <li>Corner number = house from Asc; planets sit in their sign.</li>
                  <li>↑ Ucch · ↓ Neech · ◉ Own · ℞ Retrograde.</li>
                </>
              )}
            </ul>
            {h?.planets?.length ? (
              <div className="border-border/50 mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
                {h.planets
                  .filter((p) =>
                    [
                      "Sun",
                      "Moon",
                      "Mars",
                      "Mercury",
                      "Jupiter",
                      "Venus",
                      "Saturn",
                      "Rahu",
                      "Ketu",
                    ].includes(p.planet),
                  )
                  .map((p) => (
                    <div key={p.planet} className="text-sm">
                      <span className="font-medium">
                        {p.planet}
                        {p.dignity === "Exalted" ? " ↑" : ""}
                        {p.dignity === "Debilitated" ? " ↓" : ""}
                        {p.dignity === "Own" ? " ◉" : ""}
                        {p.isRetrograde ? " ℞" : ""}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {p.sign} · H{p.house}
                        {p.dignity && p.dignity !== "Neutral" ? ` · ${p.dignity}` : ""}
                      </span>
                    </div>
                  ))}
              </div>
            ) : null}
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
