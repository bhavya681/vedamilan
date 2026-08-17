"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type DegreeParts = {
  formatted: string;
  rankingDegree: number;
  degreeInSign: number;
};

type KarakaRow = {
  code: string;
  sanskrit: string;
  abbreviation: string;
  englishRole: string;
  shortMeaning: string;
  planet: string;
  symbol: string;
  sign: string;
  house: number;
  longitude: number;
  degree: DegreeParts;
  isRetrograde: boolean;
  dignity: string | null;
  nakshatra: string | null;
  signLord: string;
  tiedWith: string[];
};

type Profile = {
  row: KarakaRow;
  coreThemes: string[];
  growthThemes: string[];
  strengths: string[];
  challenges: string[];
  jaiminiNote: string;
  calculation: string[];
};

type JaiminiLab = {
  karakas: {
    convention: string;
    conventionLabel: string;
    retrogradeMode: string;
    methodology: string;
    rows: KarakaRow[];
    notes: string[];
  };
  profiles: Profile[];
  atmakaraka: {
    profile: Profile | null;
    karakamsha: {
      available: boolean;
      sign: string | null;
      planetsInKarakamsha: string[];
      note: string;
    };
  };
  amatyakaraka: {
    row: KarakaRow;
    akLinkNote: string;
    careerThemes: string[];
    workingEnvironments: string[];
    leadership: string;
    challenges: string[];
    jaiminiPerspective: string;
  } | null;
  darakaraka: {
    row: KarakaRow;
    partnerArchetype: string;
    communication: string;
    expectations: string;
    strengths: string[];
    challenges: string[];
    develop: string[];
    seventhHouse: {
      seventhSign: string;
      seventhLord: string;
      dkIsSeventhLord: boolean;
      dkInSeventh: boolean;
      occupants: string[];
    };
    navamsa: { available: boolean; dkSign: string | null; dkHouse: number | null; note: string };
    aspects: string[];
    disclaimer: string;
  } | null;
  map: Array<{
    fromCode: string;
    toCode: string;
    fromPlanet: string;
    toPlanet: string;
    note: string;
    link: { kind: string };
  }>;
  lagnaSign: string;
};

