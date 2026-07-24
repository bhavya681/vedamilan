"use client";

import { MATCH_SCORE, COMPATIBILITY_SCORE } from "@/lib/constants/score-labels";
import { cn } from "@/lib/utils";

type ScoreKind = "match" | "compatibility";

const COPY = {
  match: MATCH_SCORE,
  compatibility: COMPATIBILITY_SCORE,
} as const;

export function ScoreBadge({
  score,
  kind,
  size = "md",
  className,
}: {
  score: number;
  kind: ScoreKind;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const copy = COPY[kind];
  const sizeClass =
    size === "lg"
      ? "min-w-[4.5rem] px-3 py-2"
      : size === "sm"
        ? "min-w-[3rem] px-2 py-1"
        : "min-w-[3.25rem] px-2.5 py-1.5";
  const valueClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "border-gold/50 bg-navy/70 rounded-2xl border text-center backdrop-blur-md",
        sizeClass,
        className,
      )}
      title={`${copy.label}: ${score}% — ${copy.meaning}`}
      aria-label={`${copy.label} ${score} percent. ${copy.meaning}`}
    >
      <p className={cn("text-ivory leading-none font-semibold tabular-nums", valueClass)}>
        {score}%
      </p>
      <p className="text-ivory/70 mt-1 text-[9px] font-medium tracking-[0.12em] uppercase">
        {copy.shortLabel}
      </p>
    </div>
  );
}

export function ScoreExplainCallout({ kind, className }: { kind: ScoreKind; className?: string }) {
  const copy = COPY[kind];
  return (
    <div
      className={cn(
        "border-border/60 bg-card/80 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        className,
      )}
    >
      <p className="text-foreground font-medium">{copy.label}</p>
      <p className="text-muted-foreground mt-1">{copy.meaning}</p>
      <p className="text-muted-foreground mt-2 text-xs">{copy.detail}</p>
    </div>
  );
}
