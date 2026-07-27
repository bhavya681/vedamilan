"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { RishiSageTile, WisdomGuideCard } from "@/features/wisdom/components/wisdom-portrait";
import {
  WISDOM_CATEGORIES,
  WISDOM_GUIDES,
  listFeaturedSages,
  wisdomDailyReflection,
  type WisdomCategoryId,
} from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const daily = wisdomDailyReflection() ?? {
  text: "Clarity often arrives after a pause — not after more noise.",
  label: "Today's AI reflection inspired by Vedic wisdom.",
};

export default function RishiSageHomePage() {
  const { setMode } = useWorkspaceMode();
  const [category, setCategory] = useState<WisdomCategoryId | "all">("all");
  const featured = useMemo(() => listFeaturedSages(), []);
  const guides = useMemo(() => {
    if (category === "all") return WISDOM_GUIDES;
    return WISDOM_GUIDES.filter((g) => g.categoryIds.includes(category));
  }, [category]);

  useEffect(() => {
    setMode("wisdom", { navigate: false });
  }, [setMode]);

  return (
    <div className="space-y-10">
      <ContentReveal className="space-y-10">
        <PageHeader
          title="Rishi Sage"
          description="Seek wisdom. Reflect deeply. Talk and speak with AI guides inspired by Vedic traditions."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild>
                <Link href={routes.askTheSages}>Ask the Sages</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.wisdomJournal}>Wisdom Journal</Link>
              </Button>
            </div>
          }
        />

        <section className="border-border/60 max-w-3xl space-y-4 border-y py-8">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
            Rishi Sabha
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            Which sage will you sit with today?
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Choose a guide by portrait, then chat in text or speak aloud. These are AI Wisdom Guides
            inspired by documented teachings — not claims that historical figures are speaking.
          </p>
        </section>

        <section className="border-border/50 bg-muted/30 space-y-2 rounded-xl border px-4 py-5 sm:px-5">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
            Today&apos;s Reflection
          </p>
          <p className="font-display text-xl leading-snug sm:text-2xl">“{daily.text}”</p>
          <p className="text-muted-foreground text-xs">{daily.label}</p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">Meet the Rishis</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Symbolic portraits open chat and voice sessions. Tap Chat to write, or Speak for a
              spoken exchange.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {featured.map((guide) => (
              <RishiSageTile key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">Featured teachings</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Different Hindu traditions describe different Sapta Rishi lineages. This is an
              editorial collection — not one universal fixed list.
            </p>
          </div>
          <div className="divide-border/60 divide-y">
            {featured.slice(0, 3).map((guide) => (
              <WisdomGuideCard key={`featured-card-${guide.id}`} guide={guide} featured />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Wisdom Library</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Browse every guide — chat, speak, or read their profile.
              </p>
            </div>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                category === "all"
                  ? "border-foreground/30 bg-foreground text-background"
                  : "border-border/60 hover:border-foreground/25",
              )}
            >
              All
            </button>
            {WISDOM_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.id
                    ? "border-foreground/30 bg-foreground text-background"
                    : "border-border/60 hover:border-foreground/25",
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
          {category !== "all" ? (
            <p className="text-muted-foreground text-sm">
              {WISDOM_CATEGORIES.find((c) => c.id === category)?.description}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => (
              <RishiSageTile key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        <CrossModeCta />

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {WISDOM_AI_DISCLAIMER}
        </p>
      </ContentReveal>
    </div>
  );
}
