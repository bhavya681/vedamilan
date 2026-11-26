"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Bot,
  Briefcase,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Flower2,
  GraduationCap,
  Heart,
  History,
  Home,
  Hourglass,
  LayoutList,
  MapPin,
  Orbit,
  Plane,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, Surface } from "@/components/ui/premium-cards";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LifeEventCategory,
  LifeEventItem,
  LifeEventPhase,
  DeshKaalPatraContext,
} from "@/application/rules/life-events-calendar";
import type {
  VedicCalendarPayload,
  VedicEventCategory,
} from "@/application/calendar/vedic-events.service";
import {
  SpouseTendencyPanel,
  type SpouseTendenciesView,
} from "@/features/compatibility/spouse-tendency-panel";
import { dashaPeriodText } from "@/features/horoscope/dasha-view";
import { northHorizonHref, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const CATEGORY_COLORS: Record<
  LifeEventCategory,
  { bg: string; text: string; border: string; bar: string; fill: string; rail: string }
> = {
  marriage: {
    bg: "bg-rose/10",
    text: "text-rose",
    border: "border-rose/30",
    bar: "bg-rose",
    fill: "bg-rose/25",
    rail: "bg-rose",
  },
  career: {
    bg: "bg-secondary/10",
    text: "text-secondary dark:text-cosmic",
    border: "border-secondary/25",
    bar: "bg-secondary",
    fill: "bg-secondary/20",
    rail: "bg-secondary",
  },
  job: {
    bg: "bg-cosmic/10",
    text: "text-cosmic",
    border: "border-cosmic/25",
    bar: "bg-cosmic",
    fill: "bg-cosmic/20",
    rail: "bg-cosmic",
  },
  education: {
    bg: "bg-saffron/10",
    text: "text-saffron",
    border: "border-saffron/30",
    bar: "bg-saffron",
    fill: "bg-saffron/25",
    rail: "bg-saffron",
  },
  wealth: {
    bg: "bg-emerald/10",
    text: "text-emerald",
    border: "border-emerald/25",
    bar: "bg-emerald",
    fill: "bg-emerald/20",
    rail: "bg-emerald",
  },
  property: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/25",
    bar: "bg-primary",
    fill: "bg-primary/20",
    rail: "bg-primary",
  },
  travel: {
    bg: "bg-secondary/10",
    text: "text-secondary dark:text-ivory/80",
    border: "border-secondary/20",
    bar: "bg-secondary",
    fill: "bg-secondary/15",
    rail: "bg-secondary",
  },
  health: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/25",
    bar: "bg-destructive",
    fill: "bg-destructive/15",
    rail: "bg-destructive",
  },
  spiritual: {
    bg: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/35",
    bar: "bg-gold",
    fill: "bg-gold/25",
    rail: "bg-gold",
  },
};

