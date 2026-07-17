"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import {
  EastIndianKundli,
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
  } else if (pick === "chartEast" && isSouthChart(chart)) {
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
                  <li>House 1 (Asc) is always at the top diamond.</li>
                  <li>Houses run anti-clockwise around the chart.</li>
                  <li>Planet abbreviations: Su Mo Ma Me Ju Ve Sa Ra Ke.</li>
                </>
              ) : pick === "chartSouth" ? (
                <>
                  <li>Signs are fixed — Aries is top row, second cell.</li>
                  <li>Ascendant is highlighted in the lagna sign cell.</li>
                  <li>Planets sit in their rashi (sign) boxes.</li>
                </>
              ) : (
                <>
                  <li>Diamond layout with fixed zodiac signs.</li>
                  <li>Ascendant is marked in the lagna sign.</li>
                  <li>Common East-Indian / Bengali reading style.</li>
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
                      <span className="font-medium">{p.planet}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {p.sign} · H{p.house}
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
