"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentReveal, PanelSkeleton } from "@/components/ui/page-skeletons";
import { grahaIdFromEngineName } from "@/domain/graha-katha/engine-map";
import { grahaKathaPlanet, routes } from "@/lib/constants/routes";
import { useHoroscope } from "@/hooks/use-horoscope";

export default function PlanetsPage() {
  const { data, error, loading } = useHoroscope();
  const planets = data?.horoscope?.planets || [];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Planet Details"
        description="Positions, dignity, and themes — open Graha Katha for stories & symbolism"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={routes.grahaKatha}>Graha Katha</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Back to kundli</Link>
            </Button>
          </div>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}
      {!loading && planets.length === 0 ? (
        <EmptyState
          title="No chart yet"
          description="Generate your kundli to view planet positions."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Open kundli</Link>
            </Button>
          }
        />
      ) : !loading ? (
        <ContentReveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {planets.map((p) => {
            const grahaId = grahaIdFromEngineName(p.planet);
            return (
              <GlassCard key={p.planet}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl">{p.planet}</h2>
                  <Badge>{p.sign}</Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  House {p.house} · {p.nakshatra}
                  {p.nakshatraPada ? ` pada ${p.nakshatraPada}` : ""}
                  {p.isRetrograde ? " · R" : ""}
                </p>
                {p.dignity ? <p className="text-ai mt-2 text-xs">{p.dignity}</p> : null}
                {grahaId ? (
                  <Button asChild variant="link" className="mt-2 h-auto px-0">
                    <Link href={grahaKathaPlanet(grahaId)}>Open Graha Katha</Link>
                  </Button>
                ) : null}
              </GlassCard>
            );
          })}
        </ContentReveal>
      ) : null}
    </div>
  );
}
