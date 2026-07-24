"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium-cards";
import { cn } from "@/lib/utils/cn";

export type InsightBlock = {
  meaning: string;
  whenActivates: string;
  watchFor: string;
  lifeAreas: string[];
  activationNow: string;
  engineNote: string;
  statusLabel?: string;
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

function DetailPanel({ insight }: { insight: InsightBlock }) {
  return (
    <div className="border-border/40 bg-muted/25 mt-3 space-y-3 rounded-xl border p-3 text-sm">
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
  );
}

export function YogaDetailList({ items, empty }: { items: YogaItem[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!items.length) {
    return <p className="text-muted-foreground text-sm">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((y) => {
        const key = `${y.code || y.name}-${y.name}`;
        const isOpen = open === key;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : key)}
              className={cn(
                "border-border/50 hover:border-gold/30 w-full rounded-xl border px-3 py-3 text-left transition-colors",
                isOpen && "border-gold/35 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{y.name}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {y.category ? <Badge variant="outline">{y.category}</Badge> : null}
                  {typeof y.strength === "number" ? (
                    <Badge variant="secondary">{y.strength}</Badge>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    {isOpen ? "Hide" : "Details"}
                  </span>
                </div>
              </div>
              {!isOpen && y.description ? (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{y.description}</p>
              ) : null}
              {isOpen ? <DetailPanel insight={y.insight} /> : null}
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
    <ul className="space-y-2">
      {items.map((d) => {
        const isOpen = open === d.code;
        return (
          <li key={d.code}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : d.code)}
              className={cn(
                "border-border/50 hover:border-gold/30 w-full rounded-xl border px-3 py-3 text-left transition-colors",
                isOpen && "border-gold/35 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{d.name}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={d.present ? "secondary" : "outline"}>
                    {d.insight.statusLabel || (d.present ? "Present" : "Clear")}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {isOpen ? "Hide" : "Details"}
                  </span>
                </div>
              </div>
              {isOpen ? <DetailPanel insight={d.insight} /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function VedicExtrasBanner() {
  return (
    <GlassCard className="py-3">
      <p className="text-muted-foreground text-xs">
        Tap any yoga or dosha for meaning, activation timing, and what to watch. All factors are
        calculated from your Kundli — AI explains, it does not invent them.
      </p>
    </GlassCard>
  );
}
