"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MapPin, Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/ui/vedic";
import { GlassCard } from "@/components/ui/premium-cards";
import { landingImages } from "@/lib/constants/images";
import { routes } from "@/lib/constants/routes";
import { mockGunaMilan } from "@/lib/mock/vedamilan";

export function LandingSearchSection() {
  const [query, setQuery] = useState("");

  return (
    <section
      className="relative z-10 -mt-8 px-4 sm:-mt-12 sm:px-6 lg:px-8"
      aria-labelledby="search-heading"
    >
      <FadeIn>
        <div className="border-border/40 shadow-elevated relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border sm:rounded-[2rem]">
          <div className="absolute inset-0">
            <Image
              src={landingImages.searchAtmosphere.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="bg-navy/82 absolute inset-0" />
          </div>
          <div className="text-ivory relative p-5 sm:p-8 md:p-10">
            <p className="text-gold text-[11px] font-semibold tracking-[0.2em] uppercase">
              Discover
            </p>
            <h2 id="search-heading" className="font-display mt-2 text-2xl sm:text-3xl md:text-4xl">
              Search with intention
            </h2>
            <p className="text-ivory/70 mt-2 max-w-xl text-sm">
              City, profession, or values—then deepen with Vedic + AI clarity.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="relative flex-1">
                <Search className="text-navy/45 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Bengaluru · Designer · Family-oriented"
                  className="bg-ivory text-navy placeholder:text-navy/40 h-12 border-transparent pl-10"
                  aria-label="Search profiles"
                />
              </div>
              <Button asChild size="lg" className="h-12 w-full sm:w-auto">
                <Link href={routes.register}>Find matches</Link>
              </Button>
            </form>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export function SuccessStoriesStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="stories">
      <FadeIn>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="Love stories"
            title="Real unions. Quiet beginnings."
            description="Photography-led stories with ceremonial restraint—never marketplace clutter."
          />
        </div>
      </FadeIn>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {landingImages.stories.map((story, index) => (
          <FadeIn key={story.title} delay={0.05 * index}>
            <motion.article
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <Image
                src={story.src}
                alt={story.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-navy via-navy/25 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="text-ivory absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-display text-xl sm:text-2xl">{story.title}</p>
                <p className="text-ivory/70 mt-1 flex items-center gap-1 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  {story.place}
                </p>
                <p className="text-gold mt-2 inline-flex items-center gap-1 text-xs">
                  <Heart className="h-3.5 w-3.5" />
                  Matched on VedaMilan AI
                </p>
              </div>
            </motion.article>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}

export function AiDemoSection() {
  return (
    <LandingSection id="ai-demo" tone="muted">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <FadeIn>
          <SectionIntro
            eyebrow="AI demo"
            title="Explanations you can trust"
            description="Beyond endless browsing—see why two people align across values, lifestyle, and Vedic signals."
          />
          <Button asChild className="mt-6" variant="secondary">
            <Link href={routes.register}>
              <Sparkles className="h-4 w-4" />
              Create your profile
            </Link>
          </Button>
        </FadeIn>
        <FadeIn delay={0.1}>
          <GlassCard className="relative overflow-hidden" glow>
            <motion.div
              aria-hidden
              className="bg-secondary/15 absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <p className="text-foreground/90 relative text-sm leading-relaxed sm:text-base">
              “Ananya and you share elevated emotional compatibility driven by Moon–Venus harmony
              and aligned family expectations. Career windows overlap in late 2026—an ideal season
              for sincere introductions.”
            </p>
            <div className="relative mt-8 flex flex-wrap items-center gap-5 sm:gap-6">
              <ProgressRing value={89} label="AI" />
              <ProgressRing value={92} label="Vedic" />
              <ProgressRing value={87} label="Values" />
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </LandingSection>
  );
}

export function CompatibilityPreviewSection() {
  return (
    <LandingSection id="compatibility">
      <FadeIn>
        <SectionIntro
          eyebrow="Compatibility"
          title="Ashta Koota, made visible"
          description="Classical scoring presented with clarity—so families and couples can decide together."
        />
      </FadeIn>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {mockGunaMilan.map((item, index) => (
          <FadeIn key={item.koota} delay={0.03 * index}>
            <motion.div
              whileHover={{ y: -3 }}
              className="border-border/50 from-card to-accent/30 shadow-soft rounded-2xl border bg-gradient-to-br p-4 sm:rounded-3xl sm:p-5"
            >
              <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase sm:text-xs">
                {item.koota}
              </p>
              <p className="font-display text-rose mt-2 text-2xl sm:text-3xl">
                {item.score}
                <span className="text-muted-foreground text-base">/{item.max}</span>
              </p>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
