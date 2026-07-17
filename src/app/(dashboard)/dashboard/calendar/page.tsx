"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type WindowItem = {
  label?: string;
  window?: string;
  startDate?: string;
  endDate?: string;
  score?: number;
  notes?: string;
};

export default function CalendarPage() {
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [dasha, setDasha] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/marriage-timing").then((r) => r.json()),
      fetch("/api/horoscope").then((r) => r.json()),
    ])
      .then(([timing, chart]) => {
        if (timing.success) {
          setWindows(timing.data.windows || []);
        } else if (timing.error?.message) {
          setError(timing.error.message);
        }
        if (chart.success && chart.data?.horoscope) {
          setMoonSign(chart.data.horoscope.moonSign);
          setDasha(chart.data.dasha?.currentMaha || null);
        }
        if (!timing.success && !chart.success) {
          setError("Add birth details and generate kundli to populate your calendar.");
        }
      })
      .catch(() => setError("Failed to load calendar"));
  }, []);

  const list = windows;
  const needsOnboarding = Boolean(error) && !moonSign && list.length === 0;

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Calendar"
        description="Marriage timing windows from your chart"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.marriageTiming}>Timing detail</Link>
          </Button>
        }
      />
      {needsOnboarding ? (
        <EmptyState
          title="Chart required"
          description={error || "Add birth details and generate kundli."}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <h2 className="font-display text-xl">Timing windows</h2>
            {error && list.length === 0 ? (
              <p className="text-muted-foreground mt-3 text-sm">{error}</p>
            ) : null}
            {list.length === 0 && !error ? (
              <p className="text-muted-foreground mt-3 text-sm">
                No windows yet — open marriage timing to calculate.
              </p>
            ) : null}
            {list.length > 0 ? (
              <ul className="mt-3 space-y-3 text-sm">
                {list.slice(0, 6).map((w, i) => (
                  <li key={`${w.label || "w"}-${i}`}>
                    <p className="font-medium">{w.label || `Window ${i + 1}`}</p>
                    <p className="text-muted-foreground text-xs">
                      {w.window ||
                        `${w.startDate ? new Date(w.startDate).toLocaleDateString() : "—"} → ${
                          w.endDate ? new Date(w.endDate).toLocaleDateString() : "—"
                        }`}
                      {typeof w.score === "number" ? ` · score ${w.score}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href={routes.marriageTiming}>Recalculate</Link>
            </Button>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-xl">Today&apos;s focus</h2>
            <p className="mt-3 text-sm">
              Moon {moonSign || "—"}
              {dasha ? ` · Maha dasha ${dasha}` : ""}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Live daily guidance uses your stored chart via AI explain — never invented planetary
              positions.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href={routes.horoscope}>Open daily horoscope</Link>
            </Button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
