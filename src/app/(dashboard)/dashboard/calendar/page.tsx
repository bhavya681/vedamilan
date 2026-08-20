"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarRange,
  ChevronDown,
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
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium-cards";
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
import { northHorizonHref, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const CATEGORY_COLORS: Record<
  LifeEventCategory,
  { bg: string; text: string; border: string; bar: string; fill: string }
> = {
  marriage: {
    bg: "bg-rose/10",
    text: "text-rose",
    border: "border-rose/30",
    bar: "bg-rose",
    fill: "bg-rose/25",
  },
  career: {
    bg: "bg-secondary/10",
    text: "text-secondary dark:text-cosmic",
    border: "border-secondary/25",
    bar: "bg-secondary",
    fill: "bg-secondary/20",
  },
  job: {
    bg: "bg-cosmic/10",
    text: "text-cosmic",
    border: "border-cosmic/25",
    bar: "bg-cosmic",
    fill: "bg-cosmic/20",
  },
  education: {
    bg: "bg-saffron/10",
    text: "text-saffron",
    border: "border-saffron/30",
    bar: "bg-saffron",
    fill: "bg-saffron/25",
  },
  wealth: {
    bg: "bg-emerald/10",
    text: "text-emerald",
    border: "border-emerald/25",
    bar: "bg-emerald",
    fill: "bg-emerald/20",
  },
  property: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/25",
    bar: "bg-primary",
    fill: "bg-primary/20",
  },
  travel: {
    bg: "bg-secondary/10",
    text: "text-secondary dark:text-ivory/80",
    border: "border-secondary/20",
    bar: "bg-secondary",
    fill: "bg-secondary/15",
  },
  health: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/25",
    bar: "bg-destructive",
    fill: "bg-destructive/15",
  },
  spiritual: {
    bg: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/35",
    bar: "bg-gold",
    fill: "bg-gold/25",
  },
};

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

const TAB_ORDER: TimeTab[] = ["present", "future", "past", "all"];

const TAB_META: Record<
  TimeTab,
  { label: string; blurb: string; Icon: typeof CircleDot; accent: string }
> = {
  all: {
    label: "All",
    blurb: "Major chapters across past, current, and future — one theme per Antardasha.",
    Icon: LayoutList,
    accent: "text-muted-foreground",
  },
  present: {
    label: "Current",
    blurb: "The primary theme of your active Antardasha, confirmed by live gochar where possible.",
    Icon: CircleDot,
    accent: "text-emerald-500",
  },
  past: {
    label: "Past",
    blurb: "Closed major chapters — scored with dasha and the sky at that period.",
    Icon: History,
    accent: "text-muted-foreground",
  },
  future: {
    label: "Future",
    blurb: "Upcoming multi-month chapters worth planning around — not everyday noise.",
    Icon: Sparkle,
    accent: "text-sky-500",
  },
};

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

