"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building,
  Calendar,
  ChevronDown,
  Clapperboard,
  Clock,
  Coins,
  Compass,
  Crown,
  Flame,
  FlaskConical,
  Gem,
  Globe2,
  Info,
  Layers,
  MapPin,
  Moon,
  Music2,
  PenTool,
  Search,
  SearchX,
  Shield,
  Star,
  Sun,
  Telescope,
  Trophy,
  type LucideIcon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isNorthChart,
  NorthIndianKundli,
  type NorthChartData,
} from "@/features/horoscope/components/kundli-charts";
import { dashaPeriodText } from "@/features/horoscope/dasha-view";
import { fetchJsonWhenAuthed } from "@/lib/http/session-fetch";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { getYogaCategoryDisplay, getYogaIcon } from "@/application/horoscope/yoga-icons";

type CelebritySummary = {
  id: string;
  name: string;
  field: string;
  category: string;
  birthDate: string;
  place: string;
  timeAccuracy: string;
  note?: string | null;
  imageUrl: string | null;
};

type CelebrityChart = CelebritySummary & {
  birthTimeLabel: string;
  chartSource: "computed" | "traditional";
  chartSourceNote: string | null;
  lagnaSign: string;
  lagnaNakshatra: string | null;
  lagnaDegree: number;
  moonSign: string;
  moonNakshatra: string | null;
  sunSign: string;
  yogas: Array<{
    code: string;
    name: string;
    category: string;
    strength: number;
    description: string;
  }>;
  chartNorth: unknown;
  chartD9: unknown;
  d9LagnaSign: string;
  d9Planets: Array<{ planet: string; sign: string; house: number }>;
  dasha: {
    currentMaha: string | null;
    currentAntar: string | null;
  };
};

type CelebrityStudioResponse = {
  success: boolean;
  data: {
    celebrities: CelebritySummary[];
    selected?: CelebrityChart | null;
  };
};

type SimilarityFocus = "overall" | "conjunctions" | "placements" | "yogas" | "core";

type SimilarSignal = {
  kind: string;
  label: string;
  detail: string;
  points: number;
};

type SimilarityMatch = {
  celebrity: CelebritySummary;
  score: number;
  signals: SimilarSignal[];
  shared: {
    conjunctions: string[];
    signs: string[];
    houses: string[];
    yogas: string[];
  };
  timeAccuracy: string;
  reliabilityNote: string | null;
};

type SimilarCelebritiesData = {
  hasKundli: boolean;
  focus: SimilarityFocus;
  userChart: { lagnaSign: string; moonSign: string; sunSign: string } | null;
  results: SimilarityMatch[];
  scanned: number;
};

type SimilarCelebritiesResponse = {
  success: boolean;
  data: SimilarCelebritiesData;
};

const FOCUS_OPTIONS: Array<{ value: SimilarityFocus; label: string }> = [
  { value: "overall", label: "Overall" },
  { value: "conjunctions", label: "Conjunctions" },
  { value: "placements", label: "Placements" },
  { value: "yogas", label: "Yogas" },
  { value: "core", label: "Moon & Lagna" },
];

const CATEGORIES = [
  "All",
  "Cinema",
  "Sports",
  "Music",
  "Creators",
  "Finance",
  "Gamblers",
  "Leaders",
  "Science & arts",
  "Spiritual",
  "Mystic",
  "Divine",
  "Criminals",
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];
type CategoryName = Exclude<CategoryFilter, "All">;

const CATEGORY_META: Record<
  CategoryName,
  { icon: LucideIcon; avatar: string; chip: string; wash: string }
> = {
  Cinema: {
    icon: Clapperboard,
    avatar: "border-rose/30 from-rose/20 to-gold/10 text-rose",
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
  },
  Sports: {
    icon: Trophy,
    avatar: "border-blue/30 from-blue/20 to-gold/10 text-blue",
    chip: "border-blue/25 bg-blue/10 text-blue",
    wash: "from-blue/12 via-transparent",
  },
  Music: {
    icon: Music2,
    avatar: "border-cosmic/30 from-cosmic/20 to-gold/10 text-cosmic",
    chip: "border-cosmic/25 bg-cosmic/10 text-cosmic",
    wash: "from-cosmic/12 via-transparent",
  },
  Creators: {
    icon: PenTool,
    avatar: "border-saffron/30 from-saffron/20 to-gold/10 text-saffron",
    chip: "border-saffron/25 bg-saffron/10 text-saffron",
    wash: "from-saffron/12 via-transparent",
  },
  Finance: {
    icon: Building,
    avatar: "border-emerald/30 from-emerald/20 to-gold/10 text-emerald",
    chip: "border-emerald/25 bg-emerald/10 text-emerald",
    wash: "from-emerald/12 via-transparent",
  },
  Gamblers: {
    icon: Flame,
    avatar: "border-amber/30 from-amber/20 to-rose/10 text-amber",
    chip: "border-amber/25 bg-amber/10 text-amber",
    wash: "from-amber/10 via-transparent",
  },
  Leaders: {
    icon: Crown,
    avatar: "border-gold/35 from-gold/25 to-saffron/10 text-gold",
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "from-gold/12 via-transparent",
  },
  "Science & arts": {
    icon: FlaskConical,
    avatar: "border-blue/30 from-blue/20 to-gold/10 text-blue",
    chip: "border-blue/25 bg-blue/10 text-blue",
    wash: "from-blue/12 via-transparent",
  },
  Spiritual: {
    icon: Flame,
    avatar: "border-gold/35 from-gold/25 to-saffron/10 text-saffron",
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "from-gold/12 via-transparent",
  },
  Mystic: {
    icon: Telescope,
    avatar: "border-cosmic/30 from-cosmic/20 to-rose/10 text-cosmic",
    chip: "border-cosmic/25 bg-cosmic/10 text-cosmic",
    wash: "from-cosmic/12 via-transparent",
  },
  Divine: {
    icon: Crown,
    avatar: "border-gold/40 from-gold/30 to-saffron/15 text-gold",
    chip: "border-gold/35 bg-gold/15 text-gold",
    wash: "from-gold/15 via-transparent",
  },
  Criminals: {
    icon: Shield,
    avatar: "border-rose/30 from-rose/20 to-gold/10 text-rose",
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
  },
};

