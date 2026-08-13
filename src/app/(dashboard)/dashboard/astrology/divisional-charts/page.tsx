"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { ChartSkeleton, ContentReveal } from "@/components/ui/page-skeletons";
import { isNorthChart, NorthIndianKundli } from "@/features/horoscope/components/kundli-charts";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type CatalogItem = {
  id: string | number;
  code: string;
  name: string;
  theme: string;
};

type ChartsPayload = {
  moon?: unknown;
  sun?: unknown;
  navamsa?: unknown;
  d1North?: unknown;
  catalog?: CatalogItem[];
  vargas?: Record<string, unknown>;
};

const FALLBACK_CATALOG: CatalogItem[] = [
  { id: "moon", code: "Moon", name: "Moon chart", theme: "Houses from Chandra Lagna." },
  { id: "sun", code: "Sun", name: "Sun chart", theme: "Houses from Surya Lagna." },
  { id: 1, code: "D1", name: "Rashi (D1)", theme: "Primary birth chart." },
  { id: 9, code: "D9", name: "Navamsha (D9)", theme: "Marriage and dharma." },
  { id: 10, code: "D10", name: "Dasamsa (D10)", theme: "Career and status." },
  { id: 7, code: "D7", name: "Saptamsa (D7)", theme: "Children themes." },
  { id: 12, code: "D12", name: "Dwadamsa (D12)", theme: "Parents." },
];

function chartKey(item: CatalogItem) {
  return String(item.code);
}

export default function AstrologyDivisionalChartsPage() {
  const [tab, setTab] = useState("D1");
  const [charts, setCharts] = useState<ChartsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareChart, setCompareChart] = useState<string>("D9");

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load charts");
          return;
        }
        const data = (json.data.charts || {}) as ChartsPayload;
        setCharts(data);
        const codes = (data.catalog || FALLBACK_CATALOG).map((c) => chartKey(c));
        if (codes.includes("D1")) setTab("D1");
        else if (codes.length) setTab(codes[0]!);
      })
      .catch(() => setError("Unable to load charts"))
      .finally(() => setLoading(false));
  }, []);

  const catalog = charts?.catalog?.length ? charts.catalog : FALLBACK_CATALOG;

  const activeMeta = useMemo(
    () => catalog.find((c) => chartKey(c) === tab) || catalog[0],
    [catalog, tab],
  );

  const active = useMemo(() => {
    if (!charts || !activeMeta) return null;
    const code = chartKey(activeMeta);
    if (code === "Moon") return charts.moon;
    if (code === "Sun") return charts.sun;
    if (code === "D9") return charts.vargas?.D9 || charts.navamsa;
    if (code === "D1") return charts.vargas?.D1 || charts.d1North;
    return charts.vargas?.[code] ?? null;
  }, [charts, activeMeta]);

  const compareMeta = useMemo(
    () => catalog.find((c) => chartKey(c) === compareChart) || catalog[0],
    [catalog, compareChart],
  );

  const compare = useMemo(() => {
    if (!charts || !compareMeta) return null;
    const code = chartKey(compareMeta);
    if (code === "Moon") return charts.moon;
    if (code === "Sun") return charts.sun;
    if (code === "D9") return charts.vargas?.D9 || charts.navamsa;
    if (code === "D1") return charts.vargas?.D1 || charts.d1North;
    return charts.vargas?.[code] ?? null;
  }, [charts, compareMeta]);

  const groups = useMemo(() => {
    const core = catalog.filter((c) => ["D1", "D7", "D9", "D10", "D12"].includes(chartKey(c)));
    const alternate = catalog.filter((c) => ["Moon", "Sun"].includes(chartKey(c)));
    return [
      { label: "Alternate lagnas", items: alternate },
      { label: "Core vargas", items: core },
    ].filter((g) => g.items.length > 0);
  }, [catalog]);

  const _groups = groups;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Varga intelligence"
        title="Divisional Chart Studio"
        description="Explore D9, D10, D7, D12 and alternate lagnas — each divisional chart sharpens a specific life theme."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={routes.kundli}>Kundli hub</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.astrologyChartComparison}>Compare charts</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCompareMode(false)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            !compareMode
              ? "border-gold/40 bg-primary/12 text-foreground"
              : "border-border/60 text-muted-foreground",
          )}
        >
          Explore charts
        </button>
        <button
          type="button"
          onClick={() => setCompareMode(true)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            compareMode
              ? "border-gold/40 bg-primary/12 text-foreground"
              : "border-border/60 text-muted-foreground",
          )}
        >
          Compare charts
        </button>
      </div>

      {loading ? <ChartSkeleton /> : null}
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

      {!loading && !error ? (
        <ContentReveal
          className={cn(
            "grid min-w-0 gap-4",
            compareMode ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,auto)_1fr]",
          )}
        >
          <GlassCard className="flex min-w-0 flex-col items-center justify-center gap-3 p-3 sm:p-6">
            {isNorthChart(active) ? (
              <NorthIndianKundli chart={active} planetVoice={tab === "D1"} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Chart layout unavailable for this view.
              </p>
            )}
            <p className="text-muted-foreground text-center text-xs">{activeMeta?.name || tab}</p>
          </GlassCard>

          {compareMode && (
            <GlassCard className="flex min-w-0 flex-col items-center justify-center gap-3 p-3 sm:p-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Compare with
                </p>
                <div className="flex flex-wrap gap-2">
                  {catalog.map((item) => (
                    <button
                      key={chartKey(item)}
                      type="button"
                      onClick={() => setCompareChart(chartKey(item))}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                        compareChart === chartKey(item)
                          ? "border-gold/40 bg-primary/12 text-foreground"
                          : "border-border/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.code}
                    </button>
                  ))}
                </div>
              </div>
              {isNorthChart(compare) ? (
                <NorthIndianKundli chart={compare} planetVoice={compareChart === "D1"} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Chart layout unavailable for this view.
                </p>
              )}
              <p className="text-muted-foreground text-center text-xs">
                {compareMeta?.name || compareChart}
              </p>
            </GlassCard>
          )}

          {!compareMode && (
            <GlassCard className="min-w-0 space-y-3 p-4 sm:p-6">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {activeMeta?.code}
                </p>
                <h2 className="font-display text-xl sm:text-2xl">{activeMeta?.name || tab}</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {activeMeta?.theme ||
                  "Divisional chart calculated from your Kundli longitudes (Parashari varga)."}
              </p>
              <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                <li>North Indian diamond — house 1 of this chart&apos;s Lagna at the top.</li>
                <li>Whole-sign houses from the varga / alternate Lagna.</li>
                <li>
                  Parashari mapping from stored sidereal longitudes — regenerate after birth edits.
                </li>
              </ul>
            </GlassCard>
          )}
        </ContentReveal>
      ) : null}
    </div>
  );
}
