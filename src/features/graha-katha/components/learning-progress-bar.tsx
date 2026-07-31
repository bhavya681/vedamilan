"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { grahaKathaPlanet, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function LearningProgressBar({
  exploredCount,
  total,
  continueId,
  continueName,
  className,
}: {
  exploredCount: number;
  total: number;
  continueId?: string | null;
  continueName?: string | null;
  className?: string;
}) {
  const t = useT();
  const pct = total > 0 ? Math.round((exploredCount / total) * 100) : 0;

  return (
    <div
      className={cn(
        "katha-panel border-border/55 bg-card/80 shadow-soft relative min-w-0 overflow-hidden rounded-[1.35rem] border p-4 sm:p-6",
        className,
      )}
    >
      <div className="bg-gold/15 pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full blur-2xl" />
      <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-gold/12 text-gold mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <BookMarked className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-saffron text-xs font-semibold tracking-[0.18em] uppercase">
              {t("grahaKatha.progress.title")}
            </p>
            <p className="font-display mt-1 text-xl sm:text-2xl">
              {t("grahaKatha.explored", { count: exploredCount, total })}
            </p>
            {!exploredCount ? (
              <p className="text-muted-foreground mt-1 max-w-md text-sm">
                {t("grahaKatha.progress.empty")}
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">{pct}% of the library visited</p>
            )}
          </div>
        </div>
        {continueId ? (
          <Button asChild className="w-full gap-1 sm:w-auto">
            <Link href={grahaKathaPlanet(continueId)} className="truncate">
              {t("grahaKatha.continue")}
              {continueName ? ` · ${continueName}` : ""}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={routes.grahaKatha}>{t("grahaKatha.title")}</Link>
          </Button>
        )}
      </div>
      <div
        className="bg-muted mt-5 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("grahaKatha.explored", { count: exploredCount, total })}
      >
        <div
          className="katha-progress-fill from-saffron to-gold h-full rounded-full bg-gradient-to-r transition-[width] duration-700 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
