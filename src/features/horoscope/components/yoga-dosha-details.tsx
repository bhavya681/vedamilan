"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Crown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

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
};

type DoshaItem = {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  insight: InsightBlock;
};

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
}: {
  insight: InsightBlock;
  tone?: "yoga" | "dosha";
}) {
  return (
    <div className="space-y-3">
      {insight.exemplar ? <ExemplarPanel exemplar={insight.exemplar} tone={tone} /> : null}

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
                    <p className="font-display text-base font-medium sm:text-lg">{y.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {badge ? (
                        <Badge className="border-gold/40 bg-gold/15 text-foreground border text-[10px]">
                          {badge}
                        </Badge>
                      ) : null}
                      {y.category ? <Badge variant="outline">{y.category}</Badge> : null}
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
                    {" — "}
                    {y.insight.exemplar.knownOutcome}
                  </p>
                ) : null}
                {!isOpen && !y.insight.exemplar && y.description ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{y.description}</p>
                ) : null}
              </button>
              {isOpen ? (
                <div className="px-3.5 pb-4 sm:px-4">
                  <DetailPanel insight={y.insight} tone="yoga" />
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
            Yogas are supportive patterns. Doshas are friction themes — not curses. Open any row for
            formation, dasha timing, and a public-life parallel. Parallels illustrate the theme;
            they are not celebrity-chart claims or guaranteed outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}
