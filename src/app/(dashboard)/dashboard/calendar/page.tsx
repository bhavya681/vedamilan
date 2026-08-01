"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Briefcase,
  CalendarRange,
  GraduationCap,
  Heart,
  Home,
  Plane,
  RefreshCw,
  Sparkles,
  Wallet,
  Activity,
  Flower2,
  Orbit,
  MapPin,
  Hourglass,
  UserRound,
  History,
  CircleDot,
  Sparkle,
  LayoutList,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LifeEventCategory,
  LifeEventItem,
  LifeEventPhase,
  DeshKaalPatraContext,
} from "@/application/rules/life-events-calendar";
import {
  SpouseTendencyPanel,
  type SpouseTendenciesView,
} from "@/features/compatibility/spouse-tendency-panel";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const CATEGORY_ICONS: Record<LifeEventCategory, typeof Heart> = {
  marriage: Heart,
  career: Briefcase,
  job: Briefcase,
  education: GraduationCap,
  wealth: Wallet,
  property: Home,
  travel: Plane,
  health: Activity,
  spiritual: Flower2,
};

const CATEGORY_LABELS: Record<LifeEventCategory | "all", string> = {
  all: "All",
  marriage: "Marriage",
  career: "Career",
  job: "Job",
  education: "Education",
  wealth: "Wealth",
  property: "Property",
  travel: "Travel",
  health: "Health",
  spiritual: "Spiritual",
};

type TimeTab = LifeEventPhase | "all";

const TAB_ORDER: TimeTab[] = ["all", "present", "past", "future"];

const TAB_META: Record<TimeTab, { label: string; blurb: string; Icon: typeof History }> = {
  all: {
    label: "All",
    blurb: "Major life chapters across past, current, and future — one theme per Antardasha.",
    Icon: LayoutList,
  },
  present: {
    label: "Current",
    blurb: "The primary theme of your active Antardasha, confirmed by live gochar where possible.",
    Icon: CircleDot,
  },
  past: {
    label: "Past",
    blurb: "Closed major chapters — scored with dasha and the sky at that period.",
    Icon: History,
  },
  future: {
    label: "Future",
    blurb: "Upcoming multi-month chapters worth planning around — not everyday noise.",
    Icon: Sparkle,
  },
};

const LIKELIHOOD_GUIDE = [
  {
    range: "80–100%",
    tone: "border-gold/40 bg-gold/12 text-foreground",
    title: "Strong major period",
    detail: "Dasha lords and gochar both favour this life chapter.",
  },
  {
    range: "70–79%",
    tone: "border-primary/35 bg-primary/10 text-foreground",
    title: "Clear major period",
    detail: "Strong Antardasha theme; transit adds partial confirmation.",
  },
] as const;

/** Category chips — milestones first; soft themes only appear when they clear the major bar */
const CATEGORY_CHIP_ORDER: Array<LifeEventCategory | "all"> = [
  "all",
  "marriage",
  "career",
  "job",
  "education",
  "wealth",
  "property",
  "travel",
  "health",
  "spiritual",
];

function likelihoodPct(score: number) {
  return Math.max(70, Math.min(98, Math.round(score)));
}

function likelihoodTone(pct: number) {
  if (pct >= 80) return "border-gold/45 bg-gold/15 text-foreground";
  return "border-primary/35 bg-primary/10 text-foreground";
}

function LikelihoodBadge({ score }: { score: number }) {
  const pct = likelihoodPct(score);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-0.5 rounded-full border px-2 py-1 tabular-nums sm:px-2.5",
        likelihoodTone(pct),
      )}
      title="Directional likelihood from dasha + gochar — not a guarantee"
    >
      <span className="font-display text-[13px] leading-none font-semibold sm:text-base">
        {pct}
      </span>
      <span className="text-[10px] font-medium opacity-80">%</span>
    </span>
  );
}

function ChipScroller({ children }: { children: ReactNode }) {
  return (
    <div className="scrollbar-hidden -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 [-webkit-overflow-scrolling:touch] sm:gap-2">
      {children}
    </div>
  );
}

