"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHoroscope } from "@/hooks/use-horoscope";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import {
  getNakshatraDetails,
  nakshatraNadi,
  padaNavamsa,
  padaPurushartha,
  resolveNakshatraName,
  vimshottariLordOf,
  vimshottariYearsOf,
} from "@/application/horoscope/nakshatra-catalog";

const CLASSICAL_ORDER = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

type PlanetRow = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  nakshatraPada?: number;
  dignity?: string | null;
  isRetrograde?: boolean;
};

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

export default function AstrologyNakshatraPage() {
  const { data, error, loading } = useHoroscope();
  const planets = useMemo(
    () => (data?.horoscope?.planets || []) as PlanetRow[],
    [data?.horoscope?.planets],
  );
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Moon");

  const ordered = useMemo(() => {
    const byName = new Map(planets.map((p) => [p.planet, p]));
    const classical = CLASSICAL_ORDER.map((name) => byName.get(name)).filter((p): p is PlanetRow =>
      Boolean(p),
    );
    const rest = planets.filter(
      (p) => !CLASSICAL_ORDER.includes(p.planet as (typeof CLASSICAL_ORDER)[number]),
    );
    return [...classical, ...rest];
  }, [planets]);

  const moon = planets.find((p) => p.planet === "Moon") || null;
  const selected = ordered.find((p) => p.planet === selectedPlanet) || moon || ordered[0] || null;

  const janmaName = resolveNakshatraName(moon?.nakshatra);
  const janma = getNakshatraDetails(janmaName);
  const lagnaName = data?.horoscope?.lagnaNakshatra
    ? resolveNakshatraName(data.horoscope.lagnaNakshatra)
    : null;
  const lagnaDetails = lagnaName ? getNakshatraDetails(lagnaName) : null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Janma Nakshatra · Vimshottari"
        title="Nakshatra"
        description="Moon’s birth star leads the reading — pada, deity, gana, yoni, nadi, and Vimshottari lord — then every graha in the chart."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyDasha}>Dasha</Link>
            </Button>
          </div>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={8} /> : null}

      {!loading && planets.length === 0 ? (
        <EmptyState
          title="No nakshatra data"
          description="Generate kundli to see Janma Nakshatra, padas, and planet-wise birth stars."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && moon ? (
        <div className="space-y-5">
          <GlassCard className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Janma Nakshatra · Moon
                </p>
                <h2 className="font-display mt-1 text-3xl sm:text-4xl">{janmaName}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {moon.sign} · House {moon.house} · Pada {moon.nakshatraPada ?? "—"} (
                  {padaPurushartha(moon.nakshatraPada)}) · Navamsa{" "}
                  {padaNavamsa(janmaName, moon.nakshatraPada)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Vimshottari {vimshottariLordOf(janmaName)}</Badge>
                <Badge variant="outline">{vimshottariYearsOf(janmaName)} years</Badge>
                <Badge variant="outline">{nakshatraNadi(janmaName)} nadi</Badge>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{janma.effect}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Meta label="Deity" value={janma.deity} />
              <Meta label="Symbol" value={janma.symbol} />
              <Meta label="Gana" value={janma.gana} />
              <Meta label="Yoni" value={janma.yoni} />
              <Meta label="Element" value={janma.element} />
              <Meta label="Motivation" value={janma.motivation} />
            </div>
            <div className="flex flex-wrap gap-1">
              {janma.qualities.map((q) => (
                <Badge key={q} variant="secondary" className="text-[10px]">
                  {q}
                </Badge>
              ))}
            </div>
          </GlassCard>

          {lagnaName && lagnaDetails ? (
            <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Lagna Nakshatra
                </p>
                <p className="font-display text-xl">{lagnaName}</p>
                <p className="text-muted-foreground text-xs">
                  Pada {data?.horoscope?.lagnaNakshatraPada ?? "—"} · Deity {lagnaDetails.deity} ·
                  Lord {vimshottariLordOf(lagnaName)}
                </p>
              </div>
              <Badge variant="outline">{lagnaDetails.gana} gana</Badge>
            </GlassCard>
          ) : null}

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Planet table</TabsTrigger>
              <TabsTrigger value="detail">Star detail</TabsTrigger>
              <TabsTrigger value="guide">How to read</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Graha · Nakshatra · Pada</h2>
                  <p className="text-muted-foreground text-xs">
                    Classical nine grahas first. Select a row for deity, nadi, and pada navamsa.
                  </p>
                </div>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b">
                        {["Graha", "Nakshatra", "Pada", "Vimshottari", "Sign", "House", "Nadi"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-muted-foreground pr-3 pb-2 text-left text-[10px] font-medium tracking-wider uppercase"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {ordered.map((p) => {
                        const name = resolveNakshatraName(p.nakshatra);
                        const active = selected?.planet === p.planet;
                        return (
                          <tr
                            key={p.planet}
                            className={cn(
                              "cursor-pointer border-b last:border-0",
                              active ? "bg-gold/10" : "hover:bg-muted/40",
                            )}
                            onClick={() => setSelectedPlanet(p.planet)}
                          >
                            <td className="py-2.5 pr-3 font-medium">
                              {p.planet}
                              {p.planet === "Moon" ? (
                                <span className="text-muted-foreground ml-1 text-[10px]">
                                  Janma
                                </span>
                              ) : null}
                            </td>
                            <td className="py-2.5 pr-3">{name}</td>
                            <td className="py-2.5 pr-3">{p.nakshatraPada ?? "—"}</td>
                            <td className="py-2.5 pr-3">{vimshottariLordOf(name)}</td>
                            <td className="py-2.5 pr-3">{p.sign}</td>
                            <td className="py-2.5 pr-3">{p.house}</td>
                            <td className="py-2.5 pr-3">{nakshatraNadi(name)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="detail">
              {selected ? (
                <NakshatraDetailCard
                  planet={selected}
                  onPrev={() => {
                    const i = ordered.findIndex((p) => p.planet === selected.planet);
                    const next = ordered[i <= 0 ? ordered.length - 1 : i - 1];
                    if (next) setSelectedPlanet(next.planet);
                  }}
                  onNext={() => {
                    const i = ordered.findIndex((p) => p.planet === selected.planet);
                    const next = ordered[(i + 1) % ordered.length];
                    if (next) setSelectedPlanet(next.planet);
                  }}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="guide">
              <GlassCard className="space-y-3 text-sm leading-relaxed">
                <h2 className="font-display text-xl">How this is read</h2>
                <p>
                  Janma Nakshatra is the Moon’s star at birth. It sets the Vimshottari dasha
                  sequence and is the star used in guna milan. Lagna Nakshatra describes the rising
                  point, not the birth star.
                </p>
                <p>
                  Each nakshatra spans 13°20′ and four padas of 3°20′. Pada maps to a Navamsa sign.
                  Vimshottari lord follows the classical
                  Ketu–Venus–Sun–Moon–Mars–Rahu–Jupiter–Saturn–Mercury cycle from Ashwini.
                </p>
                <p>
                  Gana, yoni, and nadi are Ashta Koota attributes used in match-making. They
                  describe temperament, vitality pairing, and physiological compatibility — they do
                  not replace the full chart.
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

function NakshatraDetailCard({
  planet,
  onPrev,
  onNext,
}: {
  planet: PlanetRow;
  onPrev: () => void;
  onNext: () => void;
}) {
  const name = resolveNakshatraName(planet.nakshatra);
  const details = getNakshatraDetails(name);
  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {planet.planet}
            {planet.isRetrograde ? " · Retrograde" : ""}
          </p>
          <h2 className="font-display text-2xl">{name}</h2>
          <p className="text-muted-foreground text-xs">
            {planet.sign} · House {planet.house} · Pada {planet.nakshatraPada ?? "—"} · Navamsa{" "}
            {padaNavamsa(name, planet.nakshatraPada)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="Deity" value={details.deity} />
        <Meta
          label="Vimshottari lord"
          value={`${vimshottariLordOf(name)} · ${vimshottariYearsOf(name)}y`}
        />
        <Meta label="Gana" value={details.gana} />
        <Meta label="Yoni" value={details.yoni} />
        <Meta label="Nadi" value={nakshatraNadi(name)} />
        <Meta label="Element" value={details.element} />
        <Meta label="Motivation" value={details.motivation} />
        <Meta label="Pada theme" value={padaPurushartha(planet.nakshatraPada)} />
      </div>
      <p className="text-sm leading-relaxed">{details.effect}</p>
      <div className="flex flex-wrap gap-1">
        {details.qualities.map((q) => (
          <Badge key={q} variant="secondary" className="text-[10px]">
            {q}
          </Badge>
        ))}
      </div>
    </GlassCard>
  );
}
