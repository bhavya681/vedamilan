"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Coins,
  Compass,
  Crown,
  Gem,
  Layers,
  MoonStar,
  Shield,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getYogaIcon, getYogaCategoryDisplay } from "@/application/horoscope/yoga-icons";

export type YogaExemplar = {
  badge: string;
  parallelTitle: string;
  parallelStory: string;
  knownOutcome: string;
  yourEdge: string;
  disclaimer: string;
};

export type InsightBlock = {
  meaning: string;
  whenActivates: string;
  watchFor: string;
  lifeAreas: string[];
  activationNow: string;
  engineNote: string;
  statusLabel?: string;
  exemplar?: YogaExemplar;
};

type YogaItem = {
  code?: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
  insight: InsightBlock;
  details?: {
    planets: string[];
    houses: number[];
    signs: string[];
    condition: string;
    classicalReference: string;
  };
};

type DoshaItem = {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  insight: InsightBlock;
};

function getYogaIconComponent(code?: string, category?: string) {
  const Icon = getYogaIcon(code, category);
  return <Icon className="h-4 w-4" aria-hidden />;
}

function ExemplarPanel({
  exemplar,
  tone = "yoga",
}: {
  exemplar: YogaExemplar;
  tone?: "yoga" | "dosha";
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border p-3.5 sm:p-4",
        tone === "yoga"
          ? "border-gold/35 from-gold/10 bg-gradient-to-br to-transparent"
          : "border-primary/30 from-primary/8 bg-gradient-to-br to-transparent",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            tone === "yoga" ? "bg-gold/15" : "bg-primary/15",
          )}
        >
          {tone === "yoga" ? (
            <Crown className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            Public-life parallel
          </p>
          <p className="font-display text-base leading-snug sm:text-lg">{exemplar.parallelTitle}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">{exemplar.parallelStory}</p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="border-border/40 bg-background/50 rounded-lg border px-3 py-2.5">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
            What that path is known for
          </p>
          <p className="mt-1 text-sm leading-snug font-medium">{exemplar.knownOutcome}</p>
        </div>
        <div className="border-border/40 bg-background/50 rounded-lg border px-3 py-2.5">
          <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            Your edge
            <ArrowUpRight className="h-3 w-3" />
          </p>
          <p className="mt-1 text-sm leading-snug">{exemplar.yourEdge}</p>
        </div>
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">{exemplar.disclaimer}</p>
    </div>
  );
}