function EventCard({ e, showPhase }: { e: LifeEventItem; showPhase?: boolean }) {
  const Icon = CATEGORY_ICONS[e.category];
  const pct = likelihoodPct(e.score);
  return (
    <li className="border-border/50 from-background/60 to-muted/20 min-w-0 rounded-xl border bg-gradient-to-br px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3.5">
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="bg-gold/10 text-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[13px] leading-snug font-medium break-words sm:text-sm md:text-[0.95rem]">
                {e.title}
              </p>
              {showPhase ? (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {e.phase === "present" ? "current" : e.phase}
                </Badge>
              ) : null}
            </div>
            <LikelihoodBadge score={e.score} />
          </div>

          <div className="bg-muted/35 h-1 w-full overflow-hidden rounded-full sm:h-1.5">
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                pct >= 80 ? "bg-gold/80" : "bg-primary/70",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              Major period
            </Badge>
            {e.detailLabel ? (
              <Badge variant="outline" className="text-[10px]">
                {e.detailLabel}
              </Badge>
            ) : null}
            {typeof e.spanMonths === "number" ? (
              <Badge variant="outline" className="text-[10px]">
                {e.spanMonths >= 12 ? `~${Math.round(e.spanMonths / 12)} yr` : `${e.spanMonths} mo`}
              </Badge>
            ) : null}
          </div>
          <p className="text-[13px] leading-snug font-medium sm:text-sm">
            <span className="break-words">{e.window}</span>
            {e.ageHint ? (
              <span className="text-muted-foreground font-normal"> · {e.ageHint}</span>
            ) : null}
          </p>
          <p className="text-foreground/90 text-[11px] leading-relaxed break-words sm:text-xs">
            {e.explain}
          </p>
          {e.gocharNote ? (
            <p className="text-primary/90 text-[11px] leading-relaxed break-words sm:text-xs">
              <Orbit className="mr-1 inline h-3 w-3 shrink-0" />
              {e.gocharNote}
            </p>
          ) : null}
          <p className="text-muted-foreground text-[10px] leading-relaxed break-words sm:text-[11px] md:text-xs">
            {e.dashaLabel} · {e.detailLabel || CATEGORY_LABELS[e.category]} · ~{pct}% likelihood
          </p>
          <p className="text-muted-foreground hidden text-[11px] leading-relaxed break-words sm:block sm:text-xs">
            {e.suggestion}
          </p>
        </div>
      </div>
    </li>
  );
}

