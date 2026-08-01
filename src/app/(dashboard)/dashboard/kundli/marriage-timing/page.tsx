"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  TimingPredictionPanel,
  type TimingPredictionView,
} from "@/features/compatibility/timing-prediction-panel";
import {
  SpouseTendencyPanel,
  type SpouseTendenciesView,
} from "@/features/compatibility/spouse-tendency-panel";
import { routes } from "@/lib/constants/routes";
import { PanelSkeleton } from "@/components/ui/page-skeletons";

export default function MarriageTimingPage() {
  const [timing, setTiming] = useState<TimingPredictionView | null>(null);
  const [spouseTendencies, setSpouseTendencies] = useState<SpouseTendenciesView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/marriage-timing")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          setTiming(json.data.timingPrediction || null);
          setSpouseTendencies(json.data.spouseTendencies || null);
        } else setError(json.error?.message || "Failed to load");
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load marriage timing");
      });
  }, []);

  return (
    <div className="relative min-w-0 space-y-6">
      <PageHeader
        eyebrow="Marriage timing"
        title="When alliance favors you"
        description="Mahadasha, Antardasha, and live Gochar — plus chart leanings for love vs arranged and spouse background."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Kundli workspace</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}
      {!loading && !error ? (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <TimingPredictionPanel timing={timing} pairMode={false} />
          <SpouseTendencyPanel tendencies={spouseTendencies} showCta={false} />
        </div>
      ) : null}
    </div>
  );
}
