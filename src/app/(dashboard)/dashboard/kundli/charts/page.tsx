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
  { id: 2, code: "D2", name: "Hora (D2)", theme: "Wealth capacity." },
  { id: 3, code: "D3", name: "Drekkana (D3)", theme: "Siblings and courage." },
  { id: 4, code: "D4", name: "Chaturthamsa (D4)", theme: "Property and fortune." },
  { id: 7, code: "D7", name: "Saptamsa (D7)", theme: "Children themes." },
  { id: 9, code: "D9", name: "Navamsha (D9)", theme: "Marriage and dharma." },
  { id: 10, code: "D10", name: "Dasamsa (D10)", theme: "Career and status." },
  { id: 11, code: "D11", name: "Rudramsa (D11)", theme: "Gains and labha." },
  { id: 12, code: "D12", name: "Dwadamsa (D12)", theme: "Parents." },
  { id: 16, code: "D16", name: "Shodasamsa (D16)", theme: "Vehicles and comforts." },
  { id: 20, code: "D20", name: "Vimsamsa (D20)", theme: "Spiritual practice." },
  { id: 24, code: "D24", name: "Chaturvimsamsa (D24)", theme: "Education." },
  { id: 27, code: "D27", name: "Bhamsa (D27)", theme: "Strengths." },
  { id: 30, code: "D30", name: "Trimsamsa (D30)", theme: "Health vigilance." },
  { id: 60, code: "D60", name: "Shashtiamsa (D60)", theme: "Fine karmic detail." },
];

function chartKey(item: CatalogItem) {
  return String(item.code);
}

export default function DivisionalChartsPage() {
  const [tab, setTab] = useState("D10");
  const [charts, setCharts] = useState<ChartsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (!codes.includes("D10") && codes.length) setTab(codes[0]!);
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

  const notes = useMemo(() => {
    if (!active || typeof active !== "object") return [] as string[];
    const n = (active as { notes?: string[] }).notes;
    return Array.isArray(n) ? n : [];
  }, [active]);

  const groups = useMemo(() => {
    const alternate = catalog.filter((c) => ["Moon", "Sun"].includes(chartKey(c)));
    const core = catalog.filter((c) =>
      ["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D11", "D12"].includes(chartKey(c)),
    );
    const fine = catalog.filter((c) =>
      ["D16", "D20", "D24", "D27", "D30", "D60"].includes(chartKey(c)),
    );
    return [
      { label: "Alternate lagnas", items: alternate },
      { label: "Core vargas", items: core },
      { label: "Fine vargas", items: fine },
    ].filter((g) => g.items.length > 0);
  }, [catalog]);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Divisional & alternate lagnas"
        title="Charts"
        description="Moon, Sun, and important Vargas (D1–D60) — D10 career, D11 gains, D30 friction, and more — from your stored planetary longitudes."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={routes.kundli}>Kundli hub</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.ashtakavarga}>Ashtakavarga</Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.label} className="min-w-0 space-y-1.5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              {group.label}
            </p>
            <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch]">
              {group.items.map((item) => {
                const key = chartKey(item);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                      tab === key
                        ? "border-gold/40 bg-primary/12 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.code}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
        <ContentReveal className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,auto)_1fr] lg:gap-6">
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
              <li>North Indian diamond — house 1 of this chart’s Lagna at the top.</li>
              <li>Whole-sign houses from the varga / alternate Lagna.</li>
              <li>
                Parashari mapping from stored sidereal longitudes — regenerate after birth edits.
              </li>
            </ul>
            {notes.length ? (
              <div className="border-border/50 text-muted-foreground space-y-1 border-t pt-3 text-xs">
                {notes.map((n) => (
                  <p key={n}>· {n}</p>
                ))}
              </div>
            ) : null}
          </GlassCard>
        </ContentReveal>
      ) : null}
    </div>
  );
}
