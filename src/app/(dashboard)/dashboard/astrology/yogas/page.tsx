"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VedicExtrasBanner,
  YogaDetailList,
  DoshaDetailList,
} from "@/features/horoscope/components/yoga-dosha-details";
import { isRajaStyleYoga } from "@/application/horoscope/yoga-filters";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type YogaRow = {
  code?: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
  insight: {
    meaning: string;
    whenActivates: string;
    watchFor: string;
    lifeAreas: string[];
    activationNow: string;
    engineNote: string;
  };
};

type DoshaRow = {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  insight: {
    meaning: string;
    whenActivates: string;
    watchFor: string;
    lifeAreas: string[];
    activationNow: string;
    engineNote: string;
    statusLabel?: string;
  };
};

type Extras = {
  currentMaha?: string | null;
  currentAntar?: string | null;
  yogas: YogaRow[];
  doshas: DoshaRow[];
};

type YogaFilter = "all" | "raja" | "other";

export default function AstrologyYogasPage() {
  const [data, setData] = useState<Extras | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [yogaFilter, setYogaFilter] = useState<YogaFilter>("all");

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load yogas & doshas");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load yogas & doshas"))
      .finally(() => setLoading(false));
  }, []);

  const rankedYogas = useMemo(() => {
    const list = [...(data?.yogas || [])];
    list.sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0));
    return list;
  }, [data?.yogas]);

  const rajaCount = rankedYogas.filter((y) => isRajaStyleYoga(y)).length;
  const presentDoshas = (data?.doshas || []).filter((d) => d.present);
  const clearDoshas = (data?.doshas || []).filter((d) => !d.present);

  const filteredYogas = useMemo(() => {
    if (yogaFilter === "raja") return rankedYogas.filter((y) => isRajaStyleYoga(y));
    if (yogaFilter === "other") return rankedYogas.filter((y) => !isRajaStyleYoga(y));
    return rankedYogas;
  }, [rankedYogas, yogaFilter]);

  const leadYoga = rankedYogas[0] || null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Parashari combinations · Kundli engine"
        title="Yogas"
        description="Important combinations in your chart — what forms them, when they activate through dasha, and how to read them without fear."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyDasha}>Dasha</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.lalKitab}>Lal Kitab</Link>
            </Button>
          </div>
        }
      />

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

      {data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Yogas</p>
              <p className="font-display text-2xl sm:text-3xl">{rankedYogas.length}</p>
              <p className="text-muted-foreground text-xs">Flagged by the rule engine</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Raja-style
              </p>
              <p className="font-display text-2xl sm:text-3xl">{rajaCount}</p>
              <p className="text-muted-foreground text-xs">Kendra–trikona / classic names</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Doshas present
              </p>
              <p className="font-display text-2xl sm:text-3xl">
                {presentDoshas.length}
                <span className="text-muted-foreground text-base">
                  {" "}
                  / {(data.doshas || []).length}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                {clearDoshas.length} clear · friction, not fate
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Current dasha
              </p>
              <p className="font-display text-lg leading-snug sm:text-xl">
                {data.currentMaha || "—"}
              </p>
              <p className="text-muted-foreground text-xs">
                {data.currentAntar ? `Antar · ${data.currentAntar}` : "Open Dashas for timing"}
              </p>
            </GlassCard>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="yogas">Yogas</TabsTrigger>
              <TabsTrigger value="doshas">Doshas</TabsTrigger>
              <TabsTrigger value="guide">How to read</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <VedicExtrasBanner />
              {leadYoga ? (
                <GlassCard className="space-y-3">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Strongest yoga in this scan
                  </p>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl sm:text-3xl">{leadYoga.name}</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {leadYoga.category || "Combination"}
                        {typeof leadYoga.strength === "number"
                          ? ` · strength ${leadYoga.strength}`
                          : ""}
                      </p>
                    </div>
                    {isRajaStyleYoga(leadYoga) ? (
                      <Badge className="border-gold/40 bg-gold/15 border">Raja-style</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed">{leadYoga.insight.meaning}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {leadYoga.insight.activationNow}
                  </p>
                </GlassCard>
              ) : (
                <EmptyState
                  title="No yogas flagged"
                  description="The rule engine did not flag named yogas on this chart view. Generate or refresh Kundli if this looks empty."
                />
              )}

              {presentDoshas.length ? (
                <GlassCard className="space-y-3">
                  <h2 className="font-display text-xl">Doshas to read carefully</h2>
                  <div className="flex flex-wrap gap-2">
                    {presentDoshas.map((d) => (
                      <Badge key={d.code} variant="secondary">
                        {d.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    These are intensity themes from the engine — not punishments. Open the Doshas
                    tab for reframes and dasha context.
                  </p>
                </GlassCard>
              ) : (
                <GlassCard>
                  <p className="font-display text-lg">No doshas flagged as present</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {clearDoshas.length
                      ? `${clearDoshas.length} checked patterns are clear on this chart.`
                      : "Dosha scan returned no present flags."}
                  </p>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="yogas" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "all" as const, label: "All", count: rankedYogas.length },
                    { id: "raja" as const, label: "Raja-style", count: rajaCount },
                    {
                      id: "other" as const,
                      label: "Other",
                      count: rankedYogas.length - rajaCount,
                    },
                  ] as const
                ).map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setYogaFilter(chip.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                      yogaFilter === chip.id
                        ? "border-gold/45 bg-gold/10 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {chip.label}
                    <span className="text-muted-foreground ml-1.5 tabular-nums">{chip.count}</span>
                  </button>
                ))}
              </div>
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Yoga list</h2>
                  <p className="text-muted-foreground text-xs">
                    Sorted by engine strength. Open a row for meaning, dasha timing, and a
                    public-life parallel.
                  </p>
                </div>
                <YogaDetailList
                  items={filteredYogas}
                  empty="No yogas in this filter. Try All, or generate Kundli first."
                />
              </GlassCard>
            </TabsContent>

            <TabsContent value="doshas">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Dosha scan</h2>
                  <p className="text-muted-foreground text-xs">
                    Present flags first conceptually — still listed with clear items so you can see
                    what was checked.
                  </p>
                </div>
                <DoshaDetailList items={[...presentDoshas, ...clearDoshas]} />
              </GlassCard>
            </TabsContent>

            <TabsContent value="guide">
              <GlassCard className="space-y-4 text-sm leading-relaxed">
                <h2 className="font-display text-xl">How to read this page</h2>
                <p>
                  Yogas are named combinations from your stored Kundli. Strength is an engine score
                  for how clearly the pattern formed — not a percentage of life success.
                </p>
                <p>
                  <span className="font-medium">Raja-style</span> covers classic names such as Raja
                  Yoga, Gajakesari, Budhaditya, and Dharma-Karma Adhipati. Other yogas are still
                  meaningful; they are simply not that family.
                </p>
                <p>
                  Results usually show more during the dasha of the planets that form the yoga. Open
                  Dashas to see whether those lords are running now.
                </p>
                <p>
                  Doshas describe friction (Manglik, Kaal Sarp, and similar engine flags). They are
                  not curses. Pair this page with Lal Kitab for everyday upayas when a theme needs
                  care.
                </p>
                <p className="text-muted-foreground text-xs">
                  Public-life parallels are teaching devices. They are not verified celebrity charts
                  or predictions.
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
