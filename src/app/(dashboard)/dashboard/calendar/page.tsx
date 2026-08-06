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
  ChevronRight,
  TrendingUp,
  Target,
  BookOpen,
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
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS: Record<
  LifeEventCategory,
  { bg: string; text: string; border: string; light: string }
> = {
  marriage: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/30", light: "bg-rose/5" },
  career: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/30",
    light: "bg-blue-500/5",
  },
  job: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/30",
    light: "bg-cyan-500/5",
  },
  education: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    light: "bg-amber-500/5",
  },
  wealth: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    light: "bg-emerald-500/5",
  },
  property: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/30",
    light: "bg-orange-500/5",
  },
  travel: {
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/30",
    light: "bg-sky-500/5",
  },
  health: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
    light: "bg-red-500/5",
  },
  spiritual: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/30",
    light: "bg-purple-500/5",
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

const TAB_ORDER: TimeTab[] = ["all", "present", "past", "future"];

const TAB_META: Record<
  TimeTab,
  { label: string; blurb: string; Icon: typeof CircleDot; accent: string }
> = {
  all: {
    label: "All",
    blurb: "Major life chapters across past, current, and future — one theme per Antardasha.",
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
  if (pct >= 80)
    return "border-gold/50 bg-gold/15 text-foreground shadow-[0_0_10px_-3px_rgba(234,179,8,0.3)]";
  return "border-primary/35 bg-primary/10 text-foreground";
}

function LikelihoodBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const pct = likelihoodPct(score);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-0.5 rounded-full border px-2 py-1 tabular-nums transition-all duration-200 sm:px-2.5",
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

function ChipScroller({
  children,
  activeCategory,
}: {
  children: ReactNode;
  activeCategory: string;
}) {
  return (
    <div className="scrollbar-hidden -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 [-webkit-overflow-scrolling:touch] sm:gap-2">
      {children}
    </div>
  );
}

function EventCard({
  e,
  showPhase,
  index,
}: {
  e: LifeEventItem;
  showPhase?: boolean;
  index?: number;
}) {
  const Icon = CATEGORY_ICONS[e.category];
  const pct = likelihoodPct(e.score);
  const colors = CATEGORY_COLORS[e.category];
  const isMarriage = e.category === "marriage";
  const isHigh = pct >= 80;

  return (
    <li
      className={cn(
        "group from-background/80 to-muted/10 relative min-w-0 rounded-2xl border bg-gradient-to-br px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4",
        "hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5",
        isMarriage
          ? "border-gold/40 from-gold/5 to-background/80 bg-gradient-to-br shadow-[0_0_25px_-8px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_-8px_rgba(234,179,8,0.25)]"
          : "border-border/60 hover:border-border",
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-11 sm:w-11",
            "from-background to-muted/30 border-border/50 border bg-gradient-to-br",
            isMarriage && "border-gold/30 from-gold/10 to-background bg-gradient-to-br",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-colors sm:h-5 sm:w-5",
              isMarriage ? "text-gold" : "text-foreground/80",
            )}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2 sm:space-y-2.5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "text-[13px] leading-snug font-medium break-words sm:text-sm md:text-[0.95rem]",
                    isMarriage && "text-gold/90",
                  )}
                >
                  {e.title}
                </p>
                {showPhase ? (
                  <Badge variant="outline" className="text-[9px] tracking-wider uppercase">
                    {e.phase === "present" ? "current" : e.phase}
                  </Badge>
                ) : null}
              </div>
              {isMarriage && (
                <div className="flex items-center gap-1.5">
                  <Heart className="text-rose/70 h-3 w-3" />
                  <span className="text-rose/80 text-[10px] font-medium tracking-wider uppercase">
                    Vivaha window
                  </span>
                </div>
              )}
            </div>
            <LikelihoodBadge score={e.score} />
          </div>

          <div className="bg-muted/60 relative h-1.5 w-full overflow-hidden rounded-full sm:h-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                isHigh
                  ? "from-gold/70 to-gold bg-gradient-to-r shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                  : "from-primary/60 to-primary/80 bg-gradient-to-r",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="text-[10px] font-medium">
              Major period
            </Badge>
            {e.detailLabel ? (
              <Badge
                variant="outline"
                className={cn("text-[10px]", isMarriage && "border-gold/30 text-gold/80")}
              >
                {e.detailLabel}
              </Badge>
            ) : null}
            {typeof e.spanMonths === "number" ? (
              <Badge variant="outline" className="text-[10px]">
                {e.spanMonths >= 12 ? `~${Math.round(e.spanMonths / 12)} yr` : `${e.spanMonths} mo`}
              </Badge>
            ) : null}
            {isHigh && (
              <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px]">
                High probability
              </Badge>
            )}
          </div>
          <div className="space-y-1.5">
            <p
              className={cn(
                "text-[13px] leading-snug font-medium sm:text-sm",
                isMarriage && "text-foreground/90",
              )}
            >
              <span className="break-words">{e.window}</span>
              {e.ageHint ? (
                <span className="text-muted-foreground font-normal"> · {e.ageHint}</span>
              ) : null}
            </p>
            <p className="text-foreground/85 text-[11px] leading-relaxed break-words sm:text-xs">
              {e.explain}
            </p>
            {e.gocharNote ? (
              <p className="text-primary/90 text-[11px] leading-relaxed break-words sm:text-xs">
                <Orbit className="mr-1 inline h-3 w-3 shrink-0" />
                {e.gocharNote}
              </p>
            ) : null}
            <div
              className={cn(
                "rounded-lg border px-2.5 py-2 sm:px-3",
                isMarriage ? "border-gold/20 bg-gold/5" : "border-muted/40 bg-muted/20",
              )}
            >
              <p
                className={cn(
                  "text-[11px] leading-relaxed font-medium break-words sm:text-xs",
                  isMarriage ? "text-gold/90" : "text-primary/90",
                )}
              >
                Accept: {e.acceptLine}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-muted-foreground text-[10px] leading-relaxed break-words sm:text-[11px] md:text-xs">
              {e.dashaLabel} · {e.detailLabel || CATEGORY_LABELS[e.category]} · ~{pct}% likelihood
            </p>
          </div>
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
function EventScrollPanel({
  total,
  children,
  phase,
}: {
  total: number;
  children: ReactNode;
  phase?: TimeTab;
}) {
  return (
    <div className="border-border/50 bg-card/30 relative min-w-0 overflow-hidden rounded-2xl border">
      <div className="border-border/40 bg-background/80 flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-[11px]">
          {total} major chapter{total === 1 ? "" : "s"}
        </p>
        {total > 4 ? (
          <p className="text-muted-foreground text-[10px] sm:text-[11px]">Scroll to explore</p>
        ) : null}
      </div>
      <div
        className={cn(
          "scrollbar-premium overflow-y-auto overscroll-contain",
          "max-h-[min(48dvh,20rem)] sm:max-h-[min(46dvh,24rem)] md:max-h-[min(48dvh,28rem)]",
          "lg:max-h-[min(52dvh,32rem)] xl:max-h-[min(54dvh,36rem)]",
          "space-y-2.5 p-2.5 pb-5 sm:space-y-3 sm:p-3.5 sm:pb-6",
        )}
      >
        {children}
      </div>
      {total > 4 ? (
        <div
          aria-hidden
          className="from-card/95 pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent"
        />
      ) : null}
    </div>
  );
}

