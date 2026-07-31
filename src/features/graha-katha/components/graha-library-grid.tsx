"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { prefetchGraha } from "@/domain/graha-katha";
import type { GrahaSummary } from "@/domain/graha-katha/summaries";
import { GrahaVisual } from "@/features/graha-katha/components/graha-visual";
import { grahaKathaPlanet } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function GrahaLibraryGrid({
  grahas,
  exploredIds = [],
  className,
}: {
  grahas: GrahaSummary[];
  exploredIds?: string[];
  className?: string;
}) {
  const t = useT();
  const explored = new Set(exploredIds);

  if (!grahas.length) {
    return (
      <div className="border-border/50 bg-card/60 rounded-2xl border px-6 py-12 text-center">
        <p className="font-display text-xl">No Grahas match your search</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Try “Shani”, “love”, “career”, or “Moon”.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "katha-stagger grid min-w-0 gap-4 pt-1 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3",
        className,
      )}
    >
      {grahas.map((g) => {
        const seen = explored.has(g.id);
        return (
          <li key={g.id} className="min-w-0">
            <Link
              href={grahaKathaPlanet(g.id)}
              onMouseEnter={() => prefetchGraha(g.id)}
              onFocus={() => prefetchGraha(g.id)}
              className={cn(
                "katha-card group border-border/55 bg-card focus-visible:ring-ring shadow-soft relative block h-full min-w-0 overflow-hidden rounded-[1.35rem] border",
                "focus-visible:ring-2 focus-visible:outline-none",
                seen && "ring-gold/25 ring-1",
              )}
            >
              <div className="katha-card-media overflow-hidden">
                <GrahaVisual graha={g} size="sm" className="rounded-none border-0 shadow-none" />
              </div>
              <div className="min-w-0 space-y-2.5 p-4 sm:p-5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h2 className="font-display text-xl tracking-wide sm:text-2xl">
                        {g.englishName}
                      </h2>
                      <span className="font-indic text-muted-foreground text-sm">
                        {g.sanskritName}
                      </span>
                    </div>
                    <p className="text-saffron mt-1 text-sm font-medium text-balance">
                      {g.archetype}
                    </p>
                  </div>
                  <span className="katha-card-arrow text-muted-foreground group-hover:text-saffron mt-1 shrink-0">
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{g.essence}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {g.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="katha-chip border-border/50 bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                  {seen ? (
                    <span className="text-gold ml-auto text-[10px] font-semibold tracking-[0.14em] uppercase">
                      {t("grahaKatha.continue")}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