const CATEGORY_ICONS: Record<LifeEventCategory, LucideIcon> = {
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
  all: "All themes",
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

const ASTRO_CATEGORY_ORDER: VedicEventCategory[] = [
  "panchanga",
  "transit",
  "retrograde",
  "conjunction",
  "lunar",
  "eclipse",
];

const ASTRO_CATEGORY_META: Record<VedicEventCategory, { label: string; dot: string }> = {
  panchanga: { label: "Panchanga", dot: "bg-gold" },
  transit: { label: "Transit", dot: "bg-sky-500" },
  retrograde: { label: "Retrograde", dot: "bg-purple-500" },
  conjunction: { label: "Conjunction", dot: "bg-rose" },
  lunar: { label: "Lunar", dot: "bg-emerald" },
  eclipse: { label: "Eclipse", dot: "bg-destructive" },
};

type TimeTab = LifeEventPhase | "all";

const TAB_ORDER: TimeTab[] = ["all", "present", "future", "past"];

const TAB_META: Record<
  TimeTab,
  { label: string; blurb: string; Icon: LucideIcon; accent: string }
> = {
  all: {
    label: "Lifetime",
    blurb: "Every major chapter from birth onward, arranged by date.",
    Icon: LayoutList,
    accent: "text-gold",
  },
  present: {
    label: "Current",
    blurb: "The active Antardasha theme, checked against live gochar where available.",
    Icon: CircleDot,
    accent: "text-emerald-500",
  },
  future: {
    label: "Upcoming",
    blurb: "The next multi-month chapters worth planning around — not everyday noise.",
    Icon: CalendarClock,
    accent: "text-sky-500",
  },
  past: {
    label: "Past",
    blurb: "Chapters already lived, in sequence. Open one to see why it was flagged.",
    Icon: History,
    accent: "text-muted-foreground",
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

type CalendarPayload = {
  astrologyCalendar?: VedicCalendarPayload | null;
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
    asOf?: string;
    gocharAsOf?: string | null;
    gocharStatus?: "live" | "unavailable";
    historicalSamples?: number;
    datedSamples?: number;
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

function scorePct(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatSpan(months?: number) {
  if (typeof months !== "number") return null;
  return months >= 12 ? `~${Math.round(months / 12)} yr` : `${months} mo`;
}

function sortByStart(list: LifeEventItem[]) {
  return [...list].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      b.score - a.score ||
      a.endDate.localeCompare(b.endDate),
  );
}

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatChapterRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function axisPct(ts: number, range: { min: number; span: number }) {
  return ((ts - range.min) / range.span) * 100;
}

function ScoreRing({ value, compact = false }: { value: number; compact?: boolean }) {
  const pct = scorePct(value);
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full",
        compact ? "h-9 w-9" : "h-11 w-11",
      )}
      style={{
        background: `conic-gradient(var(--gold) ${pct * 3.6}deg, var(--muted) 0deg)`,
      }}
      aria-label={`${pct} percent likelihood`}
    >
      <span
        className={cn(
          "bg-card grid place-items-center rounded-full font-semibold tabular-nums",
          compact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-[11px]",
        )}
      >
        {pct}
      </span>
    </span>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/50 bg-background/50 min-w-0 rounded-lg border px-2.5 py-2">
      <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-medium tabular-nums">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-gold/85 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
          <Sparkles className="h-3 w-3" />
          {eyebrow}
        </p>
        <h2 className="font-display mt-1 text-2xl leading-tight tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function HeroPanel({
  data,
  onRefresh,
  loading,
}: {
  data: CalendarPayload;
  onRefresh: () => void;
  loading: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const asOf = data.snapshot.asOf ? new Date(data.snapshot.asOf) : null;
  const dateLabel = asOf
    ? asOf.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Your chart date";
  const dasha = dashaPeriodText(data.snapshot.currentMaha, data.snapshot.currentAntar);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="border-gold/20 bg-card shadow-elevated relative overflow-hidden rounded-3xl border"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 88% -20%, color-mix(in srgb, var(--gold) 18%, transparent), transparent 58%), radial-gradient(ellipse at 4% 120%, color-mix(in srgb, var(--cosmic) 12%, transparent), transparent 55%)",
        }}
      />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.42fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-gold text-[10px] font-semibold tracking-[0.24em] uppercase sm:text-[11px]">
            Desh · Kaal · Patra
          </p>
          <h2 className="font-display mt-2 text-3xl leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
            Your life, in season.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Dasha chapters, dated sky events, and the practical note for each window — held in one
            calm view.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {dasha ? (
              <Badge className="border-gold/30 bg-gold/10 text-foreground hover:bg-gold/10 border">
                <CircleDot className="text-gold mr-1 h-3 w-3" />
                {dasha}
              </Badge>
            ) : null}
            {data.snapshot.lagnaSign ? (
              <Badge variant="outline">Lagna · {data.snapshot.lagnaSign}</Badge>
            ) : null}
            {data.snapshot.moonSign ? (
              <Badge variant="outline">Moon · {data.snapshot.moonSign}</Badge>
            ) : null}
            <Badge variant="outline">
              <span
                className={cn(
                  "mr-1.5 h-1.5 w-1.5 rounded-full",
                  data.snapshot.gocharStatus === "live" ? "bg-emerald" : "bg-muted-foreground/50",
                )}
              />
              {data.snapshot.gocharStatus === "live" ? "Live sky" : "Sky offline"}
            </Badge>
          </div>
        </div>

        <div className="border-border/60 bg-background/70 rounded-2xl border p-4 backdrop-blur-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Reading for
              </p>
              <p className="font-display mt-1 text-lg leading-snug sm:text-xl">{dateLabel}</p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                {data.snapshot.datedSamples
                  ? `${data.snapshot.datedSamples} dated chapters`
                  : "Chapter dates resolved"}
              </p>
            </div>
            <span className="border-gold/25 bg-gold/10 text-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
              <CalendarDays className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild size="sm" variant="secondary" className="w-full">
              <Link href={routes.marriageTiming}>Marriage timing</Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ChapterTimeline({
  events,
  totalCount,
  birthDate,
  onOpenDetails,
  category,
  onCategoryChange,
}: {
  events: LifeEventItem[];
  totalCount?: number;
  birthDate?: string | null;
  onOpenDetails: (id: string) => void;
  category: LifeEventCategory | "all";
  onCategoryChange: (category: LifeEventCategory | "all") => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [scrollState, setScrollState] = useState({ left: 0, max: 0 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    setActiveId(null);
  }, [category]);

  const range = useMemo(() => {
    if (events.length === 0 || !now) return null;
    const starts = events.map((e) => new Date(e.startDate).getTime());
    const ends = events.map((e) => new Date(e.endDate).getTime());
    const birthTime = birthDate ? new Date(birthDate).getTime() : NaN;
    const min = Math.min(...starts, Number.isNaN(birthTime) ? Infinity : birthTime, now);
    const max = Math.max(...ends, now);
    const pad = (max - min) * 0.06;
    return { min: min - pad, max: max + pad, span: Math.max(1, max - min + pad * 2) };
  }, [events, birthDate, now]);

  const nowLeft = range ? Math.max(0, Math.min(100, axisPct(now, range))) : 50;

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

  const sortedRows = useMemo(() => sortByStart(events), [events]);
  const rowNumbers = useMemo(
    () => new Map(sortedRows.map((e, index) => [e.id, index + 1])),
    [sortedRows],
  );
  const rows = useMemo(
    () => (showAll ? sortedRows : sortedRows.slice(0, 24)),
    [showAll, sortedRows],
  );
  const legend = useMemo(() => {
    const counts = new Map<LifeEventCategory, number>();
    for (const e of events) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort(
      (a, b) => CATEGORY_CHIP_ORDER.indexOf(a[0]) - CATEGORY_CHIP_ORDER.indexOf(b[0]),
    );
  }, [events]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({ left: el.scrollLeft, max: Math.max(0, el.scrollWidth - el.clientWidth) });
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateScrollState);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [rows.length, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if ((el.scrollLeft <= 0 && event.deltaY < 0) || (el.scrollLeft >= max && event.deltaY > 0)) {
        return;
      }
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scrollPeriod = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(220, el.clientWidth * 0.7),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const scrollToToday = () => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const target = track.offsetLeft + (nowLeft / 100) * track.clientWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
  };

  const toggleChapter = useCallback((id: string) => {
    setActiveId((current) => (current === id ? null : id));
  }, []);

  const prevDisabled = scrollState.left <= 1;
  const nextDisabled = scrollState.left >= scrollState.max - 1;

  if (!range || events.length === 0 || !now) return null;

  const birthTime = birthDate ? new Date(birthDate).getTime() : NaN;
  const birthLeft = Number.isNaN(birthTime)
    ? null
    : Math.max(0, Math.min(100, axisPct(birthTime, range)));
  const labelsCollide = birthLeft !== null && Math.abs(birthLeft - nowLeft) < 14;
  const nowLabel = new Date(now).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const labelCol = "w-[8rem] sm:w-[10rem] lg:w-[11.5rem]";

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-gold/85 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
              <Sparkles className="h-3 w-3" />
              Lifetime overview
            </p>
            <h3 className="font-display mt-1 text-2xl leading-tight sm:text-3xl">
              Chapter Timeline
            </h3>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed sm:text-sm">
              Your whole life on one date scale. Select a bar to read the chapter right inside its
              row.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] tabular-nums">
              {rows.length} of {totalCount ?? sortedRows.length} chapters
            </Badge>
            <Badge className="border-gold/30 bg-gold/10 text-foreground hover:bg-gold/10 border text-[10px]">
              <CircleDot className="text-gold mr-1 h-3 w-3" />
              Today · {nowLabel}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {legend.map(([key, count]) => {
              const colors = CATEGORY_COLORS[key];
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCategoryChange(active ? "all" : key)}
                  aria-pressed={active}
                  aria-label={`Filter by ${CATEGORY_LABELS[key]} (${count} chapters)`}
                  title={`${CATEGORY_LABELS[key]} · ${count} chapters`}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? cn(colors.bg, colors.text, colors.border, "focus-visible:ring-gold/40")
                      : "border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/40",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", colors.bar)} aria-hidden />
                  <span className="hidden sm:inline">{CATEGORY_LABELS[key]}</span>
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          {category !== "all" ? (
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className="text-gold flex shrink-0 items-center gap-1 self-start text-[11px] font-medium underline-offset-2 hover:underline sm:self-auto"
            >
              Clear filter
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 px-0"
              onClick={() => scrollPeriod(-1)}
              disabled={prevDisabled}
              aria-label="Previous period"
              title="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-[11px]"
              onClick={scrollToToday}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 px-0"
              onClick={() => scrollPeriod(1)}
              disabled={nextDisabled}
              aria-label="Next period"
              title="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-[11px]">
            Swipe or scroll inside the track · gold line marks today
          </p>
        </div>
      </div>

      <div className="border-border/60 bg-background relative min-w-0 overflow-hidden rounded-2xl border">
        <div
          ref={scrollRef}
          className="scrollbar-premium max-h-[24rem] overflow-auto [-webkit-overflow-scrolling:touch] lg:max-h-[27rem]"
        >
          <div className="min-w-[34rem] sm:min-w-[40rem] lg:min-w-[46rem]">
            <div className="border-border/60 bg-background/95 sticky top-0 z-20 flex border-b backdrop-blur-sm">
              <div
                className={cn(
                  "text-muted-foreground shrink-0 px-3 py-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
                  labelCol,
                )}
              >
                Chapter
              </div>
              <div ref={trackRef} className="relative min-h-10 min-w-0 flex-1">
                {years.map((year) => {
                  const left = axisPct(new Date(year, 0, 1).getTime(), range);
                  if (left < 1 || left > 99) return null;
                  if (Math.abs(left - nowLeft) < 7) return null;
                  if (birthLeft !== null && Math.abs(left - birthLeft) < 7) return null;
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
                {birthLeft !== null ? (
                  <span
                    className={cn(
                      "text-muted-foreground absolute top-1.5 z-10 -translate-x-1/2 text-[10px] font-semibold tracking-[0.12em] uppercase",
                      labelsCollide && "top-0.5",
                    )}
                    style={{ left: `${birthLeft}%` }}
                  >
                    Born
                  </span>
                ) : null}
                <span
                  className={cn(
                    "text-gold absolute top-1.5 z-10 -translate-x-1/2 text-[10px] font-semibold tracking-[0.12em] uppercase",
                    labelsCollide && "top-6",
                  )}
                  style={{ left: `${nowLeft}%` }}
                >
                  Today
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 left-[8rem] z-[1] sm:left-[10rem] lg:left-[11.5rem]">
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
                {birthLeft !== null ? (
                  <span
                    className="bg-border absolute top-0 bottom-0 z-[2] w-px"
                    style={{ left: `${birthLeft}%` }}
                  />
                ) : null}
                <span
                  className="bg-gold absolute top-0 bottom-0 z-[2] w-px"
                  style={{ left: `${nowLeft}%` }}
                />
              </div>

              <ul>
                {rows.map((e) => {
                  const start = new Date(e.startDate).getTime();
                  const end = new Date(e.endDate).getTime();
                  const left = axisPct(start, range);
                  const width = Math.max(2.4, ((end - start) / range.span) * 100);
                  const clampedLeft = Math.max(0, left);
                  const clampedWidth = Math.min(100 - clampedLeft, width);
                  const colors = CATEGORY_COLORS[e.category];
                  const Icon = CATEGORY_ICONS[e.category];
                  const active = activeId === e.id;
                  const chapterNumber = rowNumbers.get(e.id) ?? 0;
                  const detailId = `timeline-detail-${e.id}`;
                  const rangeLabel = formatChapterRange(e.startDate, e.endDate);
                  const span = formatSpan(e.spanMonths);
                  const pct = scorePct(e.score);
                  const showInBar = clampedWidth >= 18;
                  return (
                    <li
                      key={e.id}
                      className={cn("border-border/40 border-t", active && "bg-gold/5")}
                    >
                      <button
                        type="button"
                        onClick={() => toggleChapter(e.id)}
                        aria-expanded={active}
                        aria-controls={detailId}
                        aria-label={`${active ? "Collapse" : "Expand"} chapter ${chapterNumber}: ${e.title}`}
                        className={cn(
                          "flex w-full text-left transition-colors duration-200",
                          "hover:bg-muted/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          active && "bg-gold/10 hover:bg-gold/10",
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
                            <span className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-[10px] tabular-nums">
                              {String(chapterNumber).padStart(2, "0")} ·{" "}
                              {CATEGORY_LABELS[e.category]}
                              <span className="capitalize">
                                {" "}
                                · {e.phase === "present" ? "current" : e.phase}
                              </span>
                            </span>
                          </span>
                        </span>
                        <span className="relative min-h-12 min-w-0 flex-1 py-2.5 pr-9">
                          <span className="relative block h-6 w-full">
                            <span className="bg-muted/35 absolute inset-y-0 right-0 left-0 rounded-full" />
                            <span
                              className={cn(
                                "absolute inset-y-0 flex items-center overflow-hidden rounded-full pr-2 pl-2",
                                colors.fill,
                                colors.text,
                                e.phase === "past" && "opacity-55",
                                active && "ring-gold/60 shadow-gold/10 shadow-lg ring-1",
                              )}
                              style={{
                                left: `${clampedLeft}%`,
                                width: `${clampedWidth}%`,
                              }}
                            >
                              <span
                                className="pointer-events-none absolute inset-y-0 left-0 bg-white/10"
                                style={{ width: `${pct}%` }}
                                aria-hidden
                              />
                              {showInBar ? (
                                <span className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2">
                                  <span className="truncate text-[10px] font-medium tabular-nums">
                                    {rangeLabel}
                                    {span ? ` · ${span}` : ""}
                                  </span>
                                  <span className="shrink-0 rounded-full bg-black/15 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums">
                                    {pct}%
                                  </span>
                                </span>
                              ) : (
                                <span className="sr-only">{rangeLabel}</span>
                              )}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "border-border/60 bg-background/80 text-muted-foreground absolute top-1/2 right-2 z-[4] flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border backdrop-blur-sm transition-colors",
                              active && "border-gold/40 text-gold",
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                active && "rotate-180",
                              )}
                            />
                          </span>
                        </span>
                      </button>

                      <div
                        id={detailId}
                        aria-hidden={!active}
                        inert={!active}
                        className={cn(
                          "sticky left-0 w-[calc(100vw-2.5rem)] transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none sm:static sm:w-full",
                          active
                            ? "grid grid-rows-[1fr] opacity-100"
                            : "pointer-events-none grid grid-rows-[0fr] opacity-0",
                          reduceMotion && "duration-0",
                        )}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="border-border/50 bg-muted/10 border-t px-4 py-4 sm:px-5 lg:px-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge variant="outline" className="text-[9px] tabular-nums">
                                    #{String(chapterNumber).padStart(2, "0")}
                                  </Badge>
                                  <Badge
                                    className={cn(
                                      colors.bg,
                                      colors.text,
                                      colors.border,
                                      "border text-[9px]",
                                    )}
                                  >
                                    {CATEGORY_LABELS[e.category]}
                                  </Badge>
                                  <Badge variant="outline" className="text-[9px] capitalize">
                                    {e.phase === "present" ? "current" : e.phase}
                                  </Badge>
                                </div>
                                <h4 className="font-display mt-2 text-xl leading-snug">
                                  {e.title}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleChapter(e.id)}
                                aria-label={`Collapse details for ${e.title}`}
                                className="border-border/60 bg-background/70 hover:bg-muted text-muted-foreground focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                              >
                                <ChevronDown className="h-4 w-4 rotate-180" />
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                              <DetailCell label="Starts" value={formatDateLabel(e.startDate)} />
                              <DetailCell label="Ends" value={formatDateLabel(e.endDate)} />
                              <DetailCell label="Duration" value={span || "—"} />
                            </div>

                            <div className="border-border/50 bg-background/60 mt-3 rounded-xl border p-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                    Probability
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {e.probabilityLabel}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="bg-muted/70 hidden h-2 w-24 overflow-hidden rounded-full sm:block lg:w-36">
                                    <span
                                      className={cn(
                                        "block h-full rounded-full",
                                        e.score >= 80 ? "bg-gold" : "bg-primary/80",
                                      )}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </span>
                                  <span className="font-display text-xl tabular-nums">{pct}%</span>
                                  <ScoreRing value={e.score} compact />
                                </div>
                              </div>
                              <span className="bg-muted/70 mt-2 block h-1.5 overflow-hidden rounded-full sm:hidden">
                                <span
                                  className={cn(
                                    "block h-full rounded-full",
                                    e.score >= 80 ? "bg-gold" : "bg-primary/80",
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              <div className="border-border/50 bg-background/50 rounded-xl border p-3">
                                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                  Planetary period
                                </p>
                                <p className="mt-1.5 text-xs font-medium">{e.dashaLabel}</p>
                                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                                  {e.gocharNote || "No live gochar note for this chapter."}
                                </p>
                              </div>
                              <div className="border-border/50 bg-background/50 rounded-xl border p-3">
                                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                  Expected themes
                                </p>
                                <p className="mt-1.5 text-xs leading-relaxed">{e.reason}</p>
                                <p className="text-muted-foreground mt-1 text-[11px]">
                                  {e.detailLabel ? `${e.detailLabel} · ` : ""}
                                  {CATEGORY_LABELS[e.category]}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              <div className="border-border/50 bg-background/50 rounded-xl border p-3">
                                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                  Astrological reading
                                </p>
                                <p className="mt-1.5 text-xs leading-relaxed">{e.explain}</p>
                              </div>
                              <div className="border-border/50 bg-background/50 rounded-xl border p-3">
                                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                                  Guidance
                                </p>
                                <p className="mt-1.5 text-xs leading-relaxed">{e.acceptLine}</p>
                                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                                  {e.suggestion}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={northHorizonHref({ at: e.skyAt || e.startDate })}>
                                  <Orbit className="h-3.5 w-3.5" />
                                  View sky
                                </Link>
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => onOpenDetails(e.id)}
                              >
                                Open full note
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {sortedRows.length > 24 ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Show fewer chapters" : `Show all ${sortedRows.length} chapters`}
        </Button>
      ) : null}
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        The Born line is your birth date; the gold line is today. Past chapters sit quieter. Colors
        show themes, not guarantees.
      </p>
    </div>
  );
}

function EventCard({
  e,
  sequence,
  open,
  onToggle,
  showPhase,
}: {
  e: LifeEventItem;
  sequence?: number;
  open: boolean;
  onToggle: (id: string) => void;
  showPhase?: boolean;
}) {
  const Icon = CATEGORY_ICONS[e.category];
  const colors = CATEGORY_COLORS[e.category];
  const pct = scorePct(e.score);
  const isMarriage = e.category === "marriage";

  return (
    <article
      className={cn(
        "border-border/60 bg-card overflow-hidden rounded-2xl border transition-all duration-300",
        isMarriage ? "border-gold/30" : "hover:border-gold/25 hover:shadow-soft",
        open && "shadow-soft",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(e.id)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
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
        <span className="min-w-0 flex-1 space-y-2">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {sequence ? (
              <span className="text-muted-foreground text-[10px] font-semibold tabular-nums">
                {String(sequence).padStart(2, "0")}
              </span>
            ) : null}
            <span className="text-sm leading-snug font-medium sm:text-base">{e.title}</span>
            {showPhase ? (
              <Badge variant="outline" className="text-[9px] tracking-wider uppercase">
                {e.phase === "present" ? "now" : e.phase}
              </Badge>
            ) : null}
            {e.source === "user-asserted" ? (
              <Badge className="border-gold/40 bg-gold/15 text-gold text-[9px]">Confirmed</Badge>
            ) : null}
          </span>
          <span className="text-muted-foreground block text-xs">
            {e.window}
            {e.ageHint ? ` · ${e.ageHint}` : ""}
          </span>
          <span className="flex flex-wrap items-center gap-2">
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
        <span className="flex shrink-0 items-center gap-2">
          <ScoreRing value={pct} />
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          open
            ? "grid grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-border/60 mx-4 space-y-3 border-t py-4 sm:mx-5">
            <p className="text-sm leading-relaxed">{e.explain}</p>
            {e.gocharNote ? (
              <p className="text-primary/90 flex gap-2 text-xs leading-relaxed">
                <Orbit className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {e.gocharNote}
              </p>
            ) : null}
            <div
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
                isMarriage ? "border-gold/25 bg-gold/5" : "border-border/60 bg-muted/25",
              )}
            >
              <span className="text-gold font-semibold">Accept: </span>
              {e.acceptLine}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{e.suggestion}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-[11px]">
                {e.dashaLabel} · {e.probabilityLabel} · {pct}/100 directional score
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href={northHorizonHref({ at: e.skyAt || e.startDate })}>View sky</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkyPlanner({
  payload,
  from,
  to,
  onApply,
}: {
  payload: VedicCalendarPayload | null | undefined;
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
}) {
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [category, setCategory] = useState<VedicEventCategory | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDraftFrom(from || payload?.config.from.slice(0, 10) || "");
    setDraftTo(to || payload?.config.to.slice(0, 10) || "");
  }, [from, to, payload?.config.from, payload?.config.to]);

  useEffect(() => {
    setSelectedDay(null);
  }, [payload?.config.from, payload?.config.to]);

  const days = payload?.dailyPanchanga ?? [];

  const eventCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const event of payload?.events ?? []) {
      map[event.localDate] = (map[event.localDate] ?? 0) + 1;
    }
    return map;
  }, [payload]);

  const events = useMemo(() => {
    const list = (payload?.events ?? []).filter(
      (event) =>
        (category === "all" || event.category === category) &&
        (!selectedDay || event.localDate === selectedDay),
    );
    return expanded ? list : list.slice(0, 12);
  }, [payload, category, selectedDay, expanded]);

  const totalFiltered = useMemo(
    () =>
      (payload?.events ?? []).filter(
        (event) =>
          (category === "all" || event.category === category) &&
          (!selectedDay || event.localDate === selectedDay),
      ).length,
    [payload, category, selectedDay],
  );

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Sky events · calculated"
        title="The sky, day by day"
        description="Swiss Ephemeris transits, crossings, and Panchanga shifts — kept separate from your life chapters."
        action={
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="text-muted-foreground mb-1 block text-[10px] tracking-wider uppercase">
                From
              </span>
              <input
                type="date"
                value={draftFrom}
                onChange={(event) => setDraftFrom(event.target.value)}
                className="border-border bg-background focus:border-gold/50 focus:ring-gold/15 rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1 block text-[10px] tracking-wider uppercase">
                To
              </span>
              <input
                type="date"
                value={draftTo}
                onChange={(event) => setDraftTo(event.target.value)}
                className="border-border bg-background focus:border-gold/50 focus:ring-gold/15 rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-2"
              />
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!draftFrom || !draftTo || draftTo < draftFrom}
              onClick={() => onApply(draftFrom, draftTo)}
            >
              Apply
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Surface className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Panchanga calendar
              </p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                {payload
                  ? `${payload.config.ayanamsha} · ${payload.config.timezone} · ${formatDateLabel(payload.config.from.slice(0, 10))} – ${formatDateLabel(payload.config.to.slice(0, 10))}`
                  : "Choose a range to calculate the sky."}
              </p>
            </div>
            {selectedDay ? (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-gold text-[11px] font-medium underline-offset-2 hover:underline"
              >
                Clear {formatDateLabel(selectedDay)}
              </button>
            ) : null}
          </div>

          {days.length ? (
            <div className="grid grid-cols-7 gap-1.5">
              {days.slice(0, 14).map((day) => {
                const date = new Date(`${day.localDate}T00:00:00.000Z`);
                const weekday = date.toLocaleDateString("en-GB", {
                  weekday: "short",
                  timeZone: "UTC",
                });
                const dayNumber = date.getUTCDate();
                const active = selectedDay === day.localDate;
                const count = eventCounts[day.localDate] ?? 0;
                return (
                  <button
                    key={day.localDate}
                    type="button"
                    onClick={() => setSelectedDay(active ? null : day.localDate)}
                    aria-pressed={active}
                    className={cn(
                      "border-border/60 bg-muted/20 min-w-0 rounded-xl border px-1 py-2 text-center transition-all",
                      active
                        ? "border-gold/50 bg-gold/10 shadow-gold"
                        : "hover:border-gold/30 hover:bg-gold/5",
                    )}
                  >
                    <span className="text-muted-foreground block text-[9px] tracking-wide uppercase">
                      {weekday}
                    </span>
                    <span className="font-display block text-lg leading-tight tabular-nums">
                      {dayNumber}
                    </span>
                    <span className="text-muted-foreground block truncate text-[9px]">
                      {day.tithi.name}
                    </span>
                    <span className="mt-1 flex h-1.5 items-center justify-center gap-0.5">
                      {count > 0 ? (
                        <>
                          <span className="bg-gold h-1.5 w-1.5 rounded-full" />
                          {count > 1 ? (
                            <span className="text-muted-foreground text-[9px] tabular-nums">
                              {count}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No Panchanga days in this range.</p>
          )}

          <p className="text-muted-foreground text-[10px] leading-relaxed">
            Values use {days[0]?.basis === "sunrise" ? "sunrise" : "local midnight"} where sunrise
            is unavailable. Tap a day to read only its events.
          </p>
        </Surface>

        <Surface className="space-y-3">
          <div className="scrollbar-hidden flex gap-1.5 overflow-x-auto pb-0.5">
            {(["all", ...ASTRO_CATEGORY_ORDER] as Array<VedicEventCategory | "all">).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  category === key
                    ? "border-gold/40 bg-gold/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {key === "all" ? "All events" : ASTRO_CATEGORY_META[key].label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-[11px]">
              {totalFiltered} {totalFiltered === 1 ? "event" : "events"}
              {selectedDay ? ` on ${formatDateLabel(selectedDay)}` : " in range"}
            </p>
          </div>

          {events.length ? (
            <ul className="scrollbar-premium max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {events.map((event) => {
                const meta = ASTRO_CATEGORY_META[event.category];
                const date = new Date(`${event.localDate}T00:00:00.000Z`);
                return (
                  <li key={event.id} className="border-border/60 bg-muted/15 rounded-xl border">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none gap-3 p-2.5">
                        <span className="border-border/50 bg-background min-w-[2.75rem] rounded-lg border py-1 text-center">
                          <span className="text-muted-foreground block text-[9px] tracking-wide uppercase">
                            {date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
                          </span>
                          <span className="font-display block text-lg leading-none tabular-nums">
                            {date.getUTCDate()}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full", meta.dot)}
                              aria-hidden
                            />
                            <span className="text-xs font-medium">{event.name}</span>
                            <span className="text-muted-foreground text-[10px]">{meta.label}</span>
                          </span>
                          <span className="text-muted-foreground mt-1 block text-[10px] tabular-nums">
                            {event.localTime} {event.timezone}
                            {event.sign ? ` · ${event.sign}` : ""}
                          </span>
                        </span>
                        <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="border-border/50 text-muted-foreground mt-1 space-y-1.5 border-t px-3 py-2 text-[11px] leading-relaxed">
                        <p>{event.description}</p>
                        <p className="text-[10px]">{event.calculationContext}</p>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-muted-foreground flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed text-center text-xs">
              No events match this filter.
            </div>
          )}

          {totalFiltered > 12 || expanded ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show fewer events" : "Show all events"}
            </Button>
          ) : null}

          {payload?.limitations?.length ? (
            <ul className="text-muted-foreground space-y-1 border-t pt-2 text-[10px] leading-relaxed">
              {payload.limitations.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          ) : null}
        </Surface>
      </div>
    </section>
  );
}

const MemoHeroPanel = memo(HeroPanel);
const MemoChapterTimeline = memo(ChapterTimeline);
const MemoEventCard = memo(EventCard);
const MemoSkyPlanner = memo(SkyPlanner);

export default function CalendarPage() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<CalendarPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TimeTab>("all");
  const [category, setCategory] = useState<LifeEventCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [astroFrom, setAstroFrom] = useState("");
  const [astroTo, setAstroTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (astroFrom) params.set("from", astroFrom);
      if (astroTo) params.set("to", astroTo);
      const query = params.toString();
      const res = await fetch(`/api/calendar${query ? `?${query}` : ""}`, { cache: "no-store" });
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
  }, [astroFrom, astroTo]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10 * 60 * 1000);
    return () => window.clearInterval(timer);
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
    if (!data) return { all: 0, past: 0, present: 0, future: 0, high: 0 };
    const past = filterCat(data.byPhase.past);
    const present = filterCat(data.byPhase.present);
    const future = filterCat(data.byPhase.future);
    const high = filterCat(data.highProbability ?? []);
    return {
      all: past.length + present.length + future.length,
      past: past.length,
      present: present.length,
      future: future.length,
      high: high.length,
    };
  }, [data, filterCat]);

  const tabEvents = useMemo(() => {
    if (!data) return [];
    if (tab === "all") {
      return sortByStart([
        ...filterCat(data.byPhase.past),
        ...filterCat(data.byPhase.present),
        ...filterCat(data.byPhase.future),
      ]);
    }
    return sortByStart(filterCat(data.byPhase[tab]));
  }, [data, tab, filterCat]);

  const timelineEvents = useMemo(() => {
    if (!data) return [];
    return sortByStart([
      ...filterCat(data.byPhase.past),
      ...filterCat(data.byPhase.present),
      ...filterCat(data.byPhase.future),
    ]);
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

  const openChapterDetails = useCallback(
    (id: string) => {
      const event = timelineEvents.find((e) => e.id === id);
      if (!event) return;
      setTab(event.phase);
      setOpenId(id);
      requestAnimationFrame(() => {
        document.getElementById(`chapter-${id}`)?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    },
    [reduceMotion, timelineEvents],
  );

  const toggleChapterCard = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  const handleRefresh = useCallback(() => {
    void load();
  }, [load]);

  const handleApplyAstro = useCallback((nextFrom: string, nextTo: string) => {
    setAstroFrom(nextFrom);
    setAstroTo(nextTo);
  }, []);

  return (
    <div className="relative min-w-0 space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Life calendar"
        title="Calendar"
        description="Your dasha chapters and the calculated sky, read together — but never confused."
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
          <MemoHeroPanel data={data} loading={loading} onRefresh={handleRefresh} />

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {(
              [
                {
                  key: "all" as TimeTab,
                  label: "Whole life",
                  value: counts.all,
                  hint: "chapters",
                  icon: LayoutList,
                  color: "text-gold",
                  tint: "bg-gold/10",
                },
                {
                  key: "present" as TimeTab,
                  label: "Right now",
                  value: counts.present,
                  hint: "active theme",
                  icon: CircleDot,
                  color: "text-emerald-500",
                  tint: "bg-emerald/10",
                },
                {
                  key: "future" as TimeTab,
                  label: "Ahead",
                  value: counts.future,
                  hint: "to plan for",
                  icon: CalendarClock,
                  color: "text-sky-500",
                  tint: "bg-sky-500/10",
                },
                {
                  key: "past" as TimeTab,
                  label: "High likelihood",
                  value: counts.high,
                  hint: "directional",
                  icon: TrendingUp,
                  color: "text-primary",
                  tint: "bg-primary/10",
                },
              ] as const
            ).map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => setTab(stat.key)}
                className={cn(
                  "group border-border/60 bg-card relative min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                  tab === stat.key
                    ? "border-gold/40 shadow-gold"
                    : "hover:border-gold/25 hover:-translate-y-0.5",
                )}
              >
                <span
                  className={cn(
                    "absolute -top-8 -right-8 h-20 w-20 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100",
                    stat.tint,
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    stat.tint,
                    stat.color,
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </span>
                <p className="text-muted-foreground mt-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {stat.label}
                </p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="font-display text-3xl leading-none tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground text-[10px]">{stat.hint}</span>
                </div>
              </button>
            ))}
          </div>

          <Surface className="space-y-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeading
                eyebrow="Desh · Kaal · Patra"
                title="Your lifetime map"
                description="Place, time, and vessel shape every reading below."
              />
              <Button asChild size="sm" variant="ghost">
                <Link href={routes.gochar}>
                  Live gochar
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <MemoChapterTimeline
              events={timelineEvents}
              totalCount={data.events.length}
              birthDate={data.context.birthDate}
              onOpenDetails={openChapterDetails}
              category={category}
              onCategoryChange={setCategory}
            />

            <div className="border-border/50 grid gap-2.5 border-t pt-4 sm:grid-cols-3">
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
                <div
                  key={pillar.sanskrit}
                  className="border-border/60 bg-muted/15 flex min-w-0 gap-3 rounded-xl border p-3"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      pillar.bg,
                    )}
                  >
                    <pillar.Icon className={cn("h-4 w-4", pillar.accent)} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm leading-none">
                      {pillar.sanskrit}
                      <span className="text-muted-foreground ml-1.5 text-[10px] tracking-wider uppercase">
                        {pillar.english}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          {data.snapshot.gocharHighlights?.length || data.gocharSummary ? (
            <GlassCard className="border-border/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  <Orbit className="h-3.5 w-3.5" />
                  Live gochar
                </p>
                {data.snapshot.gocharAsOf ? (
                  <p className="text-muted-foreground text-[11px]">
                    Sampled{" "}
                    {new Date(data.snapshot.gocharAsOf).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                ) : null}
              </div>
              {data.snapshot.gocharHighlights?.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {data.snapshot.gocharHighlights.slice(0, 4).map((h) => (
                    <li
                      key={h}
                      className="border-border/50 bg-muted/15 rounded-xl border px-3 py-2 text-xs leading-relaxed"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">{data.gocharSummary}</p>
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

          <MemoSkyPlanner
            payload={data.astrologyCalendar}
            from={astroFrom}
            to={astroTo}
            onApply={handleApplyAstro}
          />

          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
            <div className="min-w-0 space-y-4">
              <SectionHeading
                eyebrow="Life chapters"
                title="Read your chapters"
                description="One theme at a time, with the dasha note and a practical next step."
              />

              <Tabs value={tab} onValueChange={(v) => setTab(v as TimeTab)}>
                <div className="bg-background/90 sticky top-0 z-10 -mx-1 space-y-3 px-1 py-2 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                  <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl p-1">
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
                            <Icon className={cn("h-3.5 w-3.5", meta.accent)} />
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
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
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
                          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                            {meta.blurb}
                          </p>
                        </div>
                        <Badge variant="outline" className="tabular-nums">
                          {list.length} chapters
                        </Badge>
                      </div>
                      {list.length === 0 ? (
                        <div className="border-border/60 bg-card flex flex-col items-center rounded-2xl border border-dashed py-10 text-center">
                          <CalendarRange className="text-muted-foreground/40 mb-2 h-6 w-6" />
                          <p className="text-muted-foreground text-sm">
                            No {meta.label.toLowerCase()} chapters for this theme.
                          </p>
                          <button
                            type="button"
                            className="text-gold mt-2 text-xs font-medium underline-offset-2 hover:underline"
                            onClick={() => setCategory("all")}
                          >
                            Show all themes
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-2.5">
                          {list.map((e, index) => (
                            <li
                              key={e.id}
                              id={`chapter-${e.id}`}
                              className="scroll-mt-28 sm:scroll-mt-4"
                            >
                              <MemoEventCard
                                e={e}
                                sequence={index + 1}
                                open={openId === e.id}
                                onToggle={toggleChapterCard}
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
                <div className="border-gold/30 bg-gold/5 relative overflow-hidden rounded-2xl border p-4">
                  <span
                    className="bg-gold/10 pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl"
                    aria-hidden
                  />
                  <div className="relative">
                    <p className="text-gold flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                      <Heart className="h-3.5 w-3.5" />
                      Marriage now
                    </p>
                    <p className="font-display mt-2 text-xl leading-snug">{data.marryNow.title}</p>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                      {data.marryNow.reason}
                    </p>
                    <Badge variant="outline" className="mt-3">
                      {data.marryNow.verdict}
                    </Badge>
                  </div>
                </div>
              ) : null}

              {data.marriageWindows?.length ? (
                <Surface className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg">Marriage windows</h3>
                    <Heart className="text-rose h-4 w-4" />
                  </div>
                  <ul className="space-y-2">
                    {data.marriageWindows.slice(0, 3).map((w) => (
                      <li
                        key={`${w.label}-${w.window}`}
                        className="border-border/60 bg-muted/15 rounded-xl border p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium">{w.label}</p>
                          <span className="text-gold text-[10px] font-semibold tabular-nums">
                            {scorePct(w.score)}%
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">{w.window}</p>
                        {w.startDate ? (
                          <Link
                            href={northHorizonHref({ at: w.startDate, intent: "marriage" })}
                            className="text-primary mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium underline-offset-2 hover:underline"
                          >
                            View sky
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={routes.marriageTiming}>Full timing</Link>
                  </Button>
                </Surface>
              ) : null}

              <SpouseTendencyPanel tendencies={data.spouseTendencies} compact />

              <Surface className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="border-border/60 bg-muted/30 flex h-9 w-9 items-center justify-center rounded-xl border">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-none">How to read</h3>
                    <p className="text-muted-foreground mt-1 text-[10px] tracking-wider uppercase">
                      Calendar guide
                    </p>
                  </div>
                </div>
                <ul className="text-muted-foreground space-y-2 text-xs leading-relaxed">
                  <li>Lifetime shows every chapter from birth onward in date order.</li>
                  <li>Open a chapter for the dasha, dated sky note, and what to accept.</li>
                  <li>Scores are directional; confirmed chapters come from your own record.</li>
                </ul>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  <Button asChild size="sm" variant="ai" className="w-full">
                    <Link href={routes.aiInsights}>
                      <Bot className="h-3.5 w-3.5" />
                      Ask AI Guru
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={routes.dasha}>Dashas</Link>
                  </Button>
                </div>
              </Surface>
            </aside>
          </div>

          <p className="text-muted-foreground pb-2 text-[11px] leading-relaxed sm:text-xs">
            {data.methodology}
          </p>
        </>
      ) : null}
    </div>
  );
}