const TIME_ACCURACY_META: Record<string, { label: string; tone: string }> = {
  published: { label: "Published time", tone: "text-emerald" },
  approximate: { label: "Approx. time", tone: "text-amber" },
  unknown: { label: "Noon chart", tone: "text-muted-foreground" },
  traditional: { label: "Traditional chart", tone: "text-gold" },
};

const YOGA_CATEGORY_META: Record<
  string,
  { label: string; icon: LucideIcon; chip: string; wash: string; areas: string[] }
> = {
  "Raja Yoga": {
    label: "Raja Yoga",
    icon: Crown,
    chip: "border-gold/35 bg-gold/15 text-gold",
    wash: "from-gold/15 via-transparent",
    areas: ["Authority", "Status", "Leadership", "Exceptional Rise"],
  },
  "Dharma-Karmadhipati": {
    label: "Dharma-Karmadhipati",
    icon: Crown,
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "from-gold/12 via-transparent",
    areas: ["Purpose", "Career", "Duty", "Rise"],
  },
  "Gaja Kesari": {
    label: "Gaja Kesari",
    icon: Star,
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "from-gold/12 via-transparent",
    areas: ["Wisdom", "Respect", "Support", "Grace"],
  },
  "Dhana Yoga": {
    label: "Dhana Yoga",
    icon: Coins,
    chip: "border-saffron/25 bg-saffron/10 text-saffron",
    wash: "from-saffron/12 via-transparent",
    areas: ["Prosperity", "Speech", "Resources"],
  },
  "Pancha Mahapurusha": {
    label: "Mahapurusha",
    icon: Star,
    chip: "border-emerald/25 bg-emerald/10 text-emerald",
    wash: "from-emerald/12 via-transparent",
    areas: ["Character", "Greatness", "Legacy"],
  },
  "Lunar Yoga": {
    label: "Lunar Yoga",
    icon: Moon,
    chip: "border-cosmic/25 bg-cosmic/10 text-cosmic",
    wash: "from-cosmic/12 via-transparent",
    areas: ["Mind", "Emotions", "Intuition"],
  },
  "Solar Yoga": {
    label: "Solar Yoga",
    icon: Sun,
    chip: "border-amber/25 bg-amber/10 text-amber",
    wash: "from-amber/12 via-transparent",
    areas: ["Vitality", "Authority", "Self"],
  },
  "Nabhasa Yoga": {
    label: "Nabhasa Yoga",
    icon: Layers,
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
    areas: ["Structure", "Life Pattern", "Destiny"],
  },
  "Ashraya Yoga": {
    label: "Ashraya Yoga",
    icon: Layers,
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
    areas: ["Foundation", "Pattern", "Disposition"],
  },
  "Dala Yoga": {
    label: "Dala Yoga",
    icon: Layers,
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
    areas: ["Grouping", "Balance", "Momentum"],
  },
  "Akriti Yoga": {
    label: "Akriti Yoga",
    icon: Layers,
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
    areas: ["Form", "Pattern", "Life Shape"],
  },
  "Sankhya Yoga": {
    label: "Sankhya Yoga",
    icon: Layers,
    chip: "border-rose/25 bg-rose/10 text-rose",
    wash: "from-rose/12 via-transparent",
    areas: ["Distribution", "Count", "Configuration"],
  },
  "Planetary Yoga": {
    label: "Planetary Yoga",
    icon: Compass,
    chip: "border-blue/25 bg-blue/10 text-blue",
    wash: "from-blue/12 via-transparent",
    areas: ["Exchange", "Special Combination", "Power"],
  },
  "Other Yoga": {
    label: "Other Yoga",
    icon: Shield,
    chip: "border-muted/25 bg-muted/10 text-muted-foreground",
    wash: "from-muted/12 via-transparent",
    areas: ["Supportive", "Minor", "Contextual"],
  },
  General: {
    label: "General",
    icon: Shield,
    chip: "border-muted/25 bg-muted/10 text-muted-foreground",
    wash: "from-muted/12 via-transparent",
    areas: ["General", "Contextual", "Supportive"],
  },
  Other: {
    label: "Other",
    icon: Shield,
    chip: "border-muted/25 bg-muted/10 text-muted-foreground",
    wash: "from-muted/12 via-transparent",
    areas: ["Supportive", "Minor", "Contextual"],
  },
};

