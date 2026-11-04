"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookMarked,
  BriefcaseBusiness,
  Compass,
  HeartHandshake,
  Home,
  Leaf,
  MessageCircle,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { SuggestedSages } from "@/features/wisdom/components/suggested-sages";
import { RishiSageTile, WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { SageOrnamentLine, SageYantraMark } from "@/features/wisdom/components/sage-discourse";
import {
  WISDOM_CATEGORIES,
  listWisdomGuides,
  listFeaturedSages,
  wisdomDailyReflection,
  type WisdomCategoryId,
  type WisdomGuide,
} from "@/domain/wisdom/guides";
import { PRACTICAL_WISDOM_PROMPTS } from "@/domain/wisdom/life-prompts";
import type { LifeNeedId } from "@/domain/wisdom/sage-alignment";
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
    copy: "Bring a real decision — work, family, conflict, or change — and compare grounded perspectives.",
    icon: Users,
  },
  {
    href: routes.wisdomJournal,
    title: "Wisdom Journal",
    copy: "Keep the reflections that gave you a concrete next step, and revisit them later.",
    icon: BookMarked,
  },
] as const;

const NEED_ICONS: Record<LifeNeedId, LucideIcon> = {
  relationship: HeartHandshake,
  career: BriefcaseBusiness,
  inner: Leaf,
  duty: Home,
  inquiry: Compass,
  astrology: Sparkles,
};

export default function RishiSageHomePage() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<WisdomCategoryId | "all">("all");
  const featured = useMemo(() => listFeaturedSages(), []);
  const [spotlightIds, setSpotlightIds] = useState<string[]>([]);
  const spotlight = useMemo(() => {
    const preferred = spotlightIds
      .map(
        (id) =>
          featured.find((guide) => guide.id === id) ||
          listWisdomGuides().find((guide) => guide.id === id),
      )
      .filter((guide): guide is WisdomGuide => Boolean(guide));
    const rest = featured.filter((guide) => !preferred.some((row) => row.id === guide.id));
    return [...preferred, ...rest].slice(0, 7);
  }, [featured, spotlightIds]);
  const guides = useMemo(() => {
    if (category === "all") return listWisdomGuides();
    return listWisdomGuides().filter((g) => g.categoryIds.includes(category));
  }, [category]);

  return (
    <ContentReveal className="min-w-0 space-y-8 sm:space-y-10">
      {/* Sabha hero */}
      <section className="sage-discourse border-border/50 shadow-soft relative overflow-hidden rounded-[1.75rem] border sm:rounded-[2rem]">
        <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
        <SageYantraMark className="pointer-events-none absolute -top-10 -right-8 h-52 w-52 opacity-40 sm:h-72 sm:w-72" />
        <SageYantraMark className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 opacity-20" />

        <div className="relative z-10 grid gap-7 px-5 py-7 sm:px-7 sm:py-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-11">
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <p className="text-gold/85 font-display text-[11px] tracking-[0.28em] uppercase">
              Rishi Sabha · Quiet counsel
            </p>
            <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.1rem]">
              Sit with the sages.
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
              AI Wisdom Guides inspired by Vedic teaching — for real decisions, not prophecy. Start
              with what is actually happening, compare perspectives, and leave with a practical next
              step.
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
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="from-gold/15 absolute inset-6 rounded-full bg-gradient-to-b to-transparent blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
                  className={cn(index === 0 && "order-first basis-full", "flex justify-center")}
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
                          ? "!h-24 !w-24 sm:!h-32 sm:!w-32"
                          : "!h-11 !w-11 sm:!h-14 sm:!w-14",
                      )}
                    />
                    <span className="sr-only">{guide.displayName}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="text-muted-foreground mt-4 text-center text-[11px] tracking-[0.14em] uppercase">
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

      {/* Everyday wisdom */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Wisdom for ordinary life
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
              Start with what is actually happening
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              You do not need to know Sanskrit, astrology, or the right words. Bring a decision, a
              strained relationship, a family tension, or a restless mind.
            </p>
          </div>
          <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
            <Link href={routes.askTheSages}>Open the council</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRACTICAL_WISDOM_PROMPTS.map((prompt) => {
            const Icon = NEED_ICONS[prompt.need];
            const href = `${routes.askTheSages}?need=${prompt.need}&q=${encodeURIComponent(
              prompt.question,
            )}`;
            return (
              <Link
                key={prompt.title}
                href={href}
                className="border-border/55 from-card/85 hover:border-gold/35 group to-muted/20 flex flex-col rounded-2xl border bg-gradient-to-br p-4 transition-colors"
              >
                <span className="bg-gold/12 text-gold flex h-9 w-9 items-center justify-center rounded-xl">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-display mt-3 text-base tracking-tight">{prompt.title}</span>
                <span className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-relaxed">
                  {prompt.question}
                </span>
                <span className="text-gold/85 mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-semibold">
                  Ask this
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <SuggestedSages onSpotlight={setSpotlightIds} />

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

      {/* Library */}
      <section className="space-y-5">
        <div className="max-w-2xl min-w-0">
          <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
            Sabha circle
          </p>
          <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">Meet the Rishis</h2>
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  );
}
