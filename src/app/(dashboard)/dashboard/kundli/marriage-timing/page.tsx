"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  TimingPredictionPanel,
  type TimingPredictionView,
} from "@/features/compatibility/timing-prediction-panel";
import { routes } from "@/lib/constants/routes";
import { PanelSkeleton } from "@/components/ui/page-skeletons";

export default function MarriageTimingPage() {
  const [timing, setTiming] = useState<TimingPredictionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/marriage-timing")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          setTiming(json.data.timingPrediction || null);
        } else setError(json.error?.message || "Failed to load");
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load marriage timing");
      });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Marriage timing"
        title="When alliance favors you"
        description="Mahadasha, Antardasha, and live Gochar — multi-factor, not a single-rule guess"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Kundli workspace</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}
      {!loading && !error ? <TimingPredictionPanel timing={timing} pairMode={false} /> : null}
    </div>
  );
}
