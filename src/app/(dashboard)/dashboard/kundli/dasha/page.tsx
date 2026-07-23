"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { useHoroscope } from "@/hooks/use-horoscope";

export default function DashaPage() {
  const { data, error, loading } = useHoroscope();
  const periods = (data?.dasha?.periods || []).filter((p) => p.level === "MAHA").slice(0, 12);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Dasha"
        description="Vimshottari mahadasha timeline"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={5} /> : null}
      <GlassCard>
        <p className="text-sm">
          Current: <strong>{data?.dasha?.currentMaha || "—"}</strong>
          {data?.dasha?.currentAntar ? ` / ${data.dasha.currentAntar}` : ""}
        </p>
      </GlassCard>
      {!loading && periods.length === 0 ? (
        <EmptyState
          title="No dasha yet"
          description="Generate kundli to compute Vimshottari periods."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {periods.map((p, idx) => (
            <GlassCard key={`${p.lord}-${idx}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <p className="font-medium">{p.lord} Mahadasha</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(p.startDate).toLocaleDateString("en-IN")} –{" "}
                  {new Date(p.endDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
