"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { useHoroscope } from "@/hooks/use-horoscope";

export default function PlanetsPage() {
  const { data, error, loading } = useHoroscope();
  const planets = data?.horoscope?.planets || [];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Planet Details"
        description="Positions, dignity, and themes"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
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
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {planets.map((p) => (
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
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
