"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useSafeReducedMotion as useReducedMotion } from "@/hooks/use-safe-reduced-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { editorial } from "@/features/landing/lib/images";
import { landingCta } from "@/features/landing/lib/nav";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    title: "Begin with your kundli",
    body: "Add birth details and see an engine-calculated chart.",
    caption: "Swiss Ephemeris · Lahiri",
  },
  {
    title: "Ask the AI Guru",
    body: "Explore Vedic knowledge and get explanations grounded in your chart.",
    caption: "AI explains · never invents",
  },
  {
    title: "Explore compatibility",
    body: "Read Guna Milan, planetary themes and life goals together.",
    caption: "Interpretation, not certainty",
  },
  {
    title: "Connect privately",
    body: "Interest stays private until it is mutual.",
    caption: "Private by design",
  },
  {
    title: "Continue the journey",
    body: "Return to dashas, transits and reflective guidance as life unfolds.",
    caption: "Illustrative preview",
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
          "relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/18",
          dimmed && "opacity-40 grayscale",
        )}
      >
        <Image src={src} alt="" fill sizes="140px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/55 to-transparent" />
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
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.72)_100%)]" />
    </>
  );
}

function StageVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="relative h-full bg-[#080808]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(201,169,110,0.18),transparent_62%)]"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <svg
            viewBox="0 0 240 240"
            className="h-[72%] w-[72%] max-w-[18rem] text-[#F4F0E7]"
            aria-hidden
          >
            <rect
              x="18"
              y="18"
              width="204"
              height="204"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
            />
            <polygon
              points="120,18 222,120 120,222 18,120"
              fill="none"
              stroke="#C9A96E"
              strokeWidth="1.2"
            />
            <path d="M18 120H222 M120 18V222" stroke="currentColor" strokeOpacity="0.16" />
            <circle cx="120" cy="120" r="3" fill="#F4F0E7" />
            <circle cx="72" cy="72" r="2" fill="#C9A96E" />
            <circle cx="168" cy="168" r="2" fill="#C9A96E" />
          </svg>
        </div>
        <p className="text-ivory/55 absolute right-6 bottom-6 left-6 text-center text-xs tracking-[0.14em] uppercase">
          Engine-calculated chart
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative h-full bg-[#080808]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(201,169,110,0.16),transparent_60%)]"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="border-ivory/15 w-full max-w-[19rem] rounded-2xl border bg-[#080808]/80 p-5 text-[#F4F0E7] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">AI Guru</p>
            <p className="font-display mt-3 text-2xl tracking-tight">Ask about your chart.</p>
            <p className="text-ivory/75 mt-2 text-sm leading-relaxed">
              Explanations stay grounded in calculated positions.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Kundli", "Dashas", "Wisdom"].map((label) => (
                <span
                  key={label}
                  className="border-ivory/20 text-ivory/65 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.city.src} alt={editorial.city.alt} />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="border-ivory/15 w-full max-w-[18rem] rounded-2xl border bg-[#121212]/75 p-5 text-[#F4F0E7] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">Compatibility</p>
              <p className="text-ivory/60 rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase">
                Interpretation
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

  if (index === 3) {
    return (
      <div className="relative h-full">
        <StageBackdrop src={editorial.you.src} alt="" />
        <div className="absolute inset-0 bg-[#121212]/35" />
        <div className="absolute inset-0 flex items-center justify-center gap-5 px-4 sm:gap-8">
          <div className="flex flex-col items-center">
            <PortraitCard src={editorial.you.src} name="Adrian" />
            <p className="border-ivory/20 bg-ivory/10 text-ivory mt-3 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase backdrop-blur-md">
              Interested
            </p>
          </div>
          <span
            className="h-px w-8 bg-gradient-to-r from-[#C9A96E]/80 to-transparent sm:w-12"
            aria-hidden
          />
          <div className="flex flex-col items-center">
            <PortraitCard src={editorial.partner.src} name="Elena" dimmed />
            <p className="text-ivory/45 mt-3 text-[10px] tracking-[0.16em] uppercase">Private</p>
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.78)_100%)]" />
      <p className="font-display absolute right-6 bottom-6 left-6 text-2xl text-[#F4F0E7] sm:text-3xl">
        A journey, not a verdict
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
            How KUNDLIV works
          </p>
          <h2 className="font-display mt-3 max-w-xl text-[1.75rem] tracking-tight sm:text-4xl lg:text-5xl">
            Chart, wisdom and connection — one clear path.
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Button asChild className="w-full sm:w-auto">
            <Link href={landingCta.getStarted.href}>{landingCta.getStarted.label}</Link>
          </Button>
        </FadeIn>
      </div>

      <div
        className="mt-8 grid min-w-0 items-stretch gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-16"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        <nav className="order-2 flex flex-col justify-center lg:order-1">
          <ol aria-label="How KUNDLIV works">
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
                      selected ? "border-[#C9A96E]/40" : "border-border/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-8 shrink-0 text-[11px] tracking-[0.16em] tabular-nums",
                        selected ? "text-[#C9A96E]" : "text-muted-foreground",
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
                          selected
                            ? "mt-1.5 grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="min-h-0">{item.body}</span>
                      </span>
                    </span>
                    <span className="bg-border relative mt-3 hidden h-px w-12 overflow-hidden sm:block">
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-[#C9A96E]"
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
          <div className="bg-ink relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/3] lg:aspect-auto lg:min-h-[32rem]">
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
