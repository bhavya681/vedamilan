"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { editorial } from "@/features/landing/lib/images";
import { landingCta } from "@/features/landing/lib/nav";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    title: "Discover",
    body: "People who already sit near your values and chart.",
    caption: "Values · chart · life path",
  },
  {
    title: "Interested",
    body: "A respectful signal. Nothing is public until it is mutual.",
    caption: "Private until both say yes",
  },
  {
    title: "Mutual connection",
    body: "Only then does a conversation space open.",
    caption: "A shared space, not a public feed",
  },
  {
    title: "Understand each other",
    body: "Compatibility, questions, and calm AI guidance.",
    caption: "Illustrative preview",
  },
  {
    title: "Build a future",
    body: "VedaMilan is not designed to stop at a match.",
    caption: "A household, not a swipe",
  },
] as const;

function Face({ src, dimmed = false }: { src: string; dimmed?: boolean }) {
  return (
    <div
      className={cn(
        "relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-white/20 sm:h-24 sm:w-24",
        dimmed && "opacity-35 grayscale",
      )}
    >
      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
    </div>
  );
}

function StageVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-full items-center justify-center gap-6 sm:gap-10">
        <Face src={editorial.you.src} />
        <span className="bg-gold/80 h-px w-8 sm:w-12" aria-hidden />
        <Face src={editorial.partner.src} />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flex h-full items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center">
          <Face src={editorial.you.src} />
          <p className="text-ivory mt-3 text-[10px] tracking-[0.16em] uppercase">Interested</p>
        </div>
        <span className="from-gold/80 h-px w-10 bg-gradient-to-r to-transparent sm:w-16" aria-hidden />
        <div className="flex flex-col items-center">
          <Face src={editorial.partner.src} dimmed />
          <p className="text-ivory/40 mt-3 text-[10px] tracking-[0.16em] uppercase">Private</p>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
        <Face src={editorial.you.src} />
        <span className="relative flex h-9 w-9 items-center justify-center">
          <span className="border-gold/70 absolute inset-0 rounded-full border" />
          <span className="bg-gold h-2 w-2 rounded-full" />
        </span>
        <Face src={editorial.partner.src} />
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="border-ivory/15 bg-[#14110E]/50 w-full max-w-xs rounded-2xl border p-5 text-[#F7F1E3] backdrop-blur-md">
          <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">Compatibility</p>
          <p className="font-display mt-2 text-5xl leading-none tabular-nums">92%</p>
          <dl className="mt-4 space-y-1.5 text-sm">
            {[
              ["Vedic", "94"],
              ["Life goals", "89"],
              ["Values", "93"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-white/10 pt-1.5">
                <dt className="text-ivory/65">{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Image
        src={editorial.quiet.src}
        alt={editorial.quiet.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.15)_0%,rgba(20,17,14,0.72)_100%)]" />
      <p className="font-display absolute right-6 bottom-6 left-6 text-2xl text-[#F7F1E3] sm:text-3xl">
        A household, not a match
      </p>
    </div>
  );
}

export function ConnectionJourney() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const step = STEPS[active];

  return (
    <LandingSection id="how" className="scroll-mt-24" tone="muted">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            From match to connection
          </p>
          <h2 className="font-display mt-3 max-w-xl text-3xl tracking-tight sm:text-5xl">
            Discovery is the beginning, not the product.
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Button asChild>
            <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
          </Button>
        </FadeIn>
      </div>

      <div className="mt-12">
        <ol className="flex items-center" aria-label="Connection steps">
          {STEPS.map((item, i) => (
            <li key={item.title} className="flex min-w-0 flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={active === i ? "step" : undefined}
                className="group flex shrink-0 flex-col items-center"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border text-xs tabular-nums transition-colors duration-500",
                    i === active && "border-[#D4AF37] bg-navy text-[#F7F1E3]",
                    i < active && "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-foreground",
                    i > active && "border-border bg-background text-muted-foreground",
                  )}
                >
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    "mt-3 hidden max-w-[7.5rem] text-center text-[11px] tracking-[0.08em] sm:block",
                    i === active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
              </button>
              {i < STEPS.length - 1 ? (
                <div className="bg-border/70 mx-2 h-px min-w-4 flex-1 overflow-hidden sm:mx-3">
                  <motion.div
                    className="h-px origin-left bg-[#D4AF37]"
                    initial={false}
                    animate={{ scaleX: i < active ? 1 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
        <div className="bg-navy relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[5/3]">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.title}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: active === i ? 1 : 0,
                scale: active === i || reduceMotion ? 1 : 1.03,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease }}
              style={{ pointerEvents: active === i ? "auto" : "none" }}
              aria-hidden={active !== i}
            >
              <StageVisual index={i} />
              <p className="text-ivory/45 absolute top-5 left-5 text-[10px] tracking-[0.18em] uppercase">
                {item.caption}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-muted-foreground text-xs tabular-nums">0{active + 1} / 05</p>
          <motion.h3
            key={step.title}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="font-display mt-3 text-3xl tracking-tight sm:text-4xl"
          >
            {step.title}
          </motion.h3>
          <motion.p
            key={step.body}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.05, ease }}
            className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base"
          >
            {step.body}
          </motion.p>
          <p className="text-muted-foreground mt-8 text-xs sm:hidden">{step.title}</p>
        </div>
      </div>
    </LandingSection>
  );
}