function categoryMeta(category: string) {
  return CATEGORY_META[category as CategoryName] ?? CATEGORY_META.Cinema;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => /[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CelebrityAvatar({
  name,
  imageUrl,
  category,
  className,
  sizes,
}: {
  name: string;
  imageUrl?: string | null;
  category: string;
  className?: string;
  sizes: string;
}) {
  const theme = categoryMeta(category);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(imageUrl) && !failed;

  return (
    <div
      className={cn(
        "font-display shadow-soft relative shrink-0 overflow-hidden rounded-xl border bg-gradient-to-br font-semibold",
        theme.avatar,
        className,
      )}
    >
      {showPhoto ? (
        <Image
          src={imageUrl!}
          alt={`Portrait of ${name}`}
          fill
          sizes={sizes}
          unoptimized
          onError={() => setFailed(true)}
          className="object-cover object-top"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials(name)}</span>
      )}
    </div>
  );
}

function formatBirthDate(iso: string) {
  const match = /^(-?\d+)-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return iso;
  if (year <= 0) {
    const monthLabel = new Date(Date.UTC(2000, month - 1, 1)).toLocaleDateString("en-GB", {
      month: "short",
      timeZone: "UTC",
    });
    return `${day} ${monthLabel} ${1 - year} BCE`;
  }
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function SignatureTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string | null;
}) {
  return (
    <div className="border-border/60 bg-background/60 min-w-0 rounded-xl border p-3">
      <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <Icon className="text-gold h-3.5 w-3.5" />
        {label}
      </p>
      <p className="font-display mt-1.5 truncate text-lg leading-tight">{value}</p>
      {hint ? <p className="text-muted-foreground mt-0.5 truncate text-xs">{hint}</p> : null}
    </div>
  );
}

function ChartPanel({
  code,
  title,
  subtitle,
  lagna,
  chart,
  chartSource = "computed",
  planetVoice = false,
  footer,
}: {
  code: string;
  title: string;
  subtitle: string;
  lagna: string;
  chart: unknown;
  chartSource?: "computed" | "traditional";
  planetVoice?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card className="border-border/60 overflow-hidden">
      <div className="border-border/60 from-gold/12 flex items-start justify-between gap-3 border-b bg-gradient-to-br via-transparent to-transparent px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">{code}</p>
          <CardTitle className="mt-1 text-xl">{title}</CardTitle>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{subtitle}</p>
        </div>
        <Badge variant="outline" className="border-gold/40 bg-gold/10 shrink-0">
          Lagna {lagna}
        </Badge>
      </div>
      <CardContent className="flex flex-col items-center gap-4 p-4 sm:p-6">
        {isNorthChart(chart) ? (
          <NorthIndianKundli chart={chart as NorthChartData} planetVoice={planetVoice} />
        ) : (
          <p className="text-muted-foreground py-10 text-sm">Chart layout unavailable.</p>
        )}
        <p className="text-muted-foreground text-center text-[10px] tracking-[0.14em] uppercase">
          North Indian · whole-sign houses ·{" "}
          {chartSource === "traditional" ? "traditional positions" : "Lahiri ayanamsha"}
        </p>
        {footer}
      </CardContent>
    </Card>
  );
}

