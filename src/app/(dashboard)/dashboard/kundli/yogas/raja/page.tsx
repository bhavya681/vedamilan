"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import {
  VedicExtrasBanner,
  YogaDetailList,
} from "@/features/horoscope/components/yoga-dosha-details";
import { routes } from "@/lib/constants/routes";

type YogaItem = {
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
};

export default function RajaYogasPage() {
  const [rajaYogas, setRajaYogas] = useState<YogaItem[]>([]);
  const [otherYogas, setOtherYogas] = useState<YogaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Raja Yogas");
          return;
        }
        setRajaYogas(json.data.rajaYogas || []);
        setOtherYogas(json.data.otherYogas || []);
      })
      .catch(() => setError("Unable to load Raja Yogas"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Calculated from your Kundli"
        title="Raja Yogas"
        description="Auspicious combinations — tap each yoga for meaning and when it may activate with your current dasha."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.yogas}>All yogas & doshas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.lalKitab}>Lal Kitab</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          </div>
        }
      />

      <VedicExtrasBanner />
      {loading ? <PanelSkeleton lines={5} /> : null}
      {error ? (
        <EmptyState
          title="Generate your Kundli first"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && !error ? (
        <div className="space-y-4">
          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl">Raja & auspicious yogas</h2>
              <Badge variant="secondary">{rajaYogas.length} found</Badge>
            </div>
            <YogaDetailList
              items={rajaYogas}
              empty="No strong Raja-style combinations were flagged. Open all yogas for other combinations, or ask AI Guru with your chart context."
            />
          </GlassCard>

          {otherYogas.length ? (
            <GlassCard className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl">Other chart yogas</h2>
                <Button asChild variant="link" className="h-auto px-0">
                  <Link href={routes.yogas}>View all with details</Link>
                </Button>
              </div>
              <YogaDetailList items={otherYogas.slice(0, 8)} empty="" />
            </GlassCard>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
