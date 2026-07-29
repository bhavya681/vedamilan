"use client";

import { useState } from "react";
import { Sparkles, Crown, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium-cards";
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
        "mt-3 space-y-3 rounded-xl border p-3.5 sm:p-4",
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
    <div className="mt-3 space-y-3">
      {insight.exemplar ? <ExemplarPanel exemplar={insight.exemplar} tone={tone} /> : null}

      <div className="border-border/40 bg-muted/25 space-y-3 rounded-xl border p-3 text-sm">
        <div>
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
          <div className="flex flex-wrap gap-1.5">
            {insight.lifeAreas.map((a) => (
              <Badge key={a} variant="outline">
                {a}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="text-muted-foreground text-[11px]">{insight.engineNote}</p>
      </div>
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
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : key)}
              className={cn(
                "border-border/50 hover:border-gold/35 w-full rounded-2xl border px-3.5 py-3.5 text-left transition-colors sm:px-4",
                isOpen && "border-gold/40 from-gold/5 bg-gradient-to-br to-transparent shadow-sm",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1.5">
                  <p className="font-display text-base font-medium sm:text-lg">{y.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {badge ? (
                      <Badge className="border-gold/40 bg-gold/15 text-foreground border text-[10px]">
                        {badge}
                      </Badge>
                    ) : null}
                    {y.category ? <Badge variant="outline">{y.category}</Badge> : null}
                    {typeof y.strength === "number" ? (
                      <Badge variant="secondary">Strength {y.strength}</Badge>
                    ) : null}
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {isOpen ? "Hide" : "See parallel"}
                </span>
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

              {isOpen ? <DetailPanel insight={y.insight} tone="yoga" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function DoshaDetailList({ items }: { items: DoshaItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="space-y-2.5">
      {items.map((d) => {
        const isOpen = open === d.code;
        const badge = d.insight.exemplar?.badge;
        return (
          <li key={d.code}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : d.code)}
              className={cn(
                "border-border/50 hover:border-primary/35 w-full rounded-2xl border px-3.5 py-3.5 text-left transition-colors sm:px-4",
                isOpen && "border-primary/35 from-primary/5 bg-gradient-to-br to-transparent",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
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
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {isOpen ? "Hide" : "See parallel"}
                </span>
              </div>

              {!isOpen && d.insight.exemplar && d.present ? (
                <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed sm:text-sm">
                  Reframe: {d.insight.exemplar.knownOutcome}
                </p>
              ) : null}

              {isOpen ? <DetailPanel insight={d.insight} tone="dosha" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function VedicExtrasBanner() {
  return (
    <GlassCard className="border-gold/25 from-gold/8 space-y-2 bg-gradient-to-br to-transparent py-4 sm:py-5">
      <div className="flex items-start gap-3">
        <span className="bg-gold/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Crown className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="font-display text-lg leading-snug sm:text-xl">
            Your yogas · paths that look like this in public life
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Each combination below includes a{" "}
            <span className="text-foreground/90 font-medium">public-life parallel</span> — how
            teachers explain the same theme through admired careers — plus{" "}
            <span className="text-foreground/90 font-medium">your edge</span> for using it with
            dasha timing. Parallels illustrate the theme; they are not verified celebrity charts or
            guaranteed outcomes.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