function ProfileHero({ chart }: { chart: CelebrityChart }) {
  const theme = categoryMeta(chart.category);
  const accuracy = TIME_ACCURACY_META[chart.timeAccuracy] ?? TIME_ACCURACY_META.unknown!;
  const Icon = theme.icon;

  return (
    <Card className="border-border/60 relative overflow-hidden">
      <div className="mandala-bg pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold)_18%,transparent),transparent_70%)] blur-2xl"
        aria-hidden
      />
      <CardContent className="relative p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <CelebrityAvatar
            key={chart.id}
            name={chart.name}
            imageUrl={chart.imageUrl}
            category={chart.category}
            sizes="96px"
            className="h-20 w-20 rounded-2xl text-2xl sm:h-24 sm:w-24 sm:text-3xl"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={theme.chip}>
                <Icon className="mr-1 h-3 w-3" />
                {chart.category}
              </Badge>
              <Badge variant="outline">{chart.field}</Badge>
              <Badge variant="outline" className={cn("gap-1.5", accuracy.tone)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {accuracy.label}
              </Badge>
            </div>
            <h1 className="font-display mt-2 text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              {chart.name}
            </h1>
            <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-sm">
              <Globe2 className="h-3.5 w-3.5 shrink-0" />
              {chart.category === "Divine"
                ? "Divine figure · traditional Vedic chart"
                : "International icon · Vedic sidereal chart"}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="border-border/60 bg-background/60 flex items-center gap-2.5 rounded-xl border p-3">
                <Calendar className="text-gold h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Birth date
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {formatBirthDate(chart.birthDate)}
                  </p>
                </div>
              </div>
              <div className="border-border/60 bg-background/60 flex items-center gap-2.5 rounded-xl border p-3">
                <Clock className="text-gold h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Birth time
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium">{chart.birthTimeLabel}</p>
                </div>
              </div>
              <div className="border-border/60 bg-background/60 flex items-center gap-2.5 rounded-xl border p-3">
                <MapPin className="text-gold h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Birthplace
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium">{chart.place}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <SignatureTile
            icon={Compass}
            label="Lagna"
            value={chart.lagnaSign}
            hint={chart.lagnaNakshatra}
          />
          <SignatureTile
            icon={Moon}
            label="Moon"
            value={chart.moonSign}
            hint={chart.moonNakshatra}
          />
          <SignatureTile
            icon={Sun}
            label="Sun"
            value={chart.sunSign}
            hint={chart.chartSource === "traditional" ? "Traditional position" : "Sidereal"}
          />
          <SignatureTile
            icon={Gem}
            label="Detected yogas"
            value={String(chart.yogas.length)}
            hint={
              chart.dasha.currentMaha
                ? `Mahadasha · ${chart.dasha.currentMaha}`
                : "From chart engine"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function D9Placements({ planets }: { planets: CelebrityChart["d9Planets"] }) {
  if (!planets.length) return null;
  return (
    <div className="border-border/60 w-full border-t pt-4">
      <p className="text-muted-foreground mb-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
        D9 placements
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {planets.map((planet) => (
          <div
            key={`${planet.planet}-${planet.house}`}
            className="border-border/60 bg-background/60 flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs"
          >
            <span className="font-medium">{planet.planet}</span>
            <span className="text-muted-foreground">
              {planet.sign} · H{planet.house}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YogaStrength({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="img"
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--gold) ${pct * 3.6}deg, var(--border) 0deg)`,
      }}
      aria-label={`Formation strength ${pct} out of 100`}
    >
      <div className="bg-card absolute inset-[3px] rounded-full" />
      <span className="relative text-[10px] font-semibold tabular-nums">{pct}</span>
    </div>
  );
}

function strengthLabel(value: number) {
  if (value >= 80) return "Strong";
  if (value >= 60) return "Moderate";
  return "Mild";
}

const YOGA_VISIBLE_LIMIT = 6;

function YogaSection({
  yogas,
  dasha,
}: {
  yogas: CelebrityChart["yogas"];
  dasha: CelebrityChart["dasha"];
}) {
  const period = dashaPeriodText(dasha.currentMaha, dasha.currentAntar);

  const groupedYogas = useMemo(() => {
    const groups: Record<string, typeof yogas> = {};
    for (const yoga of yogas) {
      const cat = getYogaCategoryDisplay(yoga.code || yoga.category || "");
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(yoga);
    }
    return groups;
  }, [yogas]);

  const categoryOrder = useMemo(() => {
    const preferred = [
      "Raja Yoga",
      "Dharma-Karmadhipati",
      "Gaja Kesari",
      "Pancha Mahapurusha",
      "Dhana Yoga",
      "Lunar Yoga",
      "Solar Yoga",
      "Nabhasa Yoga",
      "Ashraya Yoga",
      "Dala Yoga",
      "Akriti Yoga",
      "Sankhya Yoga",
      "Planetary Yoga",
      "Other Yoga",
      "General",
    ];
    const present = Object.keys(groupedYogas);
    const ordered = preferred.filter((c) => present.includes(c));
    for (const c of present.sort((a, b) => a.localeCompare(b))) {
      if (!ordered.includes(c)) ordered.push(c);
    }
    return ordered;
  }, [groupedYogas]);

  const topYogas = useMemo(() => yogas.slice(0, 3), [yogas]);

  const rankedYogas = useMemo(() => [...yogas].sort((a, b) => b.strength - a.strength), [yogas]);

  const [showAllYogas, setShowAllYogas] = useState(false);
  const visibleYogas = showAllYogas ? rankedYogas : rankedYogas.slice(0, YOGA_VISIBLE_LIMIT);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
            Classical combinations
          </p>
          <h2 className="font-display mt-0.5 flex items-center gap-2 text-xl sm:text-2xl">
            <Gem className="text-gold h-5 w-5" />
            Yoga signatures
          </h2>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-sm">
            Detected yogas from the chart engine, grouped by category and ranked by formation
            strength. Use them as study themes, not fixed predictions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="border-gold/30 bg-gold/10 gap-1.5">
            <Layers className="h-3 w-3" />
            {yogas.length} detected
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Star className="h-3 w-3" />
            {categoryOrder.length} categories
          </Badge>
          {period ? (
            <Badge variant="outline" className="gap-1.5">
              <Clock className="h-3 w-3" />
              {period}
            </Badge>
          ) : null}
        </div>
      </div>

      {yogas.length > 0 ? (
        <div className="space-y-3">
          <Card className="border-gold/20 bg-gold/5">
            <CardContent className="p-3.5 sm:p-4">
              <p className="text-gold text-[10px] font-semibold tracking-[0.16em] uppercase">
                Highlights
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topYogas.map((yoga) => {
                  const Icon = getYogaIcon(yoga.code, yoga.category);
                  return (
                    <div
                      key={`${yoga.code}-${yoga.name}-highlight`}
                      className="border-border/60 bg-background/70 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                    >
                      <Icon className="text-gold h-3.5 w-3.5" />
                      <span className="max-w-[12rem] truncate font-medium sm:max-w-none">
                        {yoga.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {strengthLabel(yoga.strength)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {categoryOrder.map((catName) => {
                  const items = groupedYogas[catName] || [];
                  const meta = YOGA_CATEGORY_META[catName] ?? YOGA_CATEGORY_META.Other!;
                  const Icon = getYogaIcon(items[0]?.code, items[0]?.category) || meta.icon;
                  return (
                    <div
                      key={`${catName}-count`}
                      className={cn(
                        "flex min-w-0 items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-medium",
                        meta.chip,
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{catName}</span>
                      </span>
                      <span className="bg-background/40 shrink-0 rounded-full px-1.5 py-0.5 tabular-nums">
                        {items.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleYogas.map((yoga) => {
              const catName = getYogaCategoryDisplay(yoga.code || yoga.category || "");
              const meta = YOGA_CATEGORY_META[catName] ?? YOGA_CATEGORY_META.Other!;
              const Icon = getYogaIcon(yoga.code, yoga.category) || meta.icon;
              return (
                <article
                  key={`${yoga.code}-${yoga.name}`}
                  className="border-border/60 bg-card hover:border-gold/35 relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border p-3.5 shadow-sm transition-colors"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-br to-transparent opacity-50",
                      meta.wash,
                    )}
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          meta.chip,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display line-clamp-2 text-sm leading-snug font-medium">
                          {yoga.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Badge
                            variant="outline"
                            className={cn("max-w-full border text-[10px]", meta.chip)}
                          >
                            <span className="truncate">{catName}</span>
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {strengthLabel(yoga.strength)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                      <YogaStrength value={yoga.strength} />
                      <span className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">
                        Strength
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground relative mt-2 line-clamp-3 text-xs leading-relaxed">
                    {yoga.description}
                  </p>

                  <div className="relative mt-auto flex flex-wrap gap-1 pt-2">
                    {meta.areas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="border-border/50 bg-background/60 text-muted-foreground rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {yogas.length > YOGA_VISIBLE_LIMIT ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllYogas((prev) => !prev)}
                aria-expanded={showAllYogas}
                className="border-border/60 text-muted-foreground hover:border-gold/35 hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
              >
                {showAllYogas ? "Show fewer" : `Show all ${yogas.length} yogas`}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", showAllYogas && "rotate-180")}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-1.5 py-6 text-center">
            <SearchX className="text-muted-foreground h-5 w-5" />
            <p className="font-medium">No major yogas flagged</p>
            <p className="text-muted-foreground max-w-md text-sm">
              The engine did not flag a supported classical combination for this chart. The D1 and
              D9 charts still show the full planetary story.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Yoga results usually become more visible during the periods of the planets that form them.
          {period ? ` Current period shown: ${period}.` : ""}
        </span>
      </p>
    </section>
  );
}

function CelebrityDetail({ chart }: { chart: CelebrityChart }) {
  const disclaimer =
    chart.chartSource === "traditional"
      ? "This is a traditional devotional chart based on scriptural or traditional birth details. It is an educational reconstruction, not a modern ephemeris calculation or a claim of historical certainty."
      : "Birth records for public figures are often disputed. Unknown birth times use local noon, so the ascendant and house cusps are illustrative. Charts use whole-sign houses and the Lahiri ayanamsha for study and inspiration.";

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between space-y-1 space-x-1">
        <Button variant="ghost" size="sm" asChild className="space-y-1 space-x-1">
          <Link href="/dashboard/astrology/celebrities">
            <ArrowLeft className="h-4 w-4" />
            All celebrities
          </Link>
        </Button>
        <Badge variant="outline" className="border-gold/30 bg-gold/10 gap-1.5">
          <Layers className="h-3 w-3" />
          D1 + D9 studio
        </Badge>
      </div>

      <ProfileHero chart={chart} />

      <section className="space-y-3">
        <div>
          <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
            Chart studio
          </p>
          <h2 className="font-display mt-1 flex items-center gap-2 text-xl sm:text-2xl">
            <Telescope className="text-gold h-5 w-5" />
            D1 & D9 kundali
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Rashi for the life path; Navamsa for marriage, dharma, and inner planet strength.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartPanel
            code="D1 · Rashi"
            title="Birth Chart"
            subtitle="Primary kundli — body, personality, and life direction."
            lagna={chart.lagnaSign}
            chart={chart.chartNorth}
            chartSource={chart.chartSource}
            planetVoice
          />
          <ChartPanel
            code="D9 · Navamsa"
            title="Navamsa Chart"
            subtitle="Marriage, dharma, and the inner strength of each graha."
            lagna={chart.d9LagnaSign}
            chart={chart.chartD9}
            chartSource={chart.chartSource}
            footer={<D9Placements planets={chart.d9Planets} />}
          />
        </div>
      </section>

      <Card className="border-border/60">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="text-gold h-4 w-4" />
            Planetary positions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2.5 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5 lg:grid-cols-4">
          <div className="border-border/60 bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Lagna (Ascendant)
            </p>
            <p className="font-display mt-0.5 text-lg">{chart.lagnaSign}</p>
            <p className="text-muted-foreground text-xs">
              {chart.lagnaNakshatra || `${chart.lagnaDegree.toFixed(1)}°`}
            </p>
          </div>
          <div className="border-border/60 bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Moon sign
            </p>
            <p className="font-display mt-0.5 text-lg">{chart.moonSign}</p>
            <p className="text-muted-foreground text-xs">{chart.moonNakshatra || "—"}</p>
          </div>
          <div className="border-border/60 bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Sun sign
            </p>
            <p className="font-display mt-0.5 text-lg">{chart.sunSign}</p>
            <p className="text-muted-foreground text-xs">
              {chart.chartSource === "traditional" ? "Traditional position" : "Sidereal · Lahiri"}
            </p>
          </div>
          <div className="border-border/60 bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              D9 lagna
            </p>
            <p className="font-display mt-0.5 text-lg">{chart.d9LagnaSign}</p>
            <p className="text-muted-foreground text-xs">Navamsa ascendant</p>
          </div>
        </CardContent>
      </Card>

      <YogaSection yogas={chart.yogas} dasha={chart.dasha} />

      <Card className="border-gold/15 bg-gold/5">
        <CardContent className="flex items-start gap-2 p-3 sm:p-3.5">
          <Info className="text-gold/80 mt-px h-3.5 w-3.5 shrink-0" />
          <div className="text-muted-foreground/90 min-w-0 text-[11px] leading-relaxed sm:text-xs">
            <p>
              {chart.category === "Criminals"
                ? "This infamous figure is included only for neutral astrological study and is not presented as a role model. "
                : chart.category === "Gamblers"
                  ? "This figure is included for a neutral study of risk, probability, and decision-making, not as gambling advice. "
                  : ""}
              {disclaimer}
            </p>
            {chart.chartSource === "traditional" && chart.chartSourceNote ? (
              <p className="mt-1">{chart.chartSourceNote}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SimilarityControls({
  active,
  focus,
  minScore,
  disabled,
  onToggle,
  onFocusChange,
  onMinScoreChange,
}: {
  active: boolean;
  focus: SimilarityFocus;
  minScore: number;
  disabled: boolean;
  onToggle: () => void;
  onFocusChange: (focus: SimilarityFocus) => void;
  onMinScoreChange: (score: number) => void;
}) {
  return (
    <div className="border-border/60 mb-4 space-y-3 border-b pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
            Kundali similarity
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Rank the atlas by shared conjunctions, planet signs, houses, yogas, and Moon/Lagna —
            scored against your saved kundli.
          </p>
        </div>
        <Button
          type="button"
          variant={active ? "default" : "outline"}
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={active}
          className={cn("w-full shrink-0 sm:w-auto", active && "border-gold/50")}
        >
          {active ? "Clear chart matches" : "Find charts like mine"}
        </Button>
      </div>

      {active ? (
        <div className="space-y-2.5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFocusChange(option.value)}
                  aria-pressed={focus === option.value}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    focus === option.value
                      ? "border-gold/40 bg-gold/12 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="text-muted-foreground inline-flex shrink-0 items-center gap-2 text-xs">
              Minimum match
              <select
                value={minScore}
                onChange={(event) => onMinScoreChange(Number(event.target.value))}
                className="border-border/60 bg-background focus-visible:border-gold/50 rounded-lg border px-2.5 py-1.5 text-xs focus-visible:outline-none"
                aria-label="Minimum match score"
              >
                <option value={0}>Any</option>
                <option value={50}>50%+</option>
                <option value={65}>65%+</option>
                <option value={80}>80%+</option>
              </select>
            </label>
          </div>
          <p className="text-muted-foreground flex items-start gap-1.5 text-[11px] leading-relaxed">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              Public birth times are often unknown. Noon charts are still ranked, but their Lagna and
              houses carry less weight. This is a structural study, not a claim of destiny.
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CelebrityCard({
  celebrity,
  match,
}: {
  celebrity: CelebritySummary;
  match?: SimilarityMatch;
}) {
  const theme = categoryMeta(celebrity.category);
  const accuracy = TIME_ACCURACY_META[celebrity.timeAccuracy] ?? TIME_ACCURACY_META.unknown!;
  const Icon = theme.icon;

  return (
    <Link
      href={`/dashboard/astrology/celebrities?id=${encodeURIComponent(celebrity.id)}`}
      className="group border-border/60 bg-card hover:border-gold/40 hover:shadow-elevated relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100",
          theme.wash,
        )}
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <CelebrityAvatar
          name={celebrity.name}
          imageUrl={celebrity.imageUrl}
          category={celebrity.category}
          sizes="44px"
          className="h-11 w-11 text-base"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display group-hover:text-foreground truncate text-lg leading-tight">
            {celebrity.name}
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{celebrity.field}</p>
        </div>
        <ArrowUpRight className="text-muted-foreground group-hover:text-gold h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={cn("gap-1", theme.chip)}>
          <Icon className="h-3 w-3" />
          {celebrity.category}
        </Badge>
        <Badge variant="outline" className="font-mono text-[10px] tracking-wide">
          D1 · D9
        </Badge>
        {match ? (
          <Badge
            variant="outline"
            className="border-gold/40 bg-gold/12 text-gold tabular-nums"
            title={match.reliabilityNote ?? "Structural chart similarity score"}
          >
            {match.score}% match
          </Badge>
        ) : null}
      </div>

      {match ? (
        <div className="relative mt-2 flex flex-wrap gap-1">
          {match.signals.slice(0, 3).map((signal, index) => (
            <span
              key={`${signal.kind}-${signal.detail}-${index}`}
              className="border-border/50 bg-background/60 text-muted-foreground max-w-full truncate rounded-full border px-2 py-0.5 text-[10px]"
              title={signal.detail}
            >
              {signal.label}
            </span>
          ))}
          {match.signals.length === 0 ? (
            <span className="text-muted-foreground text-[10px]">No structural overlap</span>
          ) : null}
        </div>
      ) : null}

      <div className="text-muted-foreground relative mt-4 space-y-1.5 text-xs">
        <p className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatBirthDate(celebrity.birthDate)}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{celebrity.place}</span>
        </p>
      </div>

      <div className="border-border/60 relative mt-3 flex items-center justify-between gap-2 border-t pt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] tracking-wide uppercase",
            accuracy.tone,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {accuracy.label}
        </span>
        <span className="text-muted-foreground group-hover:text-gold text-[10px] font-semibold tracking-[0.14em] uppercase">
          View charts
        </span>
      </div>
    </Link>
  );
}

function AtlasHero({ total, categories }: { total: number | null; categories: number | null }) {
  return (
    <div className="border-border/60 bg-card shadow-soft relative overflow-hidden rounded-3xl border">
      <div className="mandala-bg pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold)_20%,transparent),transparent_70%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--cosmic)_14%,transparent),transparent_70%)] blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-9">
        <div className="max-w-2xl min-w-0">
          <p className="text-gold flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Globe2 className="h-3.5 w-3.5" />
            Divine & international icons
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Celebrity Kundali Atlas
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
            Study D1 Rashi and D9 Navamsa charts of cinema, sports, music, creators, finance,
            leaders, science & arts, spiritual, mystic, and divine figures.
          </p>
          <p className="text-muted-foreground mt-1.5 text-xs">
            A neutral study archive — divine charts follow scriptural or traditional details, while
            other figures use the best available public birth data for comparative astrology.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-gold/30 bg-gold/10 gap-1.5">
              <Users className="h-3 w-3" />
              {total ?? "—"} charts
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Layers className="h-3 w-3" />
              D1 + D9
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Star className="h-3 w-3" />
              {categories ?? "—"} categories
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[19rem]">
          {[
            { label: "Charts", value: total ?? "—" },
            { label: "Categories", value: categories ?? "—" },
            { label: "Vargas", value: "D1/D9" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-border/60 bg-background/60 rounded-xl border px-3 py-3 text-center backdrop-blur-sm"
            >
              <p className="font-display text-xl leading-none sm:text-2xl">{stat.value}</p>
              <p className="text-muted-foreground mt-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AtlasSkeleton() {
  return (
    <div className="min-w-0 space-y-5">
      <div className="border-border/60 bg-card space-y-4 rounded-3xl border p-6 sm:p-8">
        <Skeleton className="h-3 w-36 rounded-full" />
        <Skeleton className="h-10 w-72 max-w-full rounded-2xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        <Skeleton className="h-4 w-2/3 max-w-md rounded-full" />
      </div>
      <div className="border-border/60 bg-card rounded-2xl border p-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="border-border/60 bg-card space-y-3 rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 max-w-full rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CelebritiesContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [data, setData] = useState<CelebrityStudioResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [matchMode, setMatchMode] = useState(false);
  const [focus, setFocus] = useState<SimilarityFocus>("overall");
  const [minScore, setMinScore] = useState(0);
  const [similar, setSimilar] = useState<SimilarCelebritiesData | null>(null);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    const url = selectedId
      ? `/api/astrology/celebrities?id=${encodeURIComponent(selectedId)}`
      : "/api/astrology/celebrities";
    fetchJsonWhenAuthed(url, ac.signal)
      .then((res) => {
        const payload = res as CelebrityStudioResponse;
        if (payload?.success && payload.data) {
          setData(payload.data);
        } else {
          setError("Failed to load celebrity charts");
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError("Failed to load celebrity charts");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [selectedId]);

  useEffect(() => {
    if (!matchMode) {
      setSimilar(null);
      setSimilarError(null);
      return;
    }
    const ac = new AbortController();
    setSimilarLoading(true);
    setSimilarError(null);
    const params = new URLSearchParams({ focus, minScore: String(minScore) });
    fetchJsonWhenAuthed(`/api/astrology/celebrities/similar?${params.toString()}`, ac.signal)
      .then((res) => {
        const payload = res as SimilarCelebritiesResponse;
        if (payload?.success && payload.data) {
          setSimilar(payload.data);
        } else {
          setSimilarError("Failed to load kundali matches");
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setSimilarError("Failed to load kundali matches");
      })
      .finally(() => setSimilarLoading(false));
    return () => ac.abort();
  }, [matchMode, focus, minScore]);

  const celebrities = data?.celebrities;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: celebrities?.length ?? 0 };
    for (const item of celebrities ?? []) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [celebrities]);

  const filtered = useMemo(() => {
    if (!celebrities) return [];
    const q = query.trim().toLowerCase();
    return celebrities
      .filter((celebrity) => category === "All" || celebrity.category === category)
      .filter((celebrity) => {
        if (!q) return true;
        return (
          celebrity.name.toLowerCase().includes(q) ||
          celebrity.field.toLowerCase().includes(q) ||
          celebrity.category.toLowerCase().includes(q) ||
          celebrity.place.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [category, celebrities, query]);

  const matched = useMemo(() => {
    if (!similar) return [];
    const q = query.trim().toLowerCase();
    return similar.results.filter((match) => {
      if (category !== "All" && match.celebrity.category !== category) return false;
      if (!q) return true;
      return (
        match.celebrity.name.toLowerCase().includes(q) ||
        match.celebrity.field.toLowerCase().includes(q) ||
        match.celebrity.category.toLowerCase().includes(q) ||
        match.celebrity.place.toLowerCase().includes(q)
      );
    });
  }, [category, query, similar]);
  const visible = matchMode ? matched : filtered;

  if (selectedId) {
    if (loading) {
      return (
        <div className="min-w-0 space-y-5">
          <AtlasSkeleton />
        </div>
      );
    }
    if (error) {
      return (
        <div className="min-w-0 space-y-5">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/dashboard/astrology/celebrities">
              <ArrowLeft className="h-4 w-4" />
              All celebrities
            </Link>
          </Button>
          <Card className="border-destructive/25 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (data?.selected) {
      return (
        <div className="my-2 min-w-0 p-1">
          <ContentReveal>
            <CelebrityDetail chart={data.selected} />
          </ContentReveal>
        </div>
      );
    }
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <ContentReveal className="space-y-5 sm:space-y-6">
        <AtlasHero
          total={celebrities?.length ?? null}
          categories={celebrities ? new Set(celebrities.map((item) => item.category)).size : null}
        />

        <Card className="border-border/60">
          <CardContent className="p-4 sm:p-5">
            <SimilarityControls
              active={matchMode}
              focus={focus}
              minScore={minScore}
              disabled={loading || !celebrities}
              onToggle={() => setMatchMode((value) => !value)}
              onFocusChange={setFocus}
              onMinScoreChange={setMinScore}
            />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, field, or place..."
                  className="pl-9"
                  aria-label="Search celebrities"
                />
              </div>

              <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
                {CATEGORIES.map((option) => {
                  const active = category === option;
                  const Icon = option === "All" ? Globe2 : CATEGORY_META[option].icon;
                  const count = categoryCounts[option] ?? 0;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-gold/40 bg-gold/12 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {option}
                      <span className="text-muted-foreground/80 tabular-nums">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading || (matchMode && (similarLoading || (!similar && !similarError))) ? (
          <AtlasSkeleton />
        ) : error || (matchMode && similarError) ? (
          <Card className="border-destructive/25 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive text-sm">{error ?? similarError}</p>
            </CardContent>
          </Card>
        ) : matchMode && similar && !similar.hasKundli ? (
          <Card className="border-gold/25 bg-gold/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-display text-xl">Generate your kundli first</p>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                  Chart matching needs your saved birth chart. Add your birth details and generate a
                  kundli, then return here to find structurally similar public charts.
                </p>
              </div>
              <Button asChild className="w-full shrink-0 sm:w-auto">
                <Link href={routes.kundli}>
                  Open kundli studio
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : visible.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <Search className="text-muted-foreground h-6 w-6" />
              <p className="font-display text-xl">No charts found</p>
              <p className="text-muted-foreground text-sm">
                {matchMode
                  ? "Try another focus, lower the minimum match, or clear the search and category filters."
                  : "Try another name, field, place, or category."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {matchMode && similar ? (
              <Card className="border-gold/25 bg-gold/5">
                <CardContent className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    <span className="text-foreground font-medium">
                      Ranked by {FOCUS_OPTIONS.find((option) => option.value === focus)?.label}.
                    </span>{" "}
                    {similar.userChart
                      ? `Your chart: ${similar.userChart.lagnaSign} Lagna · ${similar.userChart.moonSign} Moon · ${similar.userChart.sunSign} Sun.`
                      : null}
                  </p>
                  <Badge variant="outline" className="border-gold/30 bg-gold/10 shrink-0">
                    {matched.length} of {similar.scanned} charts
                  </Badge>
                </CardContent>
              </Card>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                {visible.length} {visible.length === 1 ? "chart" : "charts"}
                {category === "All" ? "" : ` · ${category}`}
                {matchMode ? " · by similarity" : ""}
              </p>
              <p className="text-muted-foreground hidden text-xs sm:block">
                Select a figure to open the D1 & D9 studio
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {matchMode
                ? matched.map((match) => (
                    <CelebrityCard
                      key={match.celebrity.id}
                      celebrity={match.celebrity}
                      match={match}
                    />
                  ))
                : filtered.map((celebrity) => (
                    <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                  ))}
            </div>
          </div>
        )}
      </ContentReveal>
    </div>
  );
}

export default function CelebritiesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-w-0">
          <PageHeader
            title={
              <span className="flex items-center gap-2">
                <Star className="text-gold h-6 w-6" />
                Celebrity Kundali Atlas
              </span>
            }
            description="Browse D1 and D9 charts of cinema, sports, music, creators, finance, leaders, science & arts, spiritual, mystic, and divine figures."
          />
          <AtlasSkeleton />
        </div>
      }
    >
      <div className="w-full min-w-0">
        <CelebritiesContent />
      </div>
    </Suspense>
  );
}
