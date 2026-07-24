"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type GocharPlanet = {
  planet: string;
  sign: string;
  houseFromNatalLagna: number;
  nakshatra: string;
  isRetrograde: boolean;
  note: string;
};

type GocharPayload = {
  asOf: string;
  timezoneNote: string;
  transitAscendant: string;
  natalLagna: string;
  natalMoon: string;
  highlights: string[];
  planets: GocharPlanet[];
};

export default function GocharPage() {
  const [data, setData] = useState<GocharPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/gochar")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load live Gochar");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load live Gochar"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Live sky · Swiss Ephemeris"
        title="Current Gochar"
        description="Transit positions calculated for this moment against your natal Lagna — not AI speculation."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.transit}>Yogas & doshas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          </div>
        }
      />

      <p className="text-muted-foreground text-xs">
        Calculated from your Kundli · Verified planetary data · AI may explain these results but
        does not recalculate them.
      </p>

      {loading ? <PanelSkeleton lines={6} /> : null}
      {error ? (
        <EmptyState
          title="Gochar unavailable"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Check birth details</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-4">
          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  As of
                </p>
                <p className="font-medium">
                  {new Date(data.asOf).toLocaleString()} · {data.timezoneNote}
                </p>
              </div>
              <Badge variant="secondary">Natal Lagna {data.natalLagna}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Transit Ascendant</p>
                <p className="font-display text-2xl">{data.transitAscendant}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Natal Moon</p>
                <p className="font-display text-2xl">{data.natalMoon}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">House reference</p>
                <p className="text-sm">Houses counted from natal Lagna</p>
              </div>
            </div>
            {data.highlights.length ? (
              <ul className="space-y-1.5 text-sm">
                {data.highlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            ) : null}
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.planets.map((p) => (
              <GlassCard key={p.planet} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl">{p.planet}</h3>
                  {p.isRetrograde ? <Badge variant="outline">R</Badge> : null}
                </div>
                <p className="text-sm">
                  {p.sign} · House {p.houseFromNatalLagna}
                </p>
                <p className="text-muted-foreground text-xs">{p.nakshatra}</p>
                <p className="text-sm leading-relaxed">{p.note}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
