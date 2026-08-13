"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
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

const BINDU_COLORS: Record<number, string> = {
  0: "border-border/40 bg-muted/20",
  1: "border-border/40 bg-muted/20",
  2: "border-border/40 bg-muted/20",
  3: "border-border/40 bg-muted/20",
  4: "border-border/40 bg-muted/20",
  5: "border-border/40 bg-muted/20",
  6: "border-border/40 bg-muted/20",
  7: "border-border/40 bg-muted/20",
  8: "border-border/40 bg-muted/20",
  9: "border-border/40 bg-muted/20",
  10: "border-border/40 bg-muted/20",
  11: "border-border/40 bg-muted/20",
  12: "border-amber-500/30 bg-amber-500/5",
  13: "border-amber-500/30 bg-amber-500/5",
  14: "border-amber-500/30 bg-amber-500/5",
  15: "border-amber-500/30 bg-amber-500/5",
  16: "border-amber-500/30 bg-amber-500/5",
  17: "border-amber-500/30 bg-amber-500/5",
  18: "border-amber-500/30 bg-amber-500/5",
  19: "border-amber-500/30 bg-amber-500/5",
  20: "border-amber-500/30 bg-amber-500/5",
  21: "border-amber-500/30 bg-amber-500/5",
  22: "border-amber-500/30 bg-amber-500/5",
  23: "border-amber-500/30 bg-amber-500/5",
  24: "border-gold/30 bg-primary/5",
  25: "border-gold/30 bg-primary/5",
  26: "border-gold/30 bg-primary/5",
  27: "border-gold/30 bg-primary/5",
  28: "border-gold/30 bg-primary/5",
  29: "border-gold/30 bg-primary/5",
  30: "border-emerald-500/30 bg-emerald-500/5",
  31: "border-emerald-500/30 bg-emerald-500/5",
  32: "border-emerald-500/30 bg-emerald-500/5",
  33: "border-emerald-500/30 bg-emerald-500/5",
  34: "border-emerald-500/30 bg-emerald-500/5",
  35: "border-emerald-500/30 bg-emerald-500/5",
  36: "border-emerald-500/30 bg-emerald-500/5",
  37: "border-emerald-500/30 bg-emerald-500/5",
  38: "border-emerald-500/30 bg-emerald-500/5",
  39: "border-emerald-500/30 bg-emerald-500/5",
  40: "border-emerald-500/30 bg-emerald-500/5",
};

function binduColor(bindus: number) {
  return BINDU_COLORS[Math.max(0, Math.min(40, bindus))] || "border-border/40 bg-muted/20";
}

export default function AstrologyAshtakavargaPage() {
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
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Sarvashtakavarga · Bhinnashtakavarga"
        title="Ashtakavarga"
        description="Bindu strength by house from Lagna — classical contribution tables. Higher bindus indicate stronger support for that house's themes."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyDivisionalCharts}>Charts</Link>
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
            <p className="text-muted-foreground text-xs">
              Total bindu contribution from all planets (Sun, Moon, Mars, Mercury, Jupiter, Venus,
              Saturn, Lagna) for each house. Max possible per house is typically 56.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {data.sarva.map((row) => (
                <div
                  key={row.house}
                  className={cn(
                    "rounded-xl border p-2.5 text-center transition-colors",
                    binduColor(row.bindus),
                  )}
                >
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    H{row.house}
                  </p>
                  <p className="font-display text-xl sm:text-2xl">{row.bindus}</p>
                  <p className="text-muted-foreground text-[10px]">{row.sign}</p>
                  <p className="text-muted-foreground mt-1 text-[10px] leading-relaxed">
                    {row.note}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500/60" />
                Strong (≥30)
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-gold/60 inline-block h-2 w-2 rounded-full" />
                Supportive (20–29)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500/60" />
                Average (12–19)
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-muted-foreground/40 inline-block h-2 w-2 rounded-full" />
                Sensitive (&lt;12)
              </span>
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">Bhinnashtakavarga</h2>
                <p className="text-muted-foreground text-xs">
                  Per-planet bindu contributions by house. Select a planet to see its individual
                  chart.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(data.bhinna).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlanet(p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    planet === p
                      ? "border-gold/40 bg-primary/12 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground",
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
                  className={cn("rounded-lg border p-2 text-center", binduColor(row.bindus))}
                >
                  <p className="text-muted-foreground text-[10px]">H{row.house}</p>
                  <p className="font-display text-lg sm:text-xl">{row.bindus}</p>
                  <p className="text-muted-foreground text-[10px]">{row.sign}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-[10px]">
              Bhinnashtakavarga shows how each planet individually contributes bindus to each house.
              Higher bindus mean that planet supports the house&apos;s themes more strongly.
            </p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