function formatSpan(months?: number) {
  if (typeof months !== "number") return null;
  return months >= 12 ? `~${Math.round(months / 12)} yr` : `${months} mo`;
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

type CalendarPayload = {
  context: DeshKaalPatraContext;
  events: LifeEventItem[];
  byPhase: Record<LifeEventPhase, LifeEventItem[]>;
  highProbability?: LifeEventItem[];
  gocharSummary?: string;
  snapshot: {
    lagnaSign?: string;
    moonSign?: string;
    sunSign?: string;
    currentMaha?: string | null;
    currentAntar?: string | null;
    gocharHighlights?: string[];
    gocharPlanets?: Array<{
      planet: string;
      house: number;
      sign: string;
      retrograde: boolean;
    }>;
  };
  marriageWindows: Array<{
    label: string;
    window: string;
    score: number;
    reason: string;
    phase: LifeEventPhase;
    startDate?: string | null;
  }>;
  marryNow?: {
    score: number;
    title: string;
    reason: string;
    verdict: string;
  };
  spouseTendencies?: SpouseTendenciesView | null;
  methodology: string;
};

function formatChapterRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function axisPct(ts: number, range: { min: number; span: number }) {
  return ((ts - range.min) / range.span) * 100;
}

function ChapterTimeline({
  events,
  activeId,
  onSelect,
}: {
  events: LifeEventItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  const range = useMemo(() => {
    if (events.length === 0 || !now) return null;
    const starts = events.map((e) => new Date(e.startDate).getTime());
    const ends = events.map((e) => new Date(e.endDate).getTime());
    const min = Math.min(...starts, now);
    const max = Math.max(...ends, now);
    const pad = (max - min) * 0.06;
    return { min: min - pad, max: max + pad, span: Math.max(1, max - min + pad * 2) };
  }, [events, now]);

  const years = useMemo(() => {
    if (!range) return [];
    const startY = new Date(range.min).getFullYear();
    const endY = new Date(range.max).getFullYear();
    const spanYears = Math.max(1, endY - startY);
    const step = spanYears > 24 ? 5 : spanYears > 12 ? 2 : 1;
    const list: number[] = [];
    const first = Math.ceil(startY / step) * step;
    for (let y = first; y <= endY; y += step) list.push(y);
    return list;
  }, [range]);

  const rows = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const marriageRank = Number(b.category === "marriage") - Number(a.category === "marriage");
        if (marriageRank) return marriageRank;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 10);
  }, [events]);

  const legend = useMemo(() => {
    const seen = new Set<LifeEventCategory>();
    return rows.filter((e) => {
      if (seen.has(e.category)) return false;
      seen.add(e.category);
      return true;
    });
  }, [rows]);

  if (!range || events.length === 0 || !now) return null;

  const nowLeft = Math.max(0, Math.min(100, axisPct(now, range)));
  const nowLabel = new Date(now).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const labelCol = "w-[9.25rem] sm:w-[11.5rem]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-lg sm:text-xl">Chapter timeline</h2>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            Major Antardasha chapters on a shared time scale. Select a bar to open that chapter.
          </p>
        </div>
        <p className="text-muted-foreground text-[11px] tabular-nums">
          {rows.length} chapters · today {nowLabel}
        </p>
      </div>

      {legend.length > 1 ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
          {legend.map((e) => {
            const colors = CATEGORY_COLORS[e.category];
            return (
              <li
                key={e.category}
                className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]"
              >
                <span className={cn("h-2 w-2 rounded-[2px]", colors.bar)} aria-hidden />
                {CATEGORY_LABELS[e.category]}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="border-border/70 bg-background overflow-hidden rounded-xl border">
        <div className="scrollbar-premium overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[38rem] sm:min-w-[44rem]">
            <div className="border-border/50 flex border-b">
              <div
                className={cn(
                  "text-muted-foreground shrink-0 px-3 py-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
                  labelCol,
                )}
              >
                Chapter
              </div>
              <div className="relative min-h-9 min-w-0 flex-1">
                {years.map((year) => {
                  const left = axisPct(new Date(year, 0, 1).getTime(), range);
                  if (left < 1 || left > 99) return null;
                  if (Math.abs(left - nowLeft) < 6) return null;
                  return (
                    <span
                      key={year}
                      className="text-muted-foreground absolute top-2 -translate-x-1/2 text-[10px] tabular-nums"
                      style={{ left: `${left}%` }}
                    >
                      {year}
                    </span>
                  );
                })}
                <span
                  className="text-gold absolute top-1.5 z-10 -translate-x-1/2 text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ left: `${nowLeft}%` }}
                >
                  Today
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 left-[9.25rem] z-[1] sm:left-[11.5rem]">
                {years.map((year) => {
                  const left = axisPct(new Date(year, 0, 1).getTime(), range);
                  if (left < 0 || left > 100) return null;
                  return (
                    <span
                      key={`grid-${year}`}
                      className="border-border/40 absolute top-0 bottom-0 border-l"
                      style={{ left: `${left}%` }}
                    />
                  );
                })}
                <span
                  className="bg-gold absolute top-0 bottom-0 z-[2] w-px"
                  style={{ left: `${nowLeft}%` }}
                />
              </div>

              <ul>
                {rows.map((e, index) => {
                  const start = new Date(e.startDate).getTime();
                  const end = new Date(e.endDate).getTime();
                  const left = axisPct(start, range);
                  const width = Math.max(2.4, ((end - start) / range.span) * 100);
                  const clampedLeft = Math.max(0, left);
                  const clampedWidth = Math.min(100 - clampedLeft, width);
                  const colors = CATEGORY_COLORS[e.category];
                  const Icon = CATEGORY_ICONS[e.category];
                  const active = activeId === e.id;
                  const rangeLabel = formatChapterRange(e.startDate, e.endDate);
                  const span = formatSpan(e.spanMonths);
                  const showInBar = clampedWidth >= 18;
                  return (
                    <li key={e.id} className={index > 0 ? "border-border/40 border-t" : undefined}>
                      <button
                        type="button"
                        onClick={() => onSelect(e.id)}
                        aria-pressed={active}
                        title={`${e.title} · ${rangeLabel}`}
                        className={cn(
                          "flex w-full text-left transition-colors duration-200",
                          "hover:bg-muted/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          active && "bg-gold/8",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-background/95 sticky left-0 z-[3] flex shrink-0 items-center gap-2.5 border-r px-3 py-2.5 backdrop-blur-sm",
                            labelCol,
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                              colors.bg,
                              colors.border,
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] leading-tight font-medium">
                              {e.title}
                            </span>
                            <span className="text-muted-foreground mt-0.5 block truncate text-[10px]">
                              {CATEGORY_LABELS[e.category]}
                              <span className="capitalize">
                                {" "}
                                · {e.phase === "present" ? "current" : e.phase}
                              </span>
                            </span>
                          </span>
                        </span>
                        <span className="relative min-h-12 min-w-0 flex-1 px-0 py-3.5">
                          <span className="bg-muted/35 absolute inset-y-3.5 right-3 left-0 rounded-sm" />
                          <span
                            className={cn(
                              "absolute inset-y-3.5 flex items-center overflow-hidden rounded-sm border-l-2 pr-2 pl-2",
                              colors.fill,
                              colors.border,
                              colors.text,
                              e.phase === "past" && "opacity-55",
                              e.phase === "future" && "opacity-90",
                              active && "ring-gold/50 ring-1",
                            )}
                            style={{
                              left: `${clampedLeft}%`,
                              width: `${clampedWidth}%`,
                            }}
                          >
                            {showInBar ? (
                              <span className="truncate text-[10px] font-medium tabular-nums">
                                {rangeLabel}
                                {span ? ` · ${span}` : ""}
                              </span>
                            ) : (
                              <span className="sr-only">{rangeLabel}</span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        The gold line is today. Past chapters sit quieter; current chapters are full strength.
        Colours are life themes, not scores.
      </p>
    </div>
  );
}

function EventCard({
  e,
  open,
  onToggle,
  showPhase,
}: {
  e: LifeEventItem;
  open: boolean;
  onToggle: () => void;
  showPhase?: boolean;
}) {
  const Icon = CATEGORY_ICONS[e.category];
  const colors = CATEGORY_COLORS[e.category];
  const pct = likelihoodPct(e.score);
  const isMarriage = e.category === "marriage";
  const isHigh = pct >= 80;

  return (
    <article
      className={cn(
        "rounded-2xl border transition-colors",
        isMarriage ? "border-gold/35 bg-gold/5" : "border-border/60 bg-card",
        open && "shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-3.5 py-3 text-left sm:gap-4 sm:px-4 sm:py-3.5"
        aria-expanded={open}
      >
        <span
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            colors.bg,
            colors.border,
          )}
        >
          <Icon className={cn("h-4 w-4", colors.text)} />
        </span>
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium break-words sm:text-[0.95rem]">{e.title}</span>
                {showPhase ? (
                  <Badge variant="outline" className="text-[9px] tracking-wider uppercase">
                    {e.phase === "present" ? "now" : e.phase}
                  </Badge>
                ) : null}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px] sm:text-xs">
                {e.window}
                {e.ageHint ? ` · ${e.ageHint}` : ""}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-baseline gap-0.5 rounded-full border px-2 py-1 tabular-nums",
                  isHigh ? "border-gold/50 bg-gold/15" : "border-primary/30 bg-primary/10",
                )}
              >
                <span className="font-display text-sm leading-none">{pct}</span>
                <span className="text-[10px] opacity-80">%</span>
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-4 w-4 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </span>
          </span>
          <span className="bg-muted/70 block h-1.5 overflow-hidden rounded-full">
            <span
              className={cn("block h-full rounded-full", isHigh ? "bg-gold" : "bg-primary/80")}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {CATEGORY_LABELS[e.category]}
            </Badge>
            {e.detailLabel ? (
              <Badge variant="outline" className="text-[10px]">
                {e.detailLabel}
              </Badge>
            ) : null}
            {formatSpan(e.spanMonths) ? (
              <Badge variant="outline" className="text-[10px]">
                {formatSpan(e.spanMonths)}
              </Badge>
            ) : null}
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t px-3.5 pt-3 pb-3.5 sm:px-4 sm:pb-4">
              <p className="text-[12px] leading-relaxed sm:text-sm">{e.explain}</p>
              {e.gocharNote ? (
                <p className="text-primary/90 text-[12px] leading-relaxed sm:text-sm">
                  <Orbit className="mr-1 inline h-3.5 w-3.5" />
                  {e.gocharNote}
                </p>
              ) : null}
              <div
                className={cn(
                  "rounded-xl border px-3 py-2",
                  isMarriage ? "border-gold/25 bg-gold/5" : "border-border/60 bg-muted/30",
                )}
              >
                <p className="text-[12px] leading-relaxed font-medium sm:text-sm">
                  Accept: {e.acceptLine}
                </p>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-xs">
                {e.suggestion}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {e.dashaLabel} · ~{pct}% directional likelihood
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href={northHorizonHref({ at: e.startDate })}>View sky</Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export default function CalendarPage() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<CalendarPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TimeTab>("present");
  const [category, setCategory] = useState<LifeEventCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

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

  const timelineEvents = useMemo(() => {
    if (!data) return [];
    return filterCat([...data.byPhase.past, ...data.byPhase.present, ...data.byPhase.future]);
  }, [data, filterCat]);

  const categoryCounts = useMemo(() => {
    if (!data) return {} as Record<string, number>;
    const all = [...data.byPhase.past, ...data.byPhase.present, ...data.byPhase.future];
    const map: Record<string, number> = { all: all.length };
    for (const e of all) map[e.category] = (map[e.category] || 0) + 1;
    return map;
  }, [data]);

  const visibleChips = useMemo(
    () => CATEGORY_CHIP_ORDER.filter((key) => key === "all" || (categoryCounts[key] || 0) > 0),
    [categoryCounts],
  );

  useEffect(() => {
    setOpenId((current) => {
      if (current && tabEvents.some((e) => e.id === current)) return current;
      return tabEvents[0]?.id ?? null;
    });
  }, [tab, category, tabEvents]);

  const needsOnboarding = Boolean(error) && !data;

  const selectChapter = (id: string) => {
    const event = timelineEvents.find((e) => e.id === id);
    if (event) {
      setTab(event.phase);
      setOpenId(id);
      requestAnimationFrame(() => {
        document.getElementById(`chapter-${id}`)?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Desh · Kaal · Patra"
        title="Calendar"
        description="Major life chapters from dasha and gochar — filtered by place, time, and chart capacity. Not a daily planner."
        actions={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild variant="secondary" className="flex-1 sm:flex-none">
              <Link href={routes.marriageTiming}>Marriage timing</Link>
            </Button>
          </div>
        }
      />

      {loading && !data ? <PanelSkeleton lines={8} /> : null}

      {needsOnboarding ? (
        <EmptyState
          title="Chart required"
          description={error || "Add birth details and generate kundli to open your life calendar."}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  key: "present" as TimeTab,
                  label: "Current",
                  value: data.byPhase.present.length,
                  icon: CircleDot,
                  color: "text-emerald-500",
                },
                {
                  key: "future" as TimeTab,
                  label: "Upcoming",
                  value: data.byPhase.future.length,
                  icon: Sparkle,
                  color: "text-sky-500",
                },
                {
                  key: "past" as TimeTab,
                  label: "Past",
                  value: data.byPhase.past.length,
                  icon: History,
                  color: "text-muted-foreground",
                },
                {
                  key: "all" as TimeTab,
                  label: "High likelihood",
                  value: data.highProbability?.length || 0,
                  icon: TrendingUp,
                  color: "text-gold",
                },
              ] as const
            ).map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => setTab(stat.key)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors sm:p-4",
                  tab === stat.key
                    ? "border-gold/40 bg-gold/5"
                    : "border-border/60 bg-card hover:border-border",
                )}
              >
                <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wider uppercase">
                  <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                  {stat.label}
                </p>
                <p className="font-display mt-1 text-2xl leading-none">{stat.value}</p>
              </button>
            ))}
          </div>

          <GlassCard className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gold/85 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Snapshot
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {data.snapshot.currentMaha
                    ? `${data.snapshot.currentMaha}${data.snapshot.currentAntar ? ` / ${data.snapshot.currentAntar}` : ""} dasha`
                    : "Vimshottari chapters"}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.snapshot.lagnaSign ? (
                  <Badge variant="outline">Lagna · {data.snapshot.lagnaSign}</Badge>
                ) : null}
                {data.snapshot.moonSign ? (
                  <Badge variant="outline">Moon · {data.snapshot.moonSign}</Badge>
                ) : null}
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {(
                [
                  {
                    sanskrit: "Desh",
                    english: "Place",
                    Icon: MapPin,
                    body: data.context.placeNote.replace(/^Desha?\s*[—–-]\s*/i, ""),
                    accent: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    sanskrit: "Kaal",
                    english: "Time",
                    Icon: Hourglass,
                    body: data.context.timeNote.replace(/^Kaala?\s*[—–-]\s*/i, ""),
                    accent: "text-sky-500",
                    bg: "bg-sky-500/10",
                  },
                  {
                    sanskrit: "Patra",
                    english: "Vessel",
                    Icon: UserRound,
                    body: data.context.vesselNote.replace(/^Patra\s*[—–-]\s*/i, ""),
                    accent: "text-purple-500",
                    bg: "bg-purple-500/10",
                  },
                ] as const
              ).map((pillar) => (
                <div key={pillar.sanskrit} className="rounded-xl border p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        pillar.bg,
                      )}
                    >
                      <pillar.Icon className={cn("h-4 w-4", pillar.accent)} />
                    </span>
                    <div>
                      <p className="font-display text-sm leading-none">{pillar.sanskrit}</p>
                      <p className="text-muted-foreground text-[10px] uppercase">
                        {pillar.english}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{pillar.body}</p>
                </div>
              ))}
            </div>
            <ChapterTimeline events={timelineEvents} activeId={openId} onSelect={selectChapter} />
          </GlassCard>

          {data.snapshot.gocharHighlights?.length || data.gocharSummary ? (
            <GlassCard className="space-y-2 p-4">
              <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                <Orbit className="h-3.5 w-3.5" />
                Live gochar
              </p>
              {data.snapshot.gocharHighlights?.length ? (
                <ul className="grid gap-1 sm:grid-cols-2">
                  {data.snapshot.gocharHighlights.slice(0, 4).map((h) => (
                    <li key={h} className="text-muted-foreground text-xs leading-relaxed">
                      · {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-xs">{data.gocharSummary}</p>
              )}
              {data.snapshot.gocharPlanets?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.snapshot.gocharPlanets.map((p) => (
                    <Badge key={p.planet} variant="outline" className="text-[10px]">
                      {p.planet} · H{p.house}
                      {p.retrograde ? " ℞" : ""}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </GlassCard>
          ) : null}

          <div className="grid min-w-0 items-start gap-5 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TimeTab)}>
                <div className="bg-background/90 sticky top-0 z-10 -mx-3 space-y-3 px-3 py-2 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                  <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl">
                    {TAB_ORDER.map((key) => {
                      const meta = TAB_META[key];
                      const Icon = meta.Icon;
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="flex min-h-10 flex-col gap-0 rounded-xl px-1 py-1.5 text-[11px] sm:min-h-11 sm:flex-row sm:gap-1.5 sm:text-sm"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                          <span className="text-[10px] opacity-70">{counts[key]}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  <div className="scrollbar-hidden flex gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
                    {visibleChips.map((key) => {
                      const isActive = category === key;
                      const colors = key === "all" ? null : CATEGORY_COLORS[key];
                      const Icon = key === "all" ? LayoutList : CATEGORY_ICONS[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCategory(key)}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            isActive
                              ? colors
                                ? cn(colors.bg, colors.text, colors.border)
                                : "border-gold/40 bg-gold/10 text-foreground"
                              : "border-border/60 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {CATEGORY_LABELS[key]}
                          <span className="tabular-nums opacity-70">
                            {categoryCounts[key] || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {TAB_ORDER.map((key) => {
                  const meta = TAB_META[key];
                  const list = key === tab ? tabEvents : [];
                  return (
                    <TabsContent key={key} value={key} className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <h2 className="font-display text-lg sm:text-xl">{meta.label} chapters</h2>
                          <p className="text-muted-foreground text-xs sm:text-sm">{meta.blurb}</p>
                        </div>
                        <Badge variant="outline">{list.length}</Badge>
                      </div>
                      {list.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                          <CalendarRange className="text-muted-foreground/40 mb-2 h-6 w-6" />
                          <p className="text-muted-foreground text-sm">
                            No {meta.label.toLowerCase()} chapters for this theme.
                          </p>
                          <button
                            type="button"
                            className="text-gold mt-2 text-xs underline underline-offset-2"
                            onClick={() => setCategory("all")}
                          >
                            Show all themes
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-2.5">
                          {list.map((e) => (
                            <li
                              key={e.id}
                              id={`chapter-${e.id}`}
                              className="scroll-mt-28 sm:scroll-mt-4"
                            >
                              <EventCard
                                e={e}
                                open={openId === e.id}
                                onToggle={() => setOpenId(openId === e.id ? null : e.id)}
                                showPhase={key === "all"}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            <aside className="grid min-w-0 gap-4 sm:grid-cols-2 lg:sticky lg:top-4 lg:grid-cols-1 lg:self-start">
              {data.marryNow ? (
                <GlassCard className="border-gold/30 space-y-2 p-4">
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Marriage now
                  </p>
                  <p className="font-display text-lg">{data.marryNow.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {data.marryNow.reason}
                  </p>
                  <Badge variant="outline">{data.marryNow.verdict}</Badge>
                </GlassCard>
              ) : null}

              {data.marriageWindows?.length ? (
                <GlassCard className="space-y-3 p-4">
                  <h2 className="font-display text-base">Marriage windows</h2>
                  <ul className="space-y-2">
                    {data.marriageWindows.slice(0, 3).map((w) => (
                      <li key={`${w.label}-${w.window}`} className="rounded-xl border p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{w.label}</p>
                          <span className="text-muted-foreground text-[10px] tabular-nums">
                            {likelihoodPct(w.score)}%
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{w.window}</p>
                        {w.startDate ? (
                          <Link
                            href={northHorizonHref({ at: w.startDate, intent: "marriage" })}
                            className="text-primary mt-1 inline-block text-[11px] underline-offset-2 hover:underline"
                          >
                            Marriage sky
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={routes.marriageTiming}>Full timing</Link>
                  </Button>
                </GlassCard>
              ) : null}

              <SpouseTendencyPanel tendencies={data.spouseTendencies} compact />

              <GlassCard className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-base">How to read</h2>
                    <p className="text-muted-foreground text-[10px]">Calendar guide</p>
                  </div>
                </div>
                <ul className="text-muted-foreground space-y-2 text-xs leading-relaxed">
                  <li>Only major multi-month chapters are shown — mild windows stay hidden.</li>
                  <li>Tap a chapter for gochar notes and what to accept in that period.</li>
                  <li>Percentages are directional from dasha + gochar, not a guarantee.</li>
                </ul>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  <Button asChild size="sm" variant="ai" className="w-full">
                    <Link href={routes.aiInsights}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Ask AI Guru
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={routes.gochar}>Gochar</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="col-span-2 w-full lg:col-span-1"
                  >
                    <Link href={routes.dasha}>Dashas</Link>
                  </Button>
                </div>
              </GlassCard>
            </aside>
          </div>

          <p className="text-muted-foreground pb-2 text-[10px] leading-relaxed sm:text-xs">
            {data.methodology}
          </p>
        </>
      ) : null}
    </div>
  );
}
