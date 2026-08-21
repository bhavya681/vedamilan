"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

function PortraitCard({
  src,
  name,
  dimmed = false,
  className,
}: {
  src: string;
  name?: string;
  dimmed?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("relative w-[6.5rem] sm:w-[8.25rem]", className)}>
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/18 shadow-[0_18px_40px_rgba(0,0,0,0.35)]",
          dimmed && "opacity-40 grayscale",
        )}
      >
        <Image src={src} alt="" fill sizes="140px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110E]/55 to-transparent" />
        {name ? (
          <figcaption className="font-display text-ivory absolute inset-x-0 bottom-2 text-center text-sm">
            {name}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}

function StageBackdrop({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.35)_0%,rgba(20,17,14,0.72)_100%)]" />
    </>
  );
}

function StageVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.city.src} alt={editorial.city.alt} />
        <div className="absolute inset-0 flex items-end justify-center px-4 pb-10 sm:pb-12">
          <PortraitCard src={editorial.you.src} name="Adrian" className="-translate-x-2 -rotate-6 translate-y-3" />
          <PortraitCard src={editorial.partner.src} name="Elena" className="translate-x-2 rotate-6 translate-y-3" />
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.you.src} alt="" />
        <div className="absolute inset-0 bg-[#14110E]/35" />
        <div className="absolute inset-0 flex items-center justify-center gap-5 px-4 sm:gap-8">
          <div className="flex flex-col items-center">
            <PortraitCard src={editorial.you.src} name="Adrian" />
            <p className="border-ivory/20 bg-ivory/10 text-ivory mt-3 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase backdrop-blur-md">
              Interested
            </p>
          </div>
          <span className="from-[#D4AF37]/80 h-px w-8 bg-gradient-to-r to-transparent sm:w-12" aria-hidden />
          <div className="flex flex-col items-center">
            <PortraitCard src={editorial.partner.src} name="Elena" dimmed />
            <p className="text-ivory/45 mt-3 text-[10px] tracking-[0.16em] uppercase">Private</p>
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.conversation.src} alt={editorial.conversation.alt} />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="relative flex items-center">
            <PortraitCard src={editorial.you.src} name="Adrian" className="-translate-x-2 -rotate-3" />
            <span className="relative z-10 -mx-3 flex h-12 w-12 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-[#D4AF37]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
            </span>
            <PortraitCard src={editorial.partner.src} name="Elena" className="translate-x-2 rotate-3" />
          </div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.quiet.src} alt={editorial.quiet.alt} />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="border-ivory/15 w-full max-w-[18rem] rounded-2xl border bg-[#14110E]/75 p-5 text-[#F7F1E3] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">Compatibility</p>
              <p className="text-ivory/60 rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase">
                Guidance
              </p>
            </div>
            <p className="font-display mt-3 text-5xl leading-none tabular-nums">92%</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Vedic", "94"],
                ["Life goals", "89"],
                ["Values", "93"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-t border-white/10 pt-2">
                  <dt className="text-ivory/65">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
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
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.12)_0%,rgba(20,17,14,0.78)_100%)]" />
      <p className="font-display absolute right-6 bottom-6 left-6 text-2xl text-[#F7F1E3] sm:text-3xl">
        A household, not a match
      </p>
    </div>
  );
}

export function ConnectionJourney() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || held) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % STEPS.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [reduceMotion, held]);

  return (
    <LandingSection id="how" className="scroll-mt-24" tone="muted">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            From match to connection
          </p>
          <h2 className="font-display mt-3 max-w-xl text-[1.75rem] tracking-tight sm:text-4xl lg:text-5xl">
            Discovery is the beginning, not the product.
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Button asChild className="w-full sm:w-auto">
            <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
          </Button>
        </FadeIn>
      </div>

      <div
        className="mt-8 grid min-w-0 items-stretch gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        <nav className="order-2 flex flex-col justify-center lg:order-1">
          <ol aria-label="Connection steps">
            {STEPS.map((item, i) => {
              const selected = active === i;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-current={selected ? "step" : undefined}
                    className={cn(
                      "group flex w-full items-start gap-4 border-b py-3.5 text-left transition-colors duration-500 sm:py-4",
                      selected ? "border-[#D4AF37]/40" : "border-border/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-8 shrink-0 text-[11px] tabular-nums tracking-[0.16em]",
                        selected ? "text-[#C47A1A]" : "text-muted-foreground",
                      )}
                    >
                      0{i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "font-display block text-xl tracking-tight sm:text-2xl",
                          selected ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "text-muted-foreground grid overflow-hidden text-sm leading-relaxed transition-[grid-template-rows,opacity] duration-500",
                          selected ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="min-h-0">{item.body}</span>
                      </span>
                    </span>
                    <span className="bg-border relative mt-3 hidden h-px w-12 overflow-hidden sm:block">
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-[#D4AF37]"
                        initial={false}
                        animate={{ width: selected ? "100%" : "0%" }}
                        transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <FadeIn delay={0.08} className="order-1 lg:order-2">
          <div className="bg-navy relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/3] lg:aspect-auto lg:min-h-[32rem]">
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
                <p className="text-ivory/55 absolute top-5 left-5 text-[10px] tracking-[0.18em] uppercase">
                  {item.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </LandingSection>
  );
}
