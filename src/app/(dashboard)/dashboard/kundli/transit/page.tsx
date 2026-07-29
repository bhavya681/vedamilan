"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import {
  DoshaDetailList,
  VedicExtrasBanner,
  YogaDetailList,
} from "@/features/horoscope/components/yoga-dosha-details";
import { routes } from "@/lib/constants/routes";

type Extras = {
  yogas: Array<{
    code?: string;
    name: string;
    category?: string;
    strength?: number;
    description?: string;
    insight: {
      meaning: string;
      whenActivates: string;
      watchFor: string;
      lifeAreas: string[];
      activationNow: string;
      engineNote: string;
    };
  }>;
  doshas: Array<{
    code: string;
    name: string;
    present: boolean;
    severity?: string;
    notes?: string;
    insight: {
      meaning: string;
      whenActivates: string;
      watchFor: string;
      lifeAreas: string[];
      activationNow: string;
      engineNote: string;
      statusLabel?: string;
    };
  }>;
};

export default function YogasDoshasPage() {
  const [data, setData] = useState<Extras | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load yogas & doshas");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load yogas & doshas"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Calculated from your Kundli"
        title="Yogas & Doshas"
        description="See which combinations you carry — and how similar themes show up in public leadership, craft, and comeback stories. Tap any item for the parallel and your edge."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.rajaYogas}>Raja Yogas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.lalKitab}>Lal Kitab</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      <VedicExtrasBanner />
      {loading ? <PanelSkeleton lines={6} /> : null}
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

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="space-y-3">
            <div>
              <h2 className="font-display text-xl">Yogas</h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Supportive combinations — each with a public-life parallel and how to use your edge.
              </p>
            </div>
            <YogaDetailList items={data.yogas} empty="No yogas flagged by the rule engine." />
          </GlassCard>
          <GlassCard className="space-y-3">
            <div>
              <h2 className="font-display text-xl">Doshas</h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Friction themes reframed — intensity that admired comeback stories also carry.
              </p>
            </div>
            <DoshaDetailList items={data.doshas} />
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
