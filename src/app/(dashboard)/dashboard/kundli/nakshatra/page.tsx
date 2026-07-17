"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { useHoroscope } from "@/hooks/use-horoscope";

export default function NakshatraPage() {
  const { data, error, loading } = useHoroscope();
  const planets = data?.horoscope?.planets || [];
  const moon = planets.find((p) => p.planet === "Moon");

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Nakshatra"
        description="Birth stars and padas from your chart"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      {!loading && !moon ? (
        <EmptyState
          title="No nakshatra data"
          description="Generate kundli to see Moon and planet nakshatras."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : (
        <>
          <GlassCard glow>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Moon nakshatra</p>
            <h2 className="font-display mt-2 text-3xl">{moon?.nakshatra}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {moon?.sign} · Pada {moon?.nakshatraPada ?? "—"}
            </p>
          </GlassCard>
          <div className="grid gap-3 sm:grid-cols-2">
            {planets.map((p) => (
              <GlassCard key={p.planet} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{p.planet}</p>
                  <p className="text-muted-foreground text-xs">{p.nakshatra}</p>
                </div>
                <Badge variant="outline">P{p.nakshatraPada ?? "—"}</Badge>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