function MarriageWindowBanner({
  windows,
  chapters,
  marryNow,
}: {
  windows: CalendarPayload["marriageWindows"];
  chapters?: LifeEventItem[];
  marryNow?: CalendarPayload["marryNow"];
}) {
  const active = (windows || []).filter((w) => w.phase === "present" || w.phase === "future");
  const future = (windows || []).filter((w) => w.phase === "future");
  const past = (windows || []).filter((w) => w.phase === "past");
  const chapterActive = (chapters || []).filter(
    (e) => e.phase === "present" || e.phase === "future",
  );
  const allWindows = [...active, ...future.slice(0, 2), ...past.slice(0, 1)];
  if (!allWindows.length && !chapterActive.length) return null;

  const top = allWindows[0] || null;
  const topChapter = chapterActive[0] || null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-gold/40 from-gold/10 min-w-0 overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-4 shadow-[0_0_40px_-12px_rgba(234,179,8,0.2)] sm:p-5 lg:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-gold/90 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]">
            <Heart className="h-3.5 w-3.5 shrink-0" />
            {top || topChapter ? "Major marriage window" : "Marriage timing"}
          </p>
          <p className="font-display text-lg leading-snug sm:text-xl lg:text-2xl">
            {marryNow?.title ||
              top?.label ||
              topChapter?.title ||
              "Marriage predictions on your chart"}
          </p>
        </div>
        {top || topChapter ? (
          <LikelihoodBadge score={top?.score ?? topChapter?.score ?? 70} />
        ) : null}
      </div>

      {top ? (
        <div className="border-gold/30 bg-background/60 mb-3 rounded-xl border px-3.5 py-3 sm:mb-4 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[13px] font-medium sm:text-sm">{top.window}</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed sm:text-xs">
                {top.reason}
              </p>
            </div>
            {top.score >= 75 && (
              <Badge className="bg-gold/15 text-gold border-gold/30 shrink-0 text-[10px]">
                Prime
              </Badge>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2 sm:px-3">
            <Target className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <p className="text-[11px] font-medium text-emerald-700 sm:text-xs dark:text-emerald-300">
              Accept: sincere proposals, family meetings, and alliance steps in this window.
            </p>
          </div>
        </div>
      ) : topChapter ? (
        <div className="border-gold/30 bg-background/60 mb-3 rounded-xl border px-3.5 py-3 sm:mb-4 sm:px-4 sm:py-3.5">
          <p className="text-[13px] font-medium sm:text-sm">{topChapter.window}</p>
          <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed sm:text-xs">
            {topChapter.explain}
          </p>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2 sm:px-3">
            <Target className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <p className="text-[11px] font-medium text-emerald-700 sm:text-xs dark:text-emerald-300">
              Accept: {topChapter.acceptLine}
            </p>
          </div>
        </div>
      ) : null}

      {allWindows.length > 1 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allWindows.slice(1, 6).map((w, i) => (
            <div
              key={`${w.label}-${i}`}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-[11px] transition-colors sm:text-xs",
                w.phase === "present"
                  ? "border-gold/40 bg-gold/5"
                  : w.phase === "future"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/40 bg-background/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{w.label}</p>
                <Badge
                  variant={w.phase === "present" ? "default" : "outline"}
                  className="text-[9px] uppercase"
                >
                  {w.phase}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{w.window}</p>
            </div>
          ))}
        </div>
      ) : null}

      {chapterActive.length > 0 ? (
        <div className="border-gold/20 mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
          <p className="text-gold/80 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
            Marriage chapters in your timeline
          </p>
          <ul className="space-y-2">
            {chapterActive.slice(0, 3).map((ch, i) => (
              <li key={`ch-${i}`} className="flex items-start gap-2 text-[11px] sm:text-xs">
                <ChevronRight className="text-gold/60 mt-0.5 h-3 w-3 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">{ch.title}</span>
                  <span className="text-muted-foreground"> · {ch.window}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.section>
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
  marriageChapters?: LifeEventItem[];
  marryNow?: {
    score: number;
    title: string;
    reason: string;
    verdict: string;
  };
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
    <div className="relative min-w-0 space-y-5 sm:space-y-6 lg:space-y-8">
      <PageHeader
        className="mb-5 sm:mb-6 md:mb-8"
        eyebrow="VedaMilan AI · Life calendar"
        title="Calendar"
        description="Major life chapters with marriage windows flagged — Desh–Kaal–Patra filtered by your place, age, and chart capacity."
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
          {/* Hero Stats & Info */}
          <section className="border-border/60 bg-card/40 min-w-0 overflow-hidden rounded-2xl border p-4 sm:rounded-3xl sm:p-5 lg:p-6">
            <div className="mb-4 flex flex-col gap-4 sm:mb-5 md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="max-w-2xl min-w-0 space-y-2">
                <p className="text-gold/85 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]">
                  <CalendarRange className="h-3.5 w-3.5 shrink-0" />
                  <span>Classical filter · Desh–Kaal–Patra</span>
                </p>
                <h1 className="font-display text-xl leading-snug text-balance sm:text-2xl lg:text-3xl">
                  Place, time, and capacity shape which windows apply
                </h1>
                <p className="text-muted-foreground max-w-xl text-xs leading-relaxed sm:text-sm">
                  Your life calendar shows only major multi-month chapters — the strongest
                  Antardasha themes filtered by age, location, and current transits.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 md:max-w-[16rem] md:justify-end lg:max-w-xs">
                {data.snapshot.lagnaSign ? (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    Lagna · {data.snapshot.lagnaSign}
                  </Badge>
                ) : null}
                {data.snapshot.moonSign ? (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    Moon · {data.snapshot.moonSign}
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

            {/* Quick Stats */}
            <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-5 sm:gap-3 md:grid-cols-6">
              {(
                [
                  {
                    label: "Total",
                    value: (Object.values(data.byPhase).flat() as LifeEventItem[]).length,
                    icon: LayoutList,
                    color: "text-foreground",
                  },
                  {
                    label: "Current",
                    value: data.byPhase.present.length,
                    icon: CircleDot,
                    color: "text-emerald-500",
                  },
                  {
                    label: "Future",
                    value: data.byPhase.future.length,
                    icon: Sparkle,
                    color: "text-sky-500",
                  },
                  {
                    label: "Past",
                    value: data.byPhase.past.length,
                    icon: History,
                    color: "text-muted-foreground",
                  },
                  {
                    label: "Marriage",
                    value: data.marriageWindows?.length || 0,
                    icon: Heart,
                    color: "text-rose",
                  },
                  {
                    label: "High prob.",
                    value: data.highProbability?.length || 0,
                    icon: TrendingUp,
                    color: "text-gold",
                  },
                ] as const
              ).map((stat) => (
                <div
                  key={stat.label}
                  className="border-border/50 bg-background/50 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <stat.icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", stat.color)} />
                    <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                      {stat.label}
                    </span>
                  </div>
                  <p className="font-display mt-1 text-lg leading-none sm:text-xl">{stat.value}</p>
                </div>
              ))}
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
                    accent: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    key: "kaal",
                    sanskrit: "Kaal",
                    english: "Time",
                    Icon: Hourglass,
                    body: data.context.timeNote.replace(/^Kaala?\s*[—–-]\s*/i, ""),
                    accent: "text-sky-500",
                    bg: "bg-sky-500/10",
                  },
                  {
                    key: "patra",
                    sanskrit: "Patra",
                    english: "Vessel",
                    Icon: UserRound,
                    body: data.context.vesselNote.replace(/^Patra\s*[—–-]\s*/i, ""),
                    accent: "text-purple-500",
                    bg: "bg-purple-500/10",
                  },
                ] as const
              ).map(({ key, sanskrit, english, Icon, body, accent, bg }) => (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  className="border-border/45 bg-background/50 hover:border-border min-w-0 rounded-xl border px-3 py-2.5 transition-colors hover:shadow-sm sm:rounded-2xl sm:px-4 sm:py-3.5"
                >
                  <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl",
                        bg,
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", accent)} />
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
                </motion.div>
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

          <MarriageWindowBanner
            windows={data.marriageWindows}
            chapters={data.marriageChapters}
            marryNow={data.marryNow}
          />

          <section className="border-border/50 bg-card/40 min-w-0 rounded-2xl border px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-2.5 flex flex-col gap-1 sm:mb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-2">
              <div className="min-w-0">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Reading guide
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
                    "flex min-w-0 items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    row.tone,
                  )}
                >
                  <div className="bg-background/50 border-border/30 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                    <span className="font-display text-xs font-semibold">
                      {row.range.split("–")[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{row.title}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
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
                <div className="bg-background/92 sticky top-0 z-10 -mx-3 px-3 py-2.5 backdrop-blur-md lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
                  <TabsList className="border-border/50 bg-card/80 sm:bg-card/60 grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border p-1 md:grid-cols-4">
                    {TAB_ORDER.map((key) => {
                      const meta = TAB_META[key];
                      const Icon = meta.Icon;
                      const isActive = tab === key;
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className={cn(
                            "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2 text-[11px] transition-all duration-200 sm:min-h-10 sm:px-2 sm:text-xs md:min-h-11 md:flex-row md:gap-1.5 md:text-sm",
                            isActive && "bg-background shadow-sm",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 transition-colors",
                              isActive && meta.accent,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {meta.label}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 min-w-5 justify-center px-1.5 text-[10px] font-normal transition-colors",
                              isActive && "border-primary/30 bg-primary/5",
                            )}
                          >
                            {counts[key]}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <div className="mt-3 sm:mt-4">
                    <ChipScroller activeCategory={category}>
                      {CATEGORY_CHIP_ORDER.map((key) => {
                        const isActive = category === key;
                        const colors = key === "all" ? null : CATEGORY_COLORS[key];
                        const Icon = key === "all" ? LayoutList : CATEGORY_ICONS[key];
                        const activeClasses = colors
                          ? cn(colors.bg, colors.text, colors.border)
                          : "border-primary/50 bg-primary/15 text-foreground shadow-sm";
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setCategory(key)}
                            className={cn(
                              "group relative shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-xs",
                              isActive
                                ? activeClasses
                                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                            )}
                          >
                            <span className="relative z-10 flex items-center gap-1.5">
                              {Icon ? (
                                <Icon className={cn("h-3 w-3", isActive && colors?.text)} />
                              ) : null}
                              {CATEGORY_LABELS[key]}
                            </span>
                            {isActive && colors ? (
                              <motion.div
                                layoutId="activeCategory"
                                className={cn("absolute inset-0 rounded-full", colors.bg)}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            ) : null}
                          </button>
                        );
                      })}
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
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-center"
                        >
                          <div className="bg-muted/30 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                            <CalendarRange className="text-muted-foreground/50 h-5 w-5" />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            No major {meta.label.toLowerCase()} chapters for this filter.
                          </p>
                          <p className="text-muted-foreground/80 mt-1 text-xs">
                            Try All themes or another time tab.
                          </p>
                        </motion.div>
                      ) : (
                        <EventScrollPanel total={list.length} phase={tab}>
                          <div className="space-y-2">
                            <p className="text-muted-foreground bg-card/95 sticky top-0 z-[1] px-0.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-sm">
                              Primary Antardasha themes
                            </p>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {list.map((e, idx) => (
                                <EventCard
                                  key={`${key}-${e.id}`}
                                  e={e}
                                  showPhase={key === "all"}
                                  index={idx}
                                />
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

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-gold/30 from-gold/5 min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-3.5 sm:p-5 lg:p-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="bg-gold/10 border-gold/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                    <Heart className="text-gold h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg">Marriage focus</h2>
                    <p className="text-muted-foreground text-[10px]">
                      Vivaha windows from your chart
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {(data.marriageWindows || []).slice(0, 4).map((w, i) => (
                    <motion.li
                      key={`${w.label}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-gold/20 bg-background/60 min-w-0 rounded-xl border px-2.5 py-2.5 sm:px-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium break-words sm:text-sm">{w.label}</p>
                        <LikelihoodBadge score={w.score} size="sm" />
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
                        {w.window}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed break-words">
                        {w.reason}
                      </p>
                    </motion.li>
                  ))}
                  {!data.marriageWindows?.length ? (
                    <p className="text-muted-foreground text-xs">
                      Open marriage timing for a full vivaha reading.
                    </p>
                  ) : null}
                </ul>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link href={routes.marriageTiming}>Full marriage timing</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border-border/50 bg-card/40 min-w-0 rounded-2xl border p-3.5 sm:p-5 lg:p-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="bg-background border-border/50 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                    <BookOpen className="text-foreground/70 h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg">How to read</h2>
                    <p className="text-muted-foreground text-[10px]">Calendar guide</p>
                  </div>
                </div>
                <ul className="text-muted-foreground space-y-2.5 text-[11px] leading-relaxed sm:text-xs">
                  <li className="flex items-start gap-2">
                    <span className="bg-muted-foreground/50 mt-1 h-1 w-1 shrink-0 rounded-full" />
                    Only major multi-month chapters — mild windows are hidden.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted-foreground/50 mt-1 h-1 w-1 shrink-0 rounded-full" />
                    Travel cards specify foreign / local / relocation when possible.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted-foreground/50 mt-1 h-1 w-1 shrink-0 rounded-full" />
                    Marriage cards include love vs arranged and spouse-origin leanings.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted-foreground/50 mt-1 h-1 w-1 shrink-0 rounded-full" />%
                    is directional (dasha + gochar), not a guarantee.
                  </li>
                </ul>
                <div className="mt-4 flex flex-col gap-2">
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
              </motion.div>
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
