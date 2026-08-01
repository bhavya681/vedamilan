"use client";

import Link from "next/link";
import { Heart, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export type SpouseTendenciesView = {
  marriagePath?: string;
  marriagePathLabel?: string;
  marriagePathNote?: string;
  marriagePathScore?: number;
  spouseOrigin?: string;
  spouseOriginLabel?: string;
  spouseOriginNote?: string;
  spouseOriginScore?: number;
  reasons?: string[];
  methodology?: string;
};

export function SpouseTendencyPanel({
  tendencies,
  className,
  showCta = true,
  compact = false,
}: {
  tendencies: SpouseTendenciesView | null | undefined;
  className?: string;
  showCta?: boolean;
  compact?: boolean;
}) {
  if (!tendencies?.marriagePathLabel) return null;

  return (
    <GlassCard className={cn("min-w-0 space-y-3 p-3.5 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            From your Kundli
          </p>
          <h2 className="font-display text-base sm:text-lg">Alliance tendencies</h2>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Directional
        </Badge>
      </div>

      <div className={cn("grid gap-2.5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <div className="border-border/45 bg-background/40 min-w-0 rounded-xl border px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="bg-rose/10 text-rose inline-flex h-7 w-7 items-center justify-center rounded-lg">
              <Heart className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="text-xs font-medium">{tendencies.marriagePathLabel}</p>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-xs">
            {tendencies.marriagePathNote}
          </p>
        </div>
        <div className="border-border/45 bg-background/40 min-w-0 rounded-xl border px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="bg-cosmic/10 text-cosmic inline-flex h-7 w-7 items-center justify-center rounded-lg">
              <Globe2 className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="text-xs font-medium">{tendencies.spouseOriginLabel}</p>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-xs">
            {tendencies.spouseOriginNote}
          </p>
        </div>
      </div>

      {!compact && tendencies.reasons?.length ? (
        <ul className="text-muted-foreground space-y-1 text-[11px] leading-relaxed sm:text-xs">
          {tendencies.reasons.slice(0, 3).map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      ) : null}

      <p className="text-muted-foreground text-[10px] leading-relaxed">
        {tendencies.methodology ||
          "Chart-based tendency only — not a fixed prediction of religion, nationality, or outcome."}
      </p>

      {showCta ? (
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={routes.marriageTiming}>Full marriage timing</Link>
        </Button>
      ) : null}
    </GlassCard>
  );
}
