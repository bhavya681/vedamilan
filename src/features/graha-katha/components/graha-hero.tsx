"use client";

import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import type { GrahaEntity } from "@/domain/graha-katha/types";
import { GrahaVisual } from "@/features/graha-katha/components/graha-visual";

export function GrahaHero({
  graha,
  onBeginStory,
  chartHref,
}: {
  graha: GrahaEntity;
  onBeginStory: () => void;
  chartHref: string;
}) {
  const t = useT();

  return (
    <section className="katha-hero content-reveal border-border/50 bg-card/70 shadow-soft relative min-w-0 overflow-hidden rounded-[1.5rem] border">
      <div className="mandala-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="katha-fade-up-delay order-first min-h-[200px] min-w-0 p-3 sm:min-h-[240px] sm:p-4 lg:order-last lg:min-h-0 lg:p-5">
          <GrahaVisual
            graha={graha}
            size="lg"
            className="h-full min-h-[200px] rounded-[1.15rem] sm:min-h-[240px] lg:min-h-[300px]"
          />
        </div>

        <div className="katha-fade-up flex min-w-0 flex-col justify-center space-y-4 p-4 sm:space-y-5 sm:p-8 lg:p-10">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="font-indic text-saffron text-base sm:text-lg">{graha.sanskritName}</p>
            <span className="text-muted-foreground/50">·</span>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-xs">
              Graha Katha
            </p>
          </div>

          <h1 className="font-display text-[2rem] leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.1rem]">
            {graha.englishName}
            <span className="text-muted-foreground mt-2 block text-lg font-normal sm:mt-3 sm:text-2xl lg:text-[1.55rem]">
              {graha.archetype}
            </span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base sm:text-[1.05rem]">
            {graha.introduction}
          </p>

          <blockquote className="border-gold/40 font-display text-foreground/90 border-l-2 pl-3 text-lg leading-snug italic sm:pl-4 sm:text-2xl">
            {graha.visualConcept}
          </blockquote>

          <ul className="flex flex-wrap gap-2" aria-label="Themes">
            {graha.metadata.map((m) => (
              <li
                key={m}
                className="katha-chip border-border/55 bg-background/70 text-muted-foreground max-w-full rounded-full border px-3 py-1 text-xs tracking-wide break-words"
              >
                {m}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href={chartHref}>
                <Sparkles className="h-4 w-4" aria-hidden />
                {t("grahaKatha.exploreChart")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={onBeginStory}
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              {t("grahaKatha.beginStory")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