function sortByLikelihood(list: LifeEventItem[]) {
  const phaseRank: Record<LifeEventPhase, number> = { present: 0, future: 1, past: 2 };
  return [...list].sort(
    (a, b) =>
      b.score - a.score ||
      phaseRank[a.phase] - phaseRank[b.phase] ||
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
}

/** Scrollable event panel — keeps page height stable on desktop when All is dense */
function EventScrollPanel({ total, children }: { total: number; children: ReactNode }) {
  return (
    <div className="border-border/50 bg-card/30 relative min-w-0 overflow-hidden rounded-2xl border">
      <div className="border-border/40 bg-background/80 flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-[11px]">
          {total} major chapter{total === 1 ? "" : "s"}
        </p>
        {total > 4 ? (
          <p className="text-muted-foreground text-[10px] sm:text-[11px]">Scroll inside panel</p>
        ) : null}
      </div>
      <div
        className={cn(
          "scrollbar-premium overflow-y-auto overscroll-contain",
          // Phone / tablet: shorter; desktop: viewport-capped so page doesn’t grow endlessly
          "max-h-[min(52dvh,22rem)] sm:max-h-[min(48dvh,26rem)] md:max-h-[min(50dvh,30rem)]",
          "lg:max-h-[min(56dvh,34rem)] xl:max-h-[min(58dvh,38rem)]",
          "space-y-3 p-2.5 pb-5 sm:space-y-4 sm:p-3.5 sm:pb-6",
        )}
      >
        {children}
      </div>
      {total > 4 ? (
        <div
          aria-hidden
          className="from-card/95 pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t to-transparent"
        />
      ) : null}
    </div>
  );
}

type CalendarPayload = {
  context: DeshKaalPatraContext;
  events: LifeEventItem[];
  byPhase: Record<LifeEventPhase, LifeEventItem[]>;
  highProbability?: LifeEventItem[];
  pastHighlights?: LifeEventItem[];
  presentHighlights?: LifeEventItem[];
  futureHighlights?: LifeEventItem[];
  gocharSummary?: string;
  snapshot: {
    lagnaSign?: string;
    moonSign?: string;
    sunSign?: string;
    currentMaha?: string | null;
    currentAntar?: string | null;
    seventhLord?: string;
    gocharHighlights?: string[];
    gocharPlanets?: Array<{
      planet: string;
      house: number;
      sign: string;
      retrograde: boolean;
    }>;
    historicalSamples?: number;
  };
  marriageWindows: Array<{
    label: string;
    window: string;
    score: number;
    reason: string;
    phase: LifeEventPhase;
  }>;
  spouseTendencies?: SpouseTendenciesView | null;
  methodology: string;
};

export default function CalendarPage() {
  const [data, setData] = useState<CalendarPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TimeTab>("present");
  const [category, setCategory] = useState<LifeEventCategory | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json?.error || "Could not load calendar");
      }
      setData(json.data);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filterCat = useCallback(
    (list: LifeEventItem[] | undefined) => {
      if (!list) return [];
      if (category === "all") return list;
      return list.filter((e) => e.category === category);
    },
    [category],
  );

  const counts = useMemo(() => {
    if (!data) return { all: 0, past: 0, present: 0, future: 0 };
    const past = filterCat(data.byPhase.past);
    const present = filterCat(data.byPhase.present);
    const future = filterCat(data.byPhase.future);
    return {
      all: past.length + present.length + future.length,
      past: past.length,
      present: present.length,
      future: future.length,
    };
  }, [data, filterCat]);

  const tabEvents = useMemo(() => {
    if (!data) return [];
    if (tab === "all") {
      return sortByLikelihood([
        ...filterCat(data.byPhase.present),
        ...filterCat(data.byPhase.future),
        ...filterCat(data.byPhase.past),
      ]);
    }
    return sortByLikelihood(filterCat(data.byPhase[tab]));
  }, [data, tab, filterCat]);

  const needsOnboarding = Boolean(error) && !data;

  return (
    <div className="relative min-w-0 space-y-4 sm:space-y-6 lg:space-y-7">
      <PageHeader
        className="mb-4 sm:mb-6 md:mb-8"
        eyebrow="VedaMilan AI · Life calendar"
        title="Calendar"
        description="Major life chapters only — the most relevant multi-month Antardasha periods, not everyday noise. Likelihood % from dasha + gochar under Desh–Kaal–Patra."
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={routes.marriageTiming}>Marriage detail</Link>
            </Button>
          </div>
        }
      />

      {loading && !data ? (
        <PanelSkeleton lines={6} />
      ) : needsOnboarding ? (
        <EmptyState
          title="Chart required"
          description={error || "Add birth details and generate kundli."}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : data ? (
        <>
          <section className="border-border/50 from-muted/30 min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-3.5 sm:rounded-3xl sm:p-5 lg:p-6">
            <div className="mb-3 flex flex-col gap-3 sm:mb-5 md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="max-w-2xl min-w-0 space-y-1">
                <p className="text-gold/85 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]">
                  <CalendarRange className="h-3.5 w-3.5 shrink-0" />
                  <span>Classical filter · Desh–Kaal–Patra</span>
                </p>
                <p className="font-display text-base leading-snug text-balance sm:text-xl lg:text-2xl">
                  Place, time, and capacity shape which windows apply
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 md:max-w-[15rem] md:justify-end lg:max-w-xs">
                {data.snapshot.lagnaSign ? (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    Lagna · {data.snapshot.lagnaSign}
                  </Badge>
                ) : null}
                {data.snapshot.currentMaha ? (
                  <Badge variant="secondary" className="max-w-full text-[10px] sm:text-xs">
                    <span className="truncate">
                      Dasha · {data.snapshot.currentMaha}
                      {data.snapshot.currentAntar ? ` / ${data.snapshot.currentAntar}` : ""}
                    </span>
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Mobile: stacked · Tablet+: 3 equal pillars */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4">
              {(
                [
                  {
                    key: "desh",
                    sanskrit: "Desh",
                    english: "Place",
                    Icon: MapPin,
                    body: data.context.placeNote.replace(/^Desha?\s*[—–-]\s*/i, ""),
                  },
                  {
                    key: "kaal",
                    sanskrit: "Kaal",
                    english: "Time",
                    Icon: Hourglass,
                    body: data.context.timeNote.replace(/^Kaala?\s*[—–-]\s*/i, ""),
                  },
                  {
                    key: "patra",
                    sanskrit: "Patra",
                    english: "Vessel",
                    Icon: UserRound,
                    body: data.context.vesselNote.replace(/^Patra\s*[—–-]\s*/i, ""),
                  },
                ] as const
              ).map(({ key, sanskrit, english, Icon, body }) => (
                <div
                  key={key}
                  className="border-border/45 bg-background/50 min-w-0 rounded-xl border px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3.5"
                >
                  <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                    <span className="bg-gold/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl">
                      <Icon className="text-foreground h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm leading-none sm:text-base">{sanskrit}</p>
                      <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                        {english}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed break-words sm:text-xs">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            {(data.snapshot.gocharHighlights?.length || data.gocharSummary) && (
              <div className="border-border/40 mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  <Orbit className="h-3.5 w-3.5 shrink-0" />
                  Live gochar · shapes Current %
                </p>
                {data.snapshot.gocharHighlights?.length ? (
                  <ul className="grid gap-1 md:grid-cols-2">
                    {data.snapshot.gocharHighlights.map((h) => (
                      <li
                        key={h}
                        className="text-muted-foreground text-[11px] leading-relaxed break-words sm:text-xs"
                      >
                        · {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-[11px] break-words sm:text-xs">
                    {data.gocharSummary}
                  </p>
                )}
                {data.snapshot.gocharPlanets?.length ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {data.snapshot.gocharPlanets.map((p) => (
                      <Badge key={p.planet} variant="outline" className="text-[10px]">
                        {p.planet} · H{p.house}
                        {p.retrograde ? " ℞" : ""}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="border-border/50 bg-card/40 min-w-0 rounded-2xl border px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-2.5 flex flex-col gap-1 sm:mb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-2">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Major periods
                </p>
                <p className="font-display text-base sm:text-lg">How to read this calendar</p>
              </div>
              <p className="text-muted-foreground max-w-md text-[11px] leading-relaxed sm:text-right sm:text-xs">
                Mild windows are hidden. Each card is one primary theme for a whole Antardasha
                chapter.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
              {LIKELIHOOD_GUIDE.map((row) => (
                <li
                  key={row.range}
                  className={cn(
                    "flex min-w-0 items-start gap-3 rounded-xl border px-3 py-2 sm:block sm:py-2.5",
                    row.tone,
                  )}
                >
                  <p className="font-display shrink-0 text-sm tabular-nums sm:mb-0">{row.range}</p>
                  <div className="min-w-0">
                    <p className="text-xs font-medium sm:mt-0.5">{row.title}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed sm:mt-1">
                      {row.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid min-w-0 items-start gap-4 md:gap-5 lg:grid-cols-3 xl:gap-6">
            <div className="min-w-0 lg:col-span-2">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TimeTab)} className="min-w-0">
                <div className="bg-background/92 sticky top-0 z-10 -mx-3 px-3 py-2 backdrop-blur-md lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
                  <TabsList className="border-border/50 bg-card/80 sm:bg-card/60 grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border p-1 md:grid-cols-4">
                    {TAB_ORDER.map((key) => {
                      const meta = TAB_META[key];
                      const Icon = meta.Icon;
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2 text-[11px] sm:min-h-10 sm:px-2 sm:text-xs md:min-h-11 md:flex-row md:gap-1.5 md:text-sm"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {meta.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 min-w-5 justify-center px-1.5 text-[10px] font-normal"
                          >
                            {counts[key]}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <div className="mt-2.5 sm:mt-3">
                    <ChipScroller>
                      {CATEGORY_CHIP_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCategory(key)}
                          className={cn(
                            "shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:px-3 sm:py-1 sm:text-xs",
                            category === key
                              ? "border-primary/40 bg-primary/10 text-foreground"
                              : "border-border/50 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {CATEGORY_LABELS[key]}
                        </button>
                      ))}
                    </ChipScroller>
                  </div>
                </div>

                {TAB_ORDER.map((key) => {
                  const meta = TAB_META[key];
                  const list = key === tab ? tabEvents : [];
                  return (
                    <TabsContent key={key} value={key} className="mt-3 space-y-3 sm:mt-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="font-display text-base sm:text-lg md:text-xl">
                            {meta.label} · major chapters
                          </h2>
                          <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-sm">
                            {meta.blurb}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] sm:text-xs">
                          {list.length} major
                        </Badge>
                      </div>

                      {list.length === 0 ? (
                        <GlassCard className="p-3.5 sm:p-5">
                          <p className="text-muted-foreground text-sm">
                            No major {meta.label.toLowerCase()} chapters for this filter. Try All
                            themes or another time tab.
                          </p>
                        </GlassCard>
                      ) : (
                        <EventScrollPanel total={list.length}>
                          <div className="space-y-2">
                            <p className="text-muted-foreground bg-card/95 sticky top-0 z-[1] px-0.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-sm">
                              Primary Antardasha themes
                            </p>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {list.map((e) => (
                                <EventCard key={`${key}-${e.id}`} e={e} showPhase={key === "all"} />
                              ))}
                            </ul>
                          </div>
                        </EventScrollPanel>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            {/* Side panels stay visible beside the scroll panel on desktop */}
            <aside className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 lg:sticky lg:top-4 lg:grid-cols-1 lg:self-start">
              <SpouseTendencyPanel tendencies={data.spouseTendencies} compact />

              <GlassCard className="min-w-0 space-y-3 p-3.5 sm:p-5 lg:p-6">
                <h2 className="font-display text-base sm:text-lg">Marriage focus</h2>
                <ul className="space-y-2.5 text-sm">
                  {(data.marriageWindows || []).slice(0, 4).map((w, i) => (
                    <li
                      key={`${w.label}-${i}`}
                      className="border-border/40 min-w-0 rounded-xl border px-2.5 py-2 sm:px-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium break-words sm:text-sm">{w.label}</p>
                        <LikelihoodBadge score={w.score} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
                        {w.window}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed break-words">
                        {w.reason}
                      </p>
                    </li>
                  ))}
                  {!data.marriageWindows?.length ? (
                    <p className="text-muted-foreground text-xs">
                      Open marriage timing for a full vivaha reading.
                    </p>
                  ) : null}
                </ul>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={routes.marriageTiming}>Full marriage timing</Link>
                </Button>
              </GlassCard>

              <GlassCard className="min-w-0 space-y-3 p-3.5 sm:p-5 lg:p-6">
                <h2 className="font-display text-base sm:text-lg">How to read</h2>
                <ul className="text-muted-foreground space-y-2 text-[11px] leading-relaxed sm:text-xs">
                  <li>· Only major multi-month chapters — mild windows are hidden.</li>
                  <li>· Travel cards specify foreign / local / relocation when possible.</li>
                  <li>· Marriage cards include love vs arranged and spouse-origin leanings.</li>
                  <li>· % is directional (dasha + gochar), not a guarantee.</li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button asChild size="sm" variant="ai" className="w-full">
                    <Link href={routes.aiInsights}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Ask AI Guru
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={routes.gochar}>Open Gochar</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="w-full">
                      <Link href={routes.dasha}>View Dashas</Link>
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </aside>
          </div>

          <p className="text-muted-foreground pb-2 text-[10px] leading-relaxed break-words sm:text-xs">
            {data.methodology}
          </p>
        </>
      ) : null}
    </div>
  );
}
