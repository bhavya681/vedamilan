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
import { landingImages } from "@/lib/constants/images";
import { routes } from "@/lib/constants/routes";
import { mockGunaMilan } from "@/lib/mock/vedamilan";

export function LandingSearchSection() {
  const [query, setQuery] = useState("");

  return (
    <LandingSection id="discover" innerClassName="!pt-10 sm:!pt-12 lg:!pt-14">
      <FadeIn>
        <div className="border-border/50 bg-card shadow-elevated overflow-hidden rounded-[1.5rem] border">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 md:p-10">
              <p className="text-secondary text-[11px] font-semibold tracking-[0.18em] uppercase">
                Discover
              </p>
              <h2 className="font-display mt-3 text-2xl tracking-tight sm:text-3xl md:text-4xl">
                Search with intention
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed sm:text-base">
                Start with city or profession—then deepen with Vedic compatibility once you join.
              </p>
              <form
                className="mt-7 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Bengaluru · Designer · Family-oriented"
                    className="bg-background h-12 border-[color:var(--border)] pl-10"
                    aria-label="Search profiles"
                  />
                </div>
                <Button asChild size="lg" className="h-12 shrink-0">
                  <Link href={routes.register}>Find matches</Link>
                </Button>
              </form>
            </div>
            <div className="bg-navy relative hidden min-h-[16rem] lg:block">
              <Image
                src={landingImages.searchAtmosphere.src}
                alt=""
                fill
                sizes="480px"
                className="object-cover opacity-80"
              />
              <div className="from-navy/30 to-navy/80 absolute inset-0 bg-gradient-to-l" />
            </div>
          </div>
        </div>
      </FadeIn>
    </LandingSection>
  );
}

export function SuccessStoriesStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="stories">
      <FadeIn>
        <SectionIntro
          eyebrow="Stories"
          title="Quiet beginnings. Real unions."
          description="Members who found alignment through kundli-first matching."
          align="center"
        />
      </FadeIn>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {landingImages.stories.map((story, index) => (
          <FadeIn key={story.title} delay={0.05 * index}>
            <motion.article
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[1.25rem]"
            >
              <Image
                src={story.src}
                alt={story.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="from-navy via-navy/30 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="text-ivory absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-xl tracking-tight">{story.title}</p>
                <p className="text-ivory/70 mt-1.5 flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {story.place}
                </p>
                <p className="text-gold mt-2 inline-flex items-center gap-1.5 text-xs">
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                  Matched on VedaMilan
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
    <LandingSection id="ai-demo">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <SectionIntro
            eyebrow="Explainable AI"
            title="Insight you can verify"
            description="AI interprets your charts—it never invents planetary positions. See why two people align across values and Vedic signals."
          />
          <Button asChild className="mt-7" variant="secondary">
            <Link href={routes.register}>
              <Sparkles className="h-4 w-4" />
              Create your profile
            </Link>
          </Button>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="border-border/60 bg-card shadow-elevated relative overflow-hidden rounded-[1.5rem] border p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_70%)]"
              aria-hidden
            />
            <p className="text-foreground/90 relative text-[15px] leading-relaxed sm:text-base">
              “You share elevated emotional compatibility driven by Moon–Venus harmony and aligned
              family expectations. Career windows overlap in late 2026—an ideal season for sincere
              introductions.”
            </p>
            <div className="relative mt-8 flex flex-wrap items-center gap-5 sm:gap-6">
              <ProgressRing value={89} label="AI" />
              <ProgressRing value={92} label="Vedic" />
              <ProgressRing value={87} label="Values" />
            </div>
          </div>
        </FadeIn>
      </div>
    </LandingSection>
  );
}

export function CompatibilityPreviewSection() {
  return (
    <LandingSection id="compatibility" tone="muted">
      <FadeIn>
        <SectionIntro
          eyebrow="Compatibility"
          title="Ashta Koota, made clear"
          description="Classical scoring presented so couples and families can decide together."
          align="center"
        />
      </FadeIn>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {mockGunaMilan.map((item, index) => (
          <FadeIn key={item.koota} delay={0.03 * index}>
            <div className="border-border/60 bg-card shadow-soft rounded-2xl border px-4 py-5 text-center sm:px-5 sm:py-6">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                {item.koota}
              </p>
              <p className="font-display text-foreground mt-2 text-3xl tracking-tight">
                {item.score}
                <span className="text-muted-foreground font-sans text-base">/{item.max}</span>
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
