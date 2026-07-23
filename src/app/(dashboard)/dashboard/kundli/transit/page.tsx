"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { useHoroscope } from "@/hooks/use-horoscope";

export default function TransitPage() {
  const { data, error, loading } = useHoroscope();
  const yogas = data?.horoscope?.yogas || [];
  const doshas = data?.horoscope?.doshas || [];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Transit & yogas"
        description="Stored yoga/dosha notes from your calculated chart"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={5} /> : null}
      {!loading && !data?.horoscope ? (
        <EmptyState
          title="No transit context"
          description="Generate kundli first. Live transit ephemeris can be layered later."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard>
            <h2 className="font-display text-xl">Yogas</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {yogas.length
                ? yogas.map((y) => (
                    <li key={y.name}>
                      {y.name} · {y.category}
                    </li>
                  ))
                : "No yogas flagged by the rule engine."}
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-xl">Doshas</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {doshas.length
                ? doshas.map((d) => (
                    <li key={d.code}>
                      {d.code} · {d.present ? d.severity || "present" : "clear"}
                    </li>
                  ))
                : "No doshas flagged."}
            </ul>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
