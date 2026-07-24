"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { ChartSkeleton, ContentReveal } from "@/components/ui/page-skeletons";
import { isNorthChart, NorthIndianKundli } from "@/features/horoscope/components/kundli-charts";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type ChartTab = "moon" | "sun" | "navamsa" | "d1";

export default function DivisionalChartsPage() {
  const [tab, setTab] = useState<ChartTab>("moon");
  const [charts, setCharts] = useState<Record<string, unknown> | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
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
        setCharts(json.data.charts || {});
        setNotes(json.data.charts?.navamsa?.notes || []);
      })
      .catch(() => setError("Unable to load charts"))
      .finally(() => setLoading(false));
  }, []);

  const active =
    tab === "moon"
      ? charts?.moon
      : tab === "sun"
        ? charts?.sun
        : tab === "navamsa"
          ? charts?.navamsa
          : charts?.d1North;

  const titles: Record<ChartTab, { title: string; blurb: string }> = {
    moon: {
      title: "Moon chart (Chandra Lagna)",
      blurb: "Houses counted from your Moon sign — emotional life and mind-focused reading.",
    },
    sun: {
      title: "Sun chart (Surya Lagna)",
      blurb: "Houses counted from your Sun sign — vitality and outer identity themes.",
    },
    navamsa: {
      title: "Navamsha (D9)",
      blurb:
        "Ninth-divisional chart — marriage experience, strength of planets, and dharma themes.",
    },
    d1: {
      title: "Birth chart (D1)",
      blurb: "Rashi chart from Lagna — your primary whole-sign kundli.",
    },
  };

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Divisional & alternate lagnas"
        title="Charts"
        description="Moon chart, Sun chart, Navamsha, and D1 — calculated from your stored planetary positions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli hub</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.ashtakavarga}>Ashtakavarga</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["moon", "Moon"],
            ["sun", "Sun"],
            ["navamsa", "D9 Navamsha"],
            ["d1", "D1 Lagna"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-gold/40 bg-primary/12 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
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
        <ContentReveal className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <GlassCard className="flex flex-col items-center justify-center gap-3 p-4 sm:p-6">
            {isNorthChart(active) ? (
              <NorthIndianKundli chart={active} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Chart layout unavailable for this view.
              </p>
            )}
            <p className="text-muted-foreground text-center text-xs">{titles[tab].title}</p>
          </GlassCard>
          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">{titles[tab].title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{titles[tab].blurb}</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
              <li>North Indian diamond — house 1 of this reference at the top.</li>
              <li>Whole-sign houses from the chosen Lagna (Moon / Sun / D9 / D1).</li>
              <li>Calculated from your Kundli — regenerate after birth-detail changes.</li>
            </ul>
            {tab === "navamsa" && notes.length ? (
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
