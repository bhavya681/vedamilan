"use client";

import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { CalendarIcon, Orbit } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { routes } from "@/lib/constants/routes";

type GocharPlanet = {
  planet: string;
  sign: string;
  houseFromNatalLagna: number;
  nakshatra: string;
  isRetrograde: boolean;
  note: string;
};

type GocharData = {
  asOf: string;
  timezoneNote: string;
  transitAscendant: string;
  natalLagna: string;
  natalMoon: string | null;
  highlights: string[];
  planets: GocharPlanet[];
  chartNorth: unknown;
  chartSouth: unknown;
  chartEast: unknown;
};

type Conjunction = {
  planets: string[];
  sign: string;
  houseFromNatalLagna: number;
  nakshatra: string;
};

export default function AstrologyGocharPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<GocharData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGochar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split("T")[0] || "";
      const res = await fetch(`/api/gochar?date=${encodeURIComponent(dateStr)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load gochar");
        setData(null);
      } else {
        setData(json.data);
      }
    } catch {
      setError("Failed to load gochar");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void fetchGochar();
  }, [fetchGochar]);

  const conjunctions: Conjunction[] = [];
  if (data?.planets) {
    const bySignHouse = new Map<string, GocharPlanet[]>();
    for (const p of data.planets) {
      const key = `${p.sign}|${p.houseFromNatalLagna}`;
      const list = bySignHouse.get(key) || [];
      list.push(p);
      bySignHouse.set(key, list);
    }
    for (const [, planets] of bySignHouse) {
      if (planets.length > 1) {
        const first = planets[0];
        if (!first) continue;
        conjunctions.push({
          planets: planets.map((p) => p.planet),
          sign: first.sign,
          houseFromNatalLagna: first.houseFromNatalLagna,
          nakshatra: first.nakshatra,
        });
      }
    }
  }

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Live transit sky"
        title="Gochar"
        description="See where each planet moves now — or pick any date to explore transits, nakshatras, and conjunctions."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.astrologyDasha}>Dasha Journey</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="space-y-2">
            <Label>Select date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-muted-foreground h-4 w-4" />
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md border"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchGochar} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Loading..." : "Update Gochar"}
            </Button>
          </div>
        </div>
        {data ? (
          <p className="text-muted-foreground text-xs">
            Showing gochar for{" "}
            {data.asOf ? new Date(data.asOf).toLocaleString() : date.toLocaleString()} ·{" "}
            {data.timezoneNote}
          </p>
        ) : null}
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}

      {!loading && data ? (
        <div className="space-y-4">
          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl">Transit overview</h2>
              <Badge variant="outline">
                <Orbit className="mr-1 h-3 w-3" />
                {data.asOf ? new Date(data.asOf).toLocaleDateString() : date.toLocaleDateString()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Transit Ascendant
                </p>
                <p className="font-display text-lg">{data.transitAscendant}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Natal Lagna
                </p>
                <p className="font-display text-lg">{data.natalLagna}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Natal Moon
                </p>
                <p className="font-display text-lg">{data.natalMoon || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Planets
                </p>
                <p className="font-display text-lg">{data.planets.length}</p>
              </div>
            </div>
            {data.highlights.length > 0 && (
              <ul className="space-y-1">
                {data.highlights.map((h) => (
                  <li key={h} className="text-muted-foreground text-xs">
                    · {h}
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          {conjunctions.length > 0 && (
            <GlassCard className="space-y-3">
              <h2 className="font-display text-xl">Conjunctions on this day</h2>
              <p className="text-muted-foreground text-xs">
                Planets sharing the same sign and house from natal Lagna.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {conjunctions.map((c, idx) => (
                  <div key={idx} className="border-border/50 rounded-xl border p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.planets.map((p) => (
                        <Badge key={p} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {c.sign} · House {c.houseFromNatalLagna} · {c.nakshatra}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Planet positions</h2>
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Planet
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Sign
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      House (from Lagna)
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Nakshatra
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Retrograde
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p) => (
                    <tr key={p.planet} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.planet}</td>
                      <td className="py-2">{p.sign}</td>
                      <td className="py-2">H{p.houseFromNatalLagna}</td>
                      <td className="py-2 text-xs">{p.nakshatra}</td>
                      <td className="py-2">
                        {p.isRetrograde ? (
                          <Badge variant="outline" className="text-[10px]">
                            ℞
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Direct</span>
                        )}
                      </td>
                      <td className="text-muted-foreground py-2 text-xs">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : !loading && !data ? (
        <EmptyState
          title="No gochar data"
          description="Generate your kundli and ensure birth details are set."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate Kundli</Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