export default function AstrologyJaiminiPage() {
  const [convention, setConvention] = useState<"sapta" | "ashta">("sapta");
  const [retrograde, setRetrograde] = useState<"direct" | "remaining">("direct");
  const [data, setData] = useState<JaiminiLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCalc, setOpenCalc] = useState<string | null>(null);
  const [openEdge, setOpenEdge] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    void fetch(`/api/astrology/jaimini?convention=${convention}&retrograde=${retrograde}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Jaimini karakas");
          setData(null);
          return;
        }
        setError(null);
        setData(json.data);
      })
      .catch(() => setError("Unable to load Jaimini karakas"))
      .finally(() => setLoading(false));
  }, [convention, retrograde]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Advanced Jaimini analysis"
        title="Jaimini Karakas"
        description="Chara Karakas ranked from exact sidereal longitudes. This is a Jaimini layer on top of the existing Parashari kundli — it does not replace Dashas, Shadbala, or Ashtakavarga."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyMarriageIntelligence}>Marriage Intelligence</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      <GlassCard className="space-y-3 p-4 sm:p-5">
        <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Convention</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={convention === "sapta" ? "secondary" : "outline"}
            onClick={() => setConvention("sapta")}
          >
            7 Karakas
          </Button>
          <Button
            size="sm"
            variant={convention === "ashta" ? "secondary" : "outline"}
            onClick={() => setConvention("ashta")}
          >
            8 Karakas (incl. Rahu)
          </Button>
          <Button
            size="sm"
            variant={retrograde === "direct" ? "secondary" : "outline"}
            onClick={() => setRetrograde("direct")}
          >
            Direct degrees
          </Button>
          <Button
            size="sm"
            variant={retrograde === "remaining" ? "secondary" : "outline"}
            onClick={() => setRetrograde("remaining")}
          >
            Remaining (Rx)
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          {data?.karakas.conventionLabel ?? "Loading convention…"} · retrograde mode{" "}
          {data?.karakas.retrogradeMode ?? retrograde}. The two systems are never mixed.
        </p>
      </GlassCard>

      {loading ? <PanelSkeleton lines={8} /> : null}
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

      {data && !loading ? (
        <Tabs defaultValue="karakas">
          <TabsList>
            <TabsTrigger value="karakas">Chara Karakas</TabsTrigger>
            <TabsTrigger value="atma">Atmakaraka</TabsTrigger>
            <TabsTrigger value="amatya">Amatyakaraka</TabsTrigger>
            <TabsTrigger value="dara">Darakaraka</TabsTrigger>
            <TabsTrigger value="map">Relationship map</TabsTrigger>
          </TabsList>

          <TabsContent value="karakas" className="space-y-4">
            <p className="text-muted-foreground text-xs">{data.karakas.methodology}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.karakas.rows.map((row) => (
                <GlassCard key={row.code} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg">
                        {row.symbol} {row.sanskrit}
                      </p>
                      <p className="text-muted-foreground text-xs">{row.englishRole}</p>
                    </div>
                    <Badge variant="outline">{row.abbreviation}</Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {row.planet}
                    {row.isRetrograde ? " (R)" : ""} · {row.sign} · H{row.house}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {row.degree.formatted}
                    {row.dignity ? ` · ${row.dignity}` : ""}
                  </p>
                  <p className="text-xs leading-relaxed">{row.shortMeaning}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 text-xs"
                    onClick={() => setOpenCalc(openCalc === row.code ? null : row.code)}
                  >
                    {openCalc === row.code ? "Hide calculation" : "Show calculation"}
                  </Button>
                  {openCalc === row.code ? (
                    <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-[11px]">
                      {data.profiles
                        .find((p) => p.row.code === row.code)
                        ?.calculation.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                    </ul>
                  ) : null}
                </GlassCard>
              ))}
            </div>
            {data.karakas.notes.length ? (
              <p className="text-muted-foreground text-[11px]">{data.karakas.notes.join(" ")}</p>
            ) : null}
          </TabsContent>

          <TabsContent value="atma" className="space-y-4">
            {data.atmakaraka.profile ? (
              <>
                <GlassCard className="space-y-3 p-4 sm:p-5">
                  <h2 className="font-display text-xl">Atmakaraka — life direction</h2>
                  <p className="text-sm">
                    {data.atmakaraka.profile.row.planet} in {data.atmakaraka.profile.row.sign},
                    house {data.atmakaraka.profile.row.house}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Core themes</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.atmakaraka.profile.coreThemes.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Growth</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.atmakaraka.profile.growthThemes.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Strengths</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.atmakaraka.profile.strengths.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Challenges</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.atmakaraka.profile.challenges.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed">{data.atmakaraka.profile.jaiminiNote}</p>
                </GlassCard>
                <GlassCard className="space-y-2 p-4 sm:p-5">
                  <h2 className="font-display text-lg">Karakamsha</h2>
                  <p className="text-sm">
                    {data.atmakaraka.karakamsha.available
                      ? `Karakamsha sign: ${data.atmakaraka.karakamsha.sign}`
                      : "Karakamsha not fully available."}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Planets in Karakamsha:{" "}
                    {data.atmakaraka.karakamsha.planetsInKarakamsha.join(", ") || "none listed"}
                  </p>
                  <p className="text-muted-foreground text-xs">{data.atmakaraka.karakamsha.note}</p>
                </GlassCard>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Atmakaraka not available.</p>
            )}
          </TabsContent>

          <TabsContent value="amatya" className="space-y-4">
            {data.amatyakaraka ? (
              <GlassCard className="space-y-3 p-4 sm:p-5">
                <h2 className="font-display text-xl">Amatyakaraka — career & contribution</h2>
                <p className="text-sm">
                  {data.amatyakaraka.row.planet} in {data.amatyakaraka.row.sign}, house{" "}
                  {data.amatyakaraka.row.house}
                </p>
                <p className="text-xs">{data.amatyakaraka.akLinkNote}</p>
                <p className="text-muted-foreground text-xs">
                  {data.amatyakaraka.jaiminiPerspective}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.amatyakaraka.careerThemes.map((t) => (
                    <p key={t} className="text-xs leading-relaxed">
                      {t}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-medium">Working environments</p>
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  {data.amatyakaraka.workingEnvironments.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="text-xs">{data.amatyakaraka.leadership}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.astrologyDivisionalCharts}>Open D10 / vargas</Link>
                </Button>
              </GlassCard>
            ) : (
              <p className="text-muted-foreground text-sm">Amatyakaraka not available.</p>
            )}
          </TabsContent>

          <TabsContent value="dara" className="space-y-4">
            {data.darakaraka ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <GlassCard className="space-y-3 p-4 sm:p-5">
                  <h2 className="font-display text-xl">Darakaraka & partnership</h2>
                  <p className="text-xs leading-relaxed">{data.darakaraka.disclaimer}</p>
                  <p className="text-sm">{data.darakaraka.partnerArchetype}</p>
                  <p className="text-xs">{data.darakaraka.communication}</p>
                  <p className="text-xs">{data.darakaraka.expectations}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">
                        Potential strengths
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.darakaraka.strengths.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">
                        Potential challenges
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                        {data.darakaraka.challenges.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[10px] uppercase">
                    What to consciously develop
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {data.darakaraka.develop.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </GlassCard>
                <GlassCard className="space-y-3 p-4 sm:p-5">
                  <h2 className="font-display text-lg">Chart evidence</h2>
                  <p className="text-xs">
                    7th sign {data.darakaraka.seventhHouse.seventhSign} · lord{" "}
                    {data.darakaraka.seventhHouse.seventhLord}
                    {data.darakaraka.seventhHouse.dkIsSeventhLord ? " · DK is 7th lord" : ""}
                    {data.darakaraka.seventhHouse.dkInSeventh ? " · DK in 7th" : ""}
                  </p>
                  <p className="text-xs">{data.darakaraka.navamsa.note}</p>
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {data.darakaraka.aspects.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 text-xs"
                    onClick={() => setOpenCalc(openCalc === "DK" ? null : "DK")}
                  >
                    {openCalc === "DK" ? "Hide calculation" : "Show calculation"}
                  </Button>
                  {openCalc === "DK" ? (
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Darakaraka = {data.darakaraka.row.planet} ·{" "}
                      {data.darakaraka.row.degree.formatted} · {data.darakaraka.row.sign} · house{" "}
                      {data.darakaraka.row.house} · {data.karakas.conventionLabel}
                    </p>
                  ) : null}
                </GlassCard>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Darakaraka not available.</p>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <GlassCard className="space-y-4 p-4 sm:p-5">
              <h2 className="font-display text-xl">Karakas relationship map</h2>
              <div className="flex flex-col items-stretch gap-2 sm:max-w-md">
                {data.map.map((edge) => {
                  const id = `${edge.fromCode}-${edge.toCode}`;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setOpenEdge(openEdge === id ? null : id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                        openEdge === id ? "border-gold/40 bg-primary/8" : "border-border/60",
                      )}
                    >
                      <p className="font-medium">
                        {edge.fromCode} ({edge.fromPlanet}) → {edge.toCode} ({edge.toPlanet})
                      </p>
                      <p className="text-muted-foreground text-[11px]">{edge.link.kind}</p>
                      {openEdge === id ? (
                        <p className="mt-2 text-xs leading-relaxed">{edge.note}</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      ) : null}

      {data ? (
        <GlassCard className="border-gold/20 space-y-2 p-4 sm:p-5">
          <p className="text-gold/85 text-[11px] font-medium tracking-[0.16em] uppercase">
            Calculated from your birth chart
          </p>
          <p className="text-muted-foreground text-xs">
            AI is not used to assign karakas. For a prose explanation, ask Astrology AI Guru after
            reading the table.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.aiInsights}>Astrology AI Guru</Link>
          </Button>
        </GlassCard>
      ) : null}
    </div>
  );
}