function DetailPanel({
  insight,
  tone = "yoga",
  details,
}: {
  insight: InsightBlock;
  tone?: "yoga" | "dosha";
  details?: YogaItem["details"];
}) {
  return (
    <div className="space-y-3">
      {insight.exemplar ? <ExemplarPanel exemplar={insight.exemplar} tone={tone} /> : null}

      {details && (
        <div className="border-border/40 bg-muted/25 grid gap-3 rounded-xl border p-3 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Classical Formation Details
            </p>
            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Planets Involved</p>
                <p className="font-medium">{details.planets.join(", ") || "&mdash;"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Houses</p>
                <p className="font-medium">
                  {details.houses.map((h) => `H${h}`).join(", ") || "&mdash;"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Signs</p>
                <p className="font-medium">{details.signs.join(", ") || "&mdash;"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Condition Met</p>
                <p className="truncate font-medium">{details.condition}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-muted-foreground">Classical Reference</p>
                <p className="text-xs leading-relaxed font-medium">{details.classicalReference}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-border/40 bg-muted/25 grid gap-3 rounded-xl border p-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            What it means
          </p>
          <p className="mt-1 leading-relaxed">{insight.meaning}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            When it activates
          </p>
          <p className="mt-1 leading-relaxed">{insight.whenActivates}</p>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            {insight.activationNow}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            What to watch
          </p>
          <p className="mt-1 leading-relaxed">{insight.watchFor}</p>
        </div>
        {insight.lifeAreas?.length ? (
          <div className="flex flex-wrap gap-1.5 sm:col-span-2">
            {insight.lifeAreas.map((a) => (
              <Badge key={a} variant="outline">
                {a}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="text-muted-foreground text-[11px] sm:col-span-2">{insight.engineNote}</p>
      </div>
    </div>
  );
}

function StrengthMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex min-w-[5.5rem] items-center gap-2">
      <div className="bg-muted h-1.5 w-14 overflow-hidden rounded-full sm:w-16">
        <div className="bg-gold h-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">{value}</span>
    </div>
  );
}

export function YogaDetailList({ items, empty }: { items: YogaItem[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(
    items[0] ? `${items[0].code || items[0].name}-${items[0].name}` : null,
  );
  if (!items.length) {
    return <p className="text-muted-foreground text-sm">{empty}</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((y) => {
        const key = `${y.code || y.name}-${y.name}`;
        const isOpen = open === key;
        const badge = y.insight.exemplar?.badge;
        const categoryDisplay = getYogaCategoryDisplay(y.category);
        return (
          <li key={key}>
            <article
              className={cn(
                "border-border/50 overflow-hidden rounded-2xl border transition-colors",
                isOpen && "border-gold/40 from-gold/5 bg-gradient-to-br to-transparent shadow-sm",
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                className="hover:bg-muted/30 w-full px-3.5 py-3.5 text-left sm:px-4"
                aria-expanded={isOpen}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {getYogaIconComponent(y.code, y.category)}
                      <p className="font-display text-base font-medium sm:text-lg">{y.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {badge ? (
                        <Badge className="border-gold/40 bg-gold/15 text-foreground border text-[10px]">
                          {badge}
                        </Badge>
                      ) : null}
                      {categoryDisplay && (
                        <Badge variant="outline" className="text-[10px]">
                          {categoryDisplay}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {typeof y.strength === "number" ? <StrengthMeter value={y.strength} /> : null}
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground h-4 w-4 transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </div>
                </div>
                {!isOpen && y.insight.exemplar ? (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed sm:text-sm">
                    <span className="text-foreground/80 font-medium">
                      Like {y.insight.exemplar.parallelTitle.toLowerCase()}
                    </span>
                    {" &mdash; "}
                    {y.insight.exemplar.knownOutcome}
                  </p>
                ) : null}
                {!isOpen && !y.insight.exemplar && y.description ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{y.description}</p>
                ) : null}
              </button>
              {isOpen ? (
                <div className="px-3.5 pb-4 sm:px-4">
                  <DetailPanel insight={y.insight} tone="yoga" details={y.details} />
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export function DoshaDetailList({ items }: { items: DoshaItem[] }) {
  const present = items.filter((d) => d.present);
  const [open, setOpen] = useState<string | null>(present[0]?.code ?? null);

  if (!items.length) {
    return <p className="text-muted-foreground text-sm">No dosha flags in this chart view.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((d) => {
        const isOpen = open === d.code;
        const badge = d.insight.exemplar?.badge;
        return (
          <li key={d.code}>
            <article
              className={cn(
                "border-border/50 overflow-hidden rounded-2xl border transition-colors",
                isOpen && "border-primary/35 from-primary/5 bg-gradient-to-br to-transparent",
                !d.present && "opacity-80",
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : d.code)}
                className="hover:bg-muted/30 w-full px-3.5 py-3.5 text-left sm:px-4"
                aria-expanded={isOpen}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-display text-base font-medium sm:text-lg">{d.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {badge ? (
                        <Badge className="border-primary/35 bg-primary/10 text-foreground border text-[10px]">
                          {badge}
                        </Badge>
                      ) : null}
                      <Badge variant={d.present ? "secondary" : "outline"}>
                        {d.insight.statusLabel || (d.present ? "Present" : "Clear")}
                      </Badge>
                      {d.severity && d.present ? (
                        <Badge variant="outline">{d.severity}</Badge>
                      ) : null}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </div>
                {!isOpen && d.insight.exemplar && d.present ? (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed sm:text-sm">
                    Reframe: {d.insight.exemplar.knownOutcome}
                  </p>
                ) : null}
              </button>
              {isOpen ? (
                <div className="px-3.5 pb-4 sm:px-4">
                  <DetailPanel insight={d.insight} tone="dosha" />
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

type YogaTheme = { icon: LucideIcon; chip: string; wash: string; accent: string };

const YOGA_CARD_THEME: Record<string, YogaTheme> = {
  "Raja Yoga": {
    icon: Crown,
    chip: "border-gold/40 bg-gold/12 text-gold",
    wash: "from-gold/18",
    accent: "var(--gold)",
  },
  "Dhana Yoga": {
    icon: Coins,
    chip: "border-saffron/40 bg-saffron/12 text-saffron",
    wash: "from-saffron/16",
    accent: "var(--saffron)",
  },
  "Pancha Mahapurusha": {
    icon: Gem,
    chip: "border-emerald/40 bg-emerald/12 text-emerald",
    wash: "from-emerald/16",
    accent: "var(--emerald)",
  },
  "Lunar Yoga": {
    icon: MoonStar,
    chip: "border-cosmic/40 bg-cosmic/12 text-cosmic",
    wash: "from-cosmic/16",
    accent: "var(--cosmic)",
  },
  "Solar Yoga": {
    icon: Sun,
    chip: "border-amber/40 bg-amber/12 text-amber",
    wash: "from-amber/16",
    accent: "var(--amber)",
  },
  "Nabhasa Yoga": {
    icon: Layers,
    chip: "border-rose/40 bg-rose/12 text-rose",
    wash: "from-rose/16",
    accent: "var(--rose)",
  },
  "Planetary Yoga": {
    icon: Compass,
    chip: "border-crimson/40 bg-crimson/12 text-crimson",
    wash: "from-crimson/16",
    accent: "var(--crimson)",
  },
  Other: {
    icon: Shield,
    chip: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
    wash: "from-muted/40",
    accent: "var(--muted-foreground)",
  },
};

const FALLBACK_THEME = YOGA_CARD_THEME.Other!;

export function yogaCardTheme(category?: string): YogaTheme {
  return YOGA_CARD_THEME[getYogaCategoryDisplay(category)] ?? FALLBACK_THEME;
}

function strengthLabel(value: number) {
  if (value >= 80) return "Strong";
  if (value >= 60) return "Moderate";
  return "Mild";
}

function StrengthRing({ value, accent }: { value: number; accent: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        role="img"
        aria-label={`Formation strength ${pct} out of 100`}
        className="relative grid size-12 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${accent} ${pct * 3.6}deg, color-mix(in srgb, var(--muted) 80%, transparent) 0deg)`,
        }}
      >
        <div className="bg-card absolute inset-[3px] rounded-full" />
        <span className="relative text-[11px] font-semibold tabular-nums">{pct}</span>
      </div>
      <span className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">
        {strengthLabel(pct)}
      </span>
    </div>
  );
}

function ChipRow({ items, prefix = "" }: { items: string[]; prefix?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="border-border/50 bg-background/60 text-muted-foreground rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
        >
          {prefix}
          {item}
        </span>
      ))}
    </div>
  );
}

export function YogaCardGrid({
  items,
  initialVisible,
}: {
  items: YogaItem[];
  initialVisible?: number;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const isCapped = typeof initialVisible === "number" && items.length > initialVisible;
  const visible = isCapped && !expanded ? items.slice(0, initialVisible) : items;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((y) => {
          const key = `${y.code || y.name}-${y.name}`;
          const isOpen = open === key;
          const theme = yogaCardTheme(y.category);
          const Icon = getYogaIcon(y.code, y.category);
          const badge = y.insight.exemplar?.badge;
          const categoryDisplay = getYogaCategoryDisplay(y.category);

          return (
            <article
              key={key}
              className={cn(
                "border-border/55 bg-card hover:border-gold/35 relative flex min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-colors",
                isOpen && "border-gold/45",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent opacity-70",
                  theme.wash,
                )}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                aria-expanded={isOpen}
                className="relative w-full min-w-0 p-3.5 text-left"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
                        theme.chip,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-[15px] leading-snug font-medium">
                        {y.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {categoryDisplay ? (
                          <Badge variant="outline" className={cn("text-[10px]", theme.chip)}>
                            {categoryDisplay}
                          </Badge>
                        ) : null}
                        {badge ? (
                          <Badge className="border-gold/40 bg-gold/15 text-foreground border text-[10px]">
                            {badge}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {typeof y.strength === "number" ? (
                    <StrengthRing value={y.strength} accent={theme.accent} />
                  ) : null}
                </div>

                {y.description ? (
                  <p className="text-muted-foreground mt-2.5 line-clamp-2 text-xs leading-relaxed">
                    {y.description}
                  </p>
                ) : null}

                {y.details ? (
                  <>
                    <ChipRow items={y.details.planets.slice(0, 4)} />
                    <ChipRow items={y.details.houses.slice(0, 4).map((h) => `H${h}`)} />
                  </>
                ) : null}

                <div className="border-border/50 mt-3 flex items-center justify-between border-t pt-2.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    {isOpen ? "Hide details" : "View details"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground h-4 w-4 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </div>
              </button>

              {isOpen ? (
                <div className="border-border/50 relative border-t px-3.5 pt-3.5 pb-4">
                  <DetailPanel insight={y.insight} tone="yoga" details={y.details} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {isCapped ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="border-border/60 text-muted-foreground hover:border-gold/35 hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
          >
            {expanded ? "Show fewer" : `Show all ${items.length} yogas`}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
              aria-hidden
            />
          </button>
        </div>
      ) : null}
    </>
  );
}

export function DoshaCardGrid({ items }: { items: DoshaItem[] }) {
  const present = items.filter((d) => d.present);
  const [open, setOpen] = useState<string | null>(present[0]?.code ?? null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((d) => {
        const isOpen = open === d.code;
        const badge = d.insight.exemplar?.badge;
        return (
          <article
            key={d.code}
            className={cn(
              "border-border/55 bg-card relative flex min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-colors",
              isOpen && "border-primary/40",
              !d.present && "opacity-85",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent opacity-70",
                d.present ? "from-primary/18" : "from-muted/40",
              )}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : d.code)}
              aria-expanded={isOpen}
              className="relative w-full min-w-0 p-3.5 text-left"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      d.present
                        ? "border-primary/40 bg-primary/12 text-primary"
                        : "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <Shield className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[15px] leading-snug font-medium">{d.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant={d.present ? "secondary" : "outline"} className="text-[10px]">
                        {d.insight.statusLabel || (d.present ? "Present" : "Clear")}
                      </Badge>
                      {d.severity && d.present ? (
                        <Badge variant="outline" className="text-[10px]">
                          {d.severity}
                        </Badge>
                      ) : null}
                      {badge ? (
                        <Badge className="border-primary/35 bg-primary/10 text-foreground border text-[10px]">
                          {badge}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {d.notes ? (
                <p className="text-muted-foreground mt-2.5 line-clamp-2 text-xs leading-relaxed">
                  {d.notes}
                </p>
              ) : null}

              <div className="border-border/50 mt-3 flex items-center justify-between border-t pt-2.5">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {isOpen ? "Hide details" : "View details"}
                </span>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </div>
            </button>

            {isOpen ? (
              <div className="border-border/50 relative border-t px-3.5 pt-3.5 pb-4">
                <DetailPanel insight={d.insight} tone="dosha" />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function VedicExtrasBanner() {
  return (
    <div className="border-border/50 from-gold/8 space-y-2 rounded-2xl border bg-gradient-to-br to-transparent p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="bg-gold/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Crown className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="font-display text-lg leading-snug sm:text-xl">
            Combinations from your stored Kundli
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Yogas are supportive patterns. Doshas are friction themes &mdash; not curses. Open any
            row for formation, dasha timing, and a public-life parallel. Parallels illustrate the
            theme; they are not celebrity-chart claims or guaranteed outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}

export function NoRajaYogaState() {
  return (
    <div className="border-border/50 bg-muted/30 rounded-2xl border p-6 text-center">
      <Crown className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
      <p className="font-display text-lg">No Qualifying Raja Yoga Detected</p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm">
        The classical rule engine did not find Kendra-Trikona associations, Dharma-Karmadhipati,
        Neecha Bhanga, Vipareeta Raja, or Pancha Mahapurusha yogas in the current chart.
      </p>
      <p className="text-muted-foreground mt-3 text-xs">
        This is common &mdash; many charts don&apos;t have these specific classical combinations.
        Other supportive yogas may still be present in the &quot;All&quot; or &quot;Other&quot;
        tabs.
      </p>
    </div>
  );
}
