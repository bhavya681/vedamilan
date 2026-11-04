"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Compass,
  Heart,
  Link2,
  Scale,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { planetSymbol } from "@/features/horoscope/components/planet-symbols";
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

function KarakaSummary({
  icon: Icon,
  label,
  row,
  accent,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  row: KarakaRow | null | undefined;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border/70 bg-card hover:border-gold/30 min-w-0 rounded-xl border p-4 text-left transition-colors sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </p>
        <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
      </div>
      {row ? (
        <>
          <p className="font-display mt-2 flex items-center gap-2 text-xl">
            <span className={cn("text-2xl leading-none", accent)} aria-hidden>
              {planetSymbol(row.planet)}
            </span>
            {row.planet}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {row.sign} · house {row.house}
            {row.nakshatra ? ` · ${row.nakshatra}` : ""}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm">Not available</p>
      )}
    </button>
  );
}

function ThemeList({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "positive" | "caution";
}) {
  const dot =
    tone === "positive" ? "bg-emerald-500" : tone === "caution" ? "bg-rose" : "bg-gold/70";
  return (
    <div className="border-border/50 bg-muted/10 rounded-xl border p-3">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KarakaHeader({ row, title }: { row: KarakaRow; title: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="border-gold/25 bg-gold/8 text-gold grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-xl">
          {planetSymbol(row.planet)}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-muted-foreground text-xs">
            {row.planet}
            {row.isRetrograde ? " (R)" : ""} in {row.sign} · house {row.house}
            {row.nakshatra ? ` · ${row.nakshatra}` : ""}
            {row.dignity ? ` · ${row.dignity}` : ""}
          </p>
        </div>
      </div>
      <Badge variant="outline">{row.abbreviation}</Badge>
    </div>
  );
}

export default function AstrologyJaiminiPage() {
  const [convention, setConvention] = useState<"sapta" | "ashta">("sapta");
  const [retrograde, setRetrograde] = useState<"direct" | "remaining">("direct");
  const [data, setData] = useState<JaiminiLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("karakas");
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

  const akRow = data?.atmakaraka.profile?.row ?? null;
  const amkRow = data?.amatyakaraka?.row ?? null;
  const dkRow = data?.darakaraka?.row ?? null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Jaimini · Chara Karakas"
        title="Jaimini Karakas"
        description="Chara Karakas ranked from exact sidereal longitudes. This is a Jaimini layer on the Parashari kundli — it clarifies motivation, career, and partnership without replacing Dashas or Shadbala."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyMarriageIntelligence}>Marriage Intelligence</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyBnn}>BNN</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      <GlassCard className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
              <Scale className="h-3.5 w-3.5" />
              Calculation convention
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data?.karakas.conventionLabel ?? "Loading convention…"} · retrograde mode{" "}
              {data?.karakas.retrogradeMode ?? retrograde}. The two conventions are never mixed.
            </p>
          </div>
          <Badge variant="outline">
            {data?.lagnaSign ? `Lagna ${data.lagnaSign}` : "D1 chart"}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1.5 text-[10px] tracking-wider uppercase">
              Karaka set
            </p>
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
                8 Karakas · Rahu
              </Button>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1.5 text-[10px] tracking-wider uppercase">
              Retrograde treatment
            </p>
            <div className="flex flex-wrap gap-2">
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
                Remaining degrees
              </Button>
            </div>
          </div>
        </div>
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
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <KarakaSummary
              icon={Sparkles}
              label="Atmakaraka"
              row={akRow}
              accent="text-gold"
              onClick={() => setTab("atma")}
            />
            <KarakaSummary
              icon={Briefcase}
              label="Amatyakaraka"
              row={amkRow}
              accent="text-sky-500"
              onClick={() => setTab("amatya")}
            />
            <KarakaSummary
              icon={Heart}
              label="Darakaraka"
              row={dkRow}
              accent="text-rose"
              onClick={() => setTab("dara")}
            />
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="karakas">Chara Karakas</TabsTrigger>
              <TabsTrigger value="atma">Atmakaraka</TabsTrigger>
              <TabsTrigger value="amatya">Career</TabsTrigger>
              <TabsTrigger value="dara">Marriage</TabsTrigger>
            </TabsList>

            <TabsContent value="karakas" className="space-y-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                {data.karakas.methodology}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.karakas.rows.map((row) => (
                  <GlassCard key={row.code} className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="border-border/60 bg-muted/25 grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-lg">
                          {planetSymbol(row.planet)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-lg leading-tight">{row.sanskrit}</p>
                          <p className="text-muted-foreground text-xs">{row.englishRole}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{row.abbreviation}</Badge>
                    </div>

                    <p className="text-sm font-medium">
                      {row.planet}
                      {row.isRetrograde ? " (R)" : ""} · {row.sign} · H{row.house}
                    </p>
                    <div className="text-muted-foreground grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <p>Degree {row.degree.formatted}</p>
                      <p>Lord {row.signLord}</p>
                      <p className="col-span-2">
                        {row.nakshatra ? `Nakshatra ${row.nakshatra}` : "Nakshatra not available"}
                        {row.dignity ? ` · ${row.dignity}` : ""}
                      </p>
                      {row.tiedWith.length ? (
                        <p className="col-span-2">Tied with {row.tiedWith.join(", ")}</p>
                      ) : null}
                    </div>
                    <p className="text-xs leading-relaxed">{row.shortMeaning}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto justify-start px-0 text-xs"
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

              {data.map.length ? (
                <GlassCard className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="border-gold/25 bg-gold/8 text-gold grid h-9 w-9 shrink-0 place-items-center rounded-lg border">
                      <Link2 className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg">Karaka links</h2>
                      <p className="text-muted-foreground text-xs">
                        How the key karakas connect by sign, lord, or house. Open a link for the
                        exact chart reason.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.map.map((edge) => {
                      const id = `${edge.fromCode}-${edge.toCode}`;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setOpenEdge(openEdge === id ? null : id)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                            openEdge === id
                              ? "border-gold/40 bg-gold/5"
                              : "border-border/60 hover:border-border",
                          )}
                        >
                          <p className="font-medium">
                            {edge.fromCode} {planetSymbol(edge.fromPlanet)} → {edge.toCode}{" "}
                            {planetSymbol(edge.toPlanet)}
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
              ) : null}
            </TabsContent>

            <TabsContent value="atma" className="space-y-4">
              {data.atmakaraka.profile ? (
                <>
                  <GlassCard className="space-y-4">
                    <KarakaHeader
                      row={data.atmakaraka.profile.row}
                      title="Atmakaraka · life direction"
                    />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      The Atmakaraka shows the soul&apos;s central hunger. Its sign and house
                      describe the field where that hunger is worked out — not a guaranteed outcome.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ThemeList title="Core themes" items={data.atmakaraka.profile.coreThemes} />
                      <ThemeList title="Growth" items={data.atmakaraka.profile.growthThemes} />
                      <ThemeList
                        title="Strengths"
                        items={data.atmakaraka.profile.strengths}
                        tone="positive"
                      />
                      <ThemeList
                        title="Challenges"
                        items={data.atmakaraka.profile.challenges}
                        tone="caution"
                      />
                    </div>
                    <p className="border-gold/20 bg-gold/[0.04] rounded-xl border p-3 text-xs leading-relaxed">
                      {data.atmakaraka.profile.jaiminiNote}
                    </p>
                  </GlassCard>

                  <GlassCard className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-lg">Karakamsha</h2>
                      <Badge variant="outline">
                        {data.atmakaraka.karakamsha.available ? "Available" : "Partial"}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      {data.atmakaraka.karakamsha.available
                        ? `Karakamsha sign: ${data.atmakaraka.karakamsha.sign}`
                        : "Karakamsha not fully available."}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.atmakaraka.karakamsha.planetsInKarakamsha.length ? (
                        data.atmakaraka.karakamsha.planetsInKarakamsha.map((planet) => (
                          <span
                            key={planet}
                            className="border-border/60 bg-muted/20 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                          >
                            <span className="text-gold" aria-hidden>
                              {planetSymbol(planet)}
                            </span>
                            {planet}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No grahas listed in Karakamsha.
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {data.atmakaraka.karakamsha.note}
                    </p>
                  </GlassCard>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Atmakaraka not available.</p>
              )}
            </TabsContent>

            <TabsContent value="amatya" className="space-y-4">
              {data.amatyakaraka ? (
                <GlassCard className="space-y-4">
                  <KarakaHeader
                    row={data.amatyakaraka.row}
                    title="Amatyakaraka · career & contribution"
                  />
                  <p className="text-xs leading-relaxed">{data.amatyakaraka.akLinkNote}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {data.amatyakaraka.jaiminiPerspective}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.amatyakaraka.careerThemes.map((theme) => (
                      <div
                        key={theme}
                        className="border-border/50 bg-muted/10 rounded-xl border p-3 text-xs leading-relaxed"
                      >
                        {theme}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ThemeList
                      title="Working environments"
                      items={data.amatyakaraka.workingEnvironments}
                    />
                    <ThemeList
                      title="Watch-outs"
                      items={data.amatyakaraka.challenges}
                      tone="caution"
                    />
                  </div>
                  <p className="border-gold/20 bg-gold/[0.04] rounded-xl border p-3 text-xs leading-relaxed">
                    {data.amatyakaraka.leadership}
                  </p>
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
                  <GlassCard className="space-y-4">
                    <KarakaHeader row={data.darakaraka.row} title="Darakaraka · partnership" />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {data.darakaraka.disclaimer}
                    </p>
                    <p className="text-sm leading-relaxed">{data.darakaraka.partnerArchetype}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="border-border/50 bg-muted/10 rounded-xl border p-3">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Communication
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed">
                          {data.darakaraka.communication}
                        </p>
                      </div>
                      <div className="border-border/50 bg-muted/10 rounded-xl border p-3">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Expectations
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed">
                          {data.darakaraka.expectations}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ThemeList
                        title="Potential strengths"
                        items={data.darakaraka.strengths}
                        tone="positive"
                      />
                      <ThemeList
                        title="Potential challenges"
                        items={data.darakaraka.challenges}
                        tone="caution"
                      />
                    </div>
                    <ThemeList
                      title="What to consciously develop"
                      items={data.darakaraka.develop}
                    />
                  </GlassCard>

                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Compass className="text-gold h-4 w-4" />
                      <h2 className="font-display text-lg">Chart evidence</h2>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">
                        7th sign {data.darakaraka.seventhHouse.seventhSign}
                      </Badge>
                      <Badge variant="outline">
                        7th lord {data.darakaraka.seventhHouse.seventhLord}
                      </Badge>
                      {data.darakaraka.seventhHouse.dkIsSeventhLord ? (
                        <Badge variant="outline">DK is 7th lord</Badge>
                      ) : null}
                      {data.darakaraka.seventhHouse.dkInSeventh ? (
                        <Badge variant="outline">DK in 7th</Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Occupants of the 7th:{" "}
                      {data.darakaraka.seventhHouse.occupants.length
                        ? data.darakaraka.seventhHouse.occupants.join(", ")
                        : "none"}
                    </p>
                    <p className="text-muted-foreground text-xs">{data.darakaraka.navamsa.note}</p>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Jaimini aspects
                      </p>
                      <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed">
                        {data.darakaraka.aspects.map((aspect) => (
                          <li key={aspect} className="flex gap-2">
                            <Star className="text-gold mt-0.5 h-3 w-3 shrink-0" />
                            {aspect}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto justify-start px-0 text-xs"
                      onClick={() => setOpenCalc(openCalc === "DK" ? null : "DK")}
                    >
                      {openCalc === "DK" ? "Hide calculation" : "Show calculation"}
                    </Button>
                    {openCalc === "DK" ? (
                      <p className="text-muted-foreground border-border/50 bg-muted/10 rounded-lg border p-2.5 text-[11px] leading-relaxed">
                        Darakaraka = {data.darakaraka.row.planet} ·{" "}
                        {data.darakaraka.row.degree.formatted} · {data.darakaraka.row.sign} · house{" "}
                        {data.darakaraka.row.house} · {data.karakas.conventionLabel}
                      </p>
                    ) : null}
                    <Button asChild variant="outline" size="sm">
                      <Link href={routes.astrologyMarriageIntelligence}>
                        Open Marriage Intelligence
                      </Link>
                    </Button>
                  </GlassCard>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Darakaraka not available.</p>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {data ? (
        <GlassCard className="border-gold/20 space-y-2">
          <p className="text-gold/85 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase">
            <BookOpen className="h-3.5 w-3.5" />
            Calculated from your birth chart
          </p>
          <p className="text-muted-foreground text-xs">
            AI is not used to assign karakas or rank degrees. For prose, ask Astrology AI Guru after
            reading the calculated table.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.aiInsights}>Astrology AI Guru</Link>
          </Button>
        </GlassCard>
      ) : null}
    </div>
  );
}
