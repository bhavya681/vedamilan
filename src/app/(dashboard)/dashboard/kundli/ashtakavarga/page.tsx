"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type SavRow = { house: number; sign: string; bindus: number; note: string };
type Ashtaka = {
  methodology: string;
  lagnaSign: string;
  sarva: SavRow[];
  bhinna: Record<string, Array<{ house: number; sign: string; bindus: number }>>;
  highlights: string[];
};

export default function AshtakavargaPage() {
  const [data, setData] = useState<Ashtaka | null>(null);
  const [planet, setPlanet] = useState("Sun");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Ashtakavarga");
          return;
        }
        setData(json.data.ashtakavarga);
        const first = Object.keys(json.data.ashtakavarga?.bhinna || {})[0];
        if (first) setPlanet(first);
      })
      .catch(() => setError("Unable to load Ashtakavarga"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Sarvashtakavarga · Bhinnashtakavarga"
        title="Ashtakavarga"
        description="Bindu strength by house from Lagna — classical contribution tables, not AI scores."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.divisionalCharts}>Charts</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

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
        <div className="space-y-4">
          <GlassCard className="space-y-2">
            <p className="text-muted-foreground text-xs">{data.methodology}</p>
            <p className="text-sm">
              Lagna reference · <span className="font-medium">{data.lagnaSign}</span>
            </p>
            {data.highlights.length ? (
              <ul className="mt-2 space-y-1 text-sm">
                {data.highlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            ) : null}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Sarvashtakavarga</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.sarva.map((row) => (
                <div
                  key={row.house}
                  className={cn(
                    "border-border/50 rounded-xl border px-3 py-2.5",
                    row.bindus >= 28 && "border-gold/30 bg-primary/5",
                    row.bindus <= 18 && "opacity-80",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      H{row.house} · {row.sign}
                    </p>
                    <Badge variant="secondary">{row.bindus}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{row.note}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Bhinnashtakavarga</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(data.bhinna).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlanet(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    planet === p
                      ? "border-gold/40 bg-primary/12"
                      : "border-border/60 text-muted-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {(data.bhinna[planet] || []).map((row) => (
                <div
                  key={row.house}
                  className="border-border/40 rounded-lg border px-2 py-2 text-center"
                >
                  <p className="text-muted-foreground text-[10px]">H{row.house}</p>
                  <p className="font-display text-lg">{row.bindus}</p>
                  <p className="text-muted-foreground text-[10px]">{row.sign}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
