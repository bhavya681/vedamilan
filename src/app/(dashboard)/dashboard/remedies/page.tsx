"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LalKitabPlacement,
  LalKitabRating,
  LalKitabRemedyCard,
  LalKitabSutraHit,
} from "@/application/horoscope/lal-kitab";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Report = {
  lagnaSign: string | null;
  placements: LalKitabPlacement[];
  sutras: LalKitabSutraHit[];
  remedies: LalKitabRemedyCard[];
  summary: string;
  methodology: string;
  disclaimer: string;
};

const GRAHA_ORDER = [
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

const HOUSE_THEME: Record<number, string> = {
  1: "Self, vitality, image",
  2: "Speech, family, resources",
  3: "Courage, siblings, effort",
  4: "Home, peace, property",
  5: "Intelligence, children, counsel",
  6: "Service, debt, discipline",
  7: "Partnership, marriage, dealings",
  8: "Longevity, change, hidden effort",
  9: "Dharma, fortune, teachers",
  10: "Karma, career, public duty",
  11: "Gains, networks, ambitions",
  12: "Expenditure, distant, withdrawal",
};

const RATING_STYLE: Record<LalKitabRating, string> = {
  pakka: "border-gold/40 bg-gold/10 text-foreground",
  exalted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  favorable: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  neutral: "border-border/60 bg-muted/40 text-muted-foreground",
  challenging: "border-rose/40 bg-rose/10 text-foreground",
};

const RATING_LABEL: Record<LalKitabRating, string> = {
  pakka: "Pakka ghar",
  exalted: "Strong house",
  favorable: "Favourable",
  neutral: "Mixed",
  challenging: "Needs care",
};

const SEVERITY_STYLE: Record<string, string> = {
  supportive: "border-emerald-500/35 bg-emerald-500/10",
  caution: "border-rose/40 bg-rose/10",
  info: "border-border/60 bg-muted/40",
};

function orderedPlacements(list: LalKitabPlacement[]) {
  const rank: Record<string, number> = Object.fromEntries(GRAHA_ORDER.map((name, i) => [name, i]));
  return [...list].sort((a, b) => (rank[a.planet] ?? 99) - (rank[b.planet] ?? 99));
}

function PlacementCard({
  pl,
  open,
  onToggle,
}: {
  pl: LalKitabPlacement;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        "border-border/50 overflow-hidden rounded-2xl border transition-colors",
        open && "border-gold/35 from-gold/5 bg-gradient-to-br to-transparent",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/30 w-full px-3.5 py-3.5 text-left sm:px-4"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg leading-snug">
              {pl.planet}
              <span className="text-muted-foreground font-sans text-sm font-medium">
                {" "}
                · House {pl.house}
              </span>
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {pl.sign} · {HOUSE_THEME[pl.house] || `House ${pl.house}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className={cn("border text-[10px]", RATING_STYLE[pl.rating])}>
              {RATING_LABEL[pl.rating]}
            </Badge>
            <ChevronDown
              className={cn(
                "text-muted-foreground h-4 w-4 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </div>
        </div>
        {!open ? (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
            {pl.prediction}
          </p>
        ) : null}
      </button>
      {open ? (
        <div className="space-y-3 px-3.5 pb-4 sm:px-4">
          <p className="text-sm leading-relaxed">{pl.prediction}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{pl.sutraNote}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-border/40 bg-muted/20 rounded-xl border p-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Everyday upaya
              </p>
              <p className="mt-1 text-sm leading-relaxed">{pl.remedy}</p>
            </div>
            <div className="border-border/40 bg-muted/20 rounded-xl border p-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Avoid
              </p>
              <p className="mt-1 text-sm leading-relaxed">{pl.avoid}</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function RemediesPage() {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/lal-kitab")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json?.error?.message || "Generate your kundli to open Lal Kitab analysis.");
          return;
        }
        const report = json.data as Report;
        setData(report);
        const firstCare = orderedPlacements(report.placements || []).find(
          (p) => p.rating === "challenging",
        );
        if (firstCare) setOpenKey(`${firstCare.planet}-${firstCare.house}`);
      })
      .catch(() => setError("Failed to load Lal Kitab analysis"))
      .finally(() => setLoading(false));
  }, []);

  const placements = useMemo(() => orderedPlacements(data?.placements || []), [data?.placements]);
  const pakka = placements.filter((p) => p.rating === "pakka" || p.rating === "exalted");
  const challenging = placements.filter((p) => p.rating === "challenging");
  const cautionSutras = (data?.sutras || []).filter((s) => s.severity === "caution");
  const supportSutras = (data?.sutras || []).filter((s) => s.severity === "supportive");

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="House-based · everyday upayas"
        title="Lal Kitab"
        description="Planet×house scan in Lal Kitab style — pakka ghar, combination sutras, and simple conduct remedies from your stored Kundli."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyYogas}>Yogas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
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
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Lagna</p>
              <p className="font-display text-2xl sm:text-3xl">{data.lagnaSign || "—"}</p>
              <p className="text-muted-foreground text-xs">Reference for house count</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Pakka / strong
              </p>
              <p className="font-display text-2xl sm:text-3xl">{pakka.length}</p>
              <p className="text-muted-foreground text-xs">Own-house or exalted-style seats</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Needs care
              </p>
              <p className="font-display text-2xl sm:text-3xl">{challenging.length}</p>
              <p className="text-muted-foreground text-xs">Challenging houses in this scan</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Priority upayas
              </p>
              <p className="font-display text-2xl sm:text-3xl">{data.remedies.length}</p>
              <p className="text-muted-foreground text-xs">
                {cautionSutras.length} caution sutra{cautionSutras.length === 1 ? "" : "s"}
              </p>
            </GlassCard>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="houses">Houses</TabsTrigger>
              <TabsTrigger value="sutras">Sutras</TabsTrigger>
              <TabsTrigger value="upayas">Upayas</TabsTrigger>
              <TabsTrigger value="guide">How to read</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <section className="border-border/50 from-muted/35 relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-4 sm:p-5">
                <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase">
                  <BookOpen className="h-3.5 w-3.5" />
                  Lal Kitab house scan
                </p>
                <p className="font-display mt-2 text-xl leading-snug sm:text-2xl">{data.summary}</p>
                <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
                  {data.methodology}
                </p>
              </section>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(RATING_LABEL) as LalKitabRating[]).map((key) => (
                  <Badge key={key} className={cn("border text-[10px]", RATING_STYLE[key])}>
                    {RATING_LABEL[key]}
                    <span className="text-muted-foreground ml-1.5 tabular-nums">
                      {placements.filter((p) => p.rating === key).length}
                    </span>
                  </Badge>
                ))}
              </div>

              {challenging.length ? (
                <GlassCard className="space-y-3">
                  <h2 className="font-display text-xl">Start here · needs care</h2>
                  <p className="text-muted-foreground text-xs">
                    These houses are the usual Lal Kitab priority. Open Houses for every graha.
                  </p>
                  <div className="space-y-2.5">
                    {challenging.map((pl) => {
                      const key = `${pl.planet}-${pl.house}`;
                      return (
                        <PlacementCard
                          key={key}
                          pl={pl}
                          open={openKey === key}
                          onToggle={() => setOpenKey(openKey === key ? null : key)}
                        />
                      );
                    })}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard>
                  <p className="font-display text-lg">No challenging houses flagged</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Review Houses for pakka ghar and supportive placements.
                  </p>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="houses" className="space-y-4">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Graha × house</h2>
                  <p className="text-muted-foreground text-xs">
                    Classical nine grahas. Tap a row for prediction, upaya, and what to avoid.
                  </p>
                </div>
                <div className="table-scroll -mx-4 sm:mx-0">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b">
                        {["Graha", "House", "Sign", "Rating", "Theme"].map((h) => (
                          <th
                            key={h}
                            className="text-muted-foreground pr-3 pb-2 text-left text-[10px] font-medium tracking-wider uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {placements.map((pl) => {
                        const key = `${pl.planet}-${pl.house}`;
                        return (
                          <tr
                            key={key}
                            className={cn(
                              "cursor-pointer border-b last:border-0",
                              openKey === key ? "bg-gold/10" : "hover:bg-muted/40",
                            )}
                            onClick={() => setOpenKey(openKey === key ? null : key)}
                          >
                            <td className="py-2.5 pr-3 font-medium">{pl.planet}</td>
                            <td className="py-2.5 pr-3 tabular-nums">{pl.house}</td>
                            <td className="py-2.5 pr-3">{pl.sign}</td>
                            <td className="py-2.5 pr-3">
                              <Badge className={cn("border text-[10px]", RATING_STYLE[pl.rating])}>
                                {RATING_LABEL[pl.rating]}
                              </Badge>
                            </td>
                            <td className="text-muted-foreground py-2.5 pr-3 text-xs">
                              {HOUSE_THEME[pl.house]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {placements.map((pl) => {
                const key = `${pl.planet}-${pl.house}`;
                if (openKey !== key) return null;
                return <PlacementCard key={key} pl={pl} open onToggle={() => setOpenKey(null)} />;
              })}
            </TabsContent>

            <TabsContent value="sutras" className="space-y-3">
              {data.sutras.length === 0 ? (
                <EmptyState
                  title="No combination sutras flagged"
                  description="No major Lal Kitab combination patterns matched this chart view."
                />
              ) : (
                <>
                  {cautionSutras.length ? (
                    <p className="text-muted-foreground text-xs">
                      {cautionSutras.length} caution · {supportSutras.length} supportive ·{" "}
                      {data.sutras.length} total
                    </p>
                  ) : null}
                  {data.sutras.map((s) => (
                    <GlassCard key={s.code} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("border capitalize", SEVERITY_STYLE[s.severity])}>
                          {s.severity}
                        </Badge>
                        {s.house ? <Badge variant="outline">House {s.house}</Badge> : null}
                        {s.planets.map((p) => (
                          <Badge key={p} variant="outline">
                            {p}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="font-display text-xl">{s.title}</h2>
                      <p className="text-sm leading-relaxed">{s.description}</p>
                      <div className="border-border/40 bg-muted/20 rounded-xl border p-3">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Upaya
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{s.remedy}</p>
                      </div>
                    </GlassCard>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="upayas" className="space-y-3">
              {data.remedies.length === 0 ? (
                <EmptyState
                  title="No priority upayas"
                  description="No challenging placements or caution sutras required a priority remedy card. Review Houses for supportive practices."
                />
              ) : (
                data.remedies.map((theme) => (
                  <GlassCard key={theme.id} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{theme.source}</Badge>
                      <Badge variant="outline">Not medical advice</Badge>
                    </div>
                    <h2 className="font-display text-xl">{theme.title}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Planetary factor
                        </p>
                        <p className="mt-1 text-sm font-medium">{theme.planetaryFactor}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Observed theme
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{theme.observedTheme}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Possible remedy
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{theme.possibleRemedy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          Reason
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{theme.reason}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Duration / practice · {theme.durationPractice}
                    </p>
                  </GlassCard>
                ))
              )}
            </TabsContent>

            <TabsContent value="guide">
              <GlassCard className="space-y-4 text-sm leading-relaxed">
                <h2 className="font-display text-xl">How to read Lal Kitab here</h2>
                <p>
                  This is a house-based scan from your stored Kundli.{" "}
                  <span className="font-medium">Pakka ghar</span> means the planet sits in a house
                  classically treated as its own. <span className="font-medium">Needs care</span>{" "}
                  means the house is traditionally sensitive for that graha — not a verdict.
                </p>
                <p>
                  Sutras are combination patterns (two planets, or a planet in a telling house).
                  Caution sutras are listed first in spirit; they still need the whole chart and
                  dasha.
                </p>
                <p>
                  Upayas are everyday conduct — charity, speech, routine — not medical, legal, or
                  financial advice. Pair this page with Yogas and Dashas before acting on a theme.
                </p>
                <p className="text-muted-foreground text-xs">{data.disclaimer}</p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
