"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookMarked, MessageCircle, Sparkles, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { RishiSageTile, WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { SageOrnamentLine, SageYantraMark } from "@/features/wisdom/components/sage-discourse";
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

const PATHS = [
  {
    href: routes.askTheSages,
    title: "Ask the Sages",
    copy: "Compare calm perspectives from 2–3 guides on one question.",
    icon: Users,
  },
  {
    href: routes.wisdomJournal,
    title: "Wisdom Journal",
    copy: "Keep insights from your discourses and revisit them with care.",
    icon: BookMarked,
  },
] as const;

export default function RishiSageHomePage() {
  const { setMode } = useWorkspaceMode();
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<WisdomCategoryId | "all">("all");
  const featured = useMemo(() => listFeaturedSages(), []);
  const spotlight = featured.slice(0, 7);
  const guides = useMemo(() => {
    if (category === "all") return WISDOM_GUIDES;
    return WISDOM_GUIDES.filter((g) => g.categoryIds.includes(category));
  }, [category]);

  useEffect(() => {
    setMode("wisdom", { navigate: false });
  }, [setMode]);

  return (
    <div className="space-y-12 sm:space-y-14">
      <ContentReveal className="space-y-12 sm:space-y-14">
        {/* Sabha hero */}
        <section className="sage-discourse border-border/50 shadow-soft relative overflow-hidden rounded-[1.75rem] border sm:rounded-[2rem]">
          <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
          <SageYantraMark className="pointer-events-none absolute -top-10 -right-8 h-52 w-52 opacity-40 sm:h-72 sm:w-72" />
          <SageYantraMark className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 opacity-20" />

          <div className="relative z-10 grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-12">
            <div className="min-w-0 space-y-5">
              <p className="text-gold/85 font-display text-[11px] tracking-[0.28em] uppercase">
                Rishi Sabha · Quiet counsel
              </p>
              <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]">
                Sit with the sages.
              </h1>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
                AI Wisdom Guides inspired by Vedic teaching — for reflection, not prophecy. Choose a
                portrait, then chat in text or speak aloud with sincerity.
              </p>
              <SageOrnamentLine className="max-w-xs" />
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="shadow-gold">
                  <Link href={routes.askTheSages}>
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Ask the Sages
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-gold/30">
                  <Link href={`${routes.vedicWisdom}/${spotlight[0]?.id || "vyasa"}/chat`}>
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Begin a discourse
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href={routes.wisdomJournal}>Wisdom Journal</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                className="from-gold/15 absolute inset-6 rounded-full bg-gradient-to-b to-transparent blur-2xl"
                aria-hidden
              />
              <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {spotlight.map((guide, index) => (
                  <motion.div
                    key={guide.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.04 * index,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      index === 0 && "order-first basis-full sm:basis-auto",
                      "flex justify-center",
                    )}
                  >
                    <Link
                      href={`${routes.vedicWisdom}/${guide.id}`}
                      className={cn(
                        "group relative block rounded-full transition-transform duration-300 hover:-translate-y-0.5",
                        index === 0 ? "ring-gold/35 shadow-gold ring-2" : "ring-border/40 ring-1",
                      )}
                      title={guide.displayName}
                    >
                      <WisdomPortrait
                        guide={guide}
                        size={index === 0 ? "xl" : "md"}
                        className={cn(
                          index === 0
                            ? "!h-28 !w-28 sm:!h-36 sm:!w-36"
                            : "!h-14 !w-14 sm:!h-16 sm:!w-16",
                        )}
                      />
                      <span className="sr-only">{guide.displayName}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <p className="text-muted-foreground mt-5 text-center text-[11px] tracking-[0.14em] uppercase">
                {featured.length} featured guides · symbolic portraits
              </p>
            </div>
          </div>
        </section>

        {/* Daily reflection */}
        <section className="border-gold/20 from-card/90 via-muted/25 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent px-5 py-6 sm:px-8 sm:py-8">
          <SageYantraMark className="pointer-events-none absolute top-1/2 right-0 h-36 w-36 -translate-y-1/2 opacity-20" />
          <div className="relative max-w-3xl space-y-3">
            <p className="text-gold/80 text-[10px] font-semibold tracking-[0.2em] uppercase">
              Today&apos;s reflection
            </p>
            <p className="font-display text-2xl leading-snug tracking-tight sm:text-3xl">
              “{daily.text}”
            </p>
            <SageOrnamentLine className="max-w-[12rem]" />
            <p className="text-muted-foreground text-xs leading-relaxed">{daily.label}</p>
          </div>
        </section>

        {/* Pathways */}
        <section className="grid gap-3 sm:grid-cols-2">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.href}
                href={path.href}
                className="border-border/55 from-card/80 hover:border-gold/35 group to-muted/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-gold/12 text-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block text-lg tracking-tight">{path.title}</span>
                    <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
                      {path.copy}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Meet the Rishis */}
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl min-w-0">
              <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Sabha circle
              </p>
              <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                Meet the Rishis
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Symbolic portraits open chat and voice. Tap Chat to write, or Speak for a spoken
                exchange.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((guide) => (
              <RishiSageTile key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        {/* Library */}
        <section className="space-y-5">
          <div className="max-w-2xl min-w-0">
            <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Wisdom library
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
              Browse every guide
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Filter by tradition — chat, speak, or open a profile.
            </p>
          </div>

          <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                category === "all"
                  ? "border-gold/40 bg-gold/15 text-foreground"
                  : "border-border/55 text-muted-foreground hover:border-gold/30 hover:text-foreground",
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
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                  category === c.id
                    ? "border-gold/40 bg-gold/15 text-foreground"
                    : "border-border/55 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                )}
              >
                {c.title}
              </button>
            ))}
          </div>

          {category !== "all" ? (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
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
