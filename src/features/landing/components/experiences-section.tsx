"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { useSafeReducedMotion as useReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { LandingSection } from "@/components/layout/landing-section";
import { landingCta } from "@/features/landing/lib/nav";
import { routes } from "@/lib/constants/routes";

const ease = [0.22, 1, 0.36, 1] as const;

const EXPERIENCES = [
  {
    n: "01",
    kicker: "Vedic astrology",
    title: "Understand Your Vedic Blueprint.",
    description:
      "Explore your Kundli, planetary positions, Nakshatras, Dashas, Yogas and personalized Vedic insights.",
    href: routes.kundli,
    cta: landingCta.kundli.label,
    visual: "kundli",
  },
  {
    n: "02",
    kicker: "AI Guru & Rishi wisdom",
    title: "Ancient Wisdom. Intelligent Guidance.",
    description:
      "Ask questions, explore Vedic knowledge and understand traditional wisdom through your AI-powered guidance experience.",
    href: landingCta.guru.href,
    cta: landingCta.guru.label,
    visual: "guru",
  },
  {
    n: "03",
    kicker: "Matchmaking & compatibility",
    title: "Discover Meaningful Compatibility.",
    description:
      "Explore Vedic compatibility, relationship alignment, Guna Milan and meaningful connections.",
    href: landingCta.compatibility.href,
    cta: landingCta.compatibility.label,
    visual: "compatibility",
  },
] as const;

type VisualKind = (typeof EXPERIENCES)[number]["visual"];

export function ThreeExperiences() {
  return (
    <LandingSection id="experiences" className="scroll-mt-24" tone="muted">
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          One platform
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-[1.75rem] tracking-tight text-balance sm:text-4xl lg:text-5xl">
          One Vedic universe. Three ways to explore it.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
          KUNDLIV brings your chart, Vedic wisdom and compatibility into a single, considered
          experience.
        </p>
      </FadeIn>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3 lg:gap-5 xl:gap-6 2xl:gap-8">
        {EXPERIENCES.map((item, i) => (
          <ExperienceCard key={item.n} item={item} index={i} />
        ))}
      </div>
    </LandingSection>
  );
}

function ExperienceCard({ item, index }: { item: (typeof EXPERIENCES)[number]; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={
        reduceMotion ? undefined : { y: -5, transition: { duration: 0.45, delay: 0, ease } }
      }
      transition={{ duration: 0.55, delay: 0.06 * index, ease }}
      className="h-full"
    >
      <Link
        href={item.href}
        className="group border-border/60 bg-card/60 flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-500 hover:border-[#C9A96E]/50"
      >
        <ExperienceVisual kind={item.visual} />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-secondary text-[10px] font-semibold tracking-[0.18em] uppercase">
              {item.kicker}
            </p>
            <span className="text-muted-foreground text-[10px] tracking-[0.16em] tabular-nums">
              {item.n}
            </span>
          </div>
          <h3 className="font-display mt-3 text-xl leading-snug tracking-tight sm:text-2xl">
            {item.title}
          </h3>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.description}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-medium tracking-[0.14em] uppercase">
            {item.cta}
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function ExperienceVisual({ kind }: { kind: VisualKind }) {
  return (
    <div className="relative h-28 overflow-hidden bg-[#080808] sm:h-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(201,169,110,0.18),transparent_62%)]"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center text-[#F4F0E7]">
        {kind === "kundli" ? <KundliMotif /> : null}
        {kind === "guru" ? <GuruMotif /> : null}
        {kind === "compatibility" ? <CompatibilityMotif /> : null}
      </div>
      <span className="absolute right-5 bottom-3 text-[9px] tracking-[0.2em] text-[#F4F0E7]/40 uppercase">
        Illustrative
      </span>
    </div>
  );
}

function KundliMotif() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
      <g transform="translate(100 55)" fill="none" stroke="#C9A96E">
        <path d="M0 -37 L37 0 L0 37 L-37 0 Z" strokeOpacity="0.7" />
        <path d="M-37 0 H37 M0 -37 V37" strokeOpacity="0.22" />
        <path d="M-51 0 H51 M0 -51 V51" strokeOpacity="0.12" />
        <circle cx="0" cy="0" r="2.4" fill="#F4F0E7" stroke="none" />
        <circle cx="-21" cy="-13" r="1.8" fill="#C9A96E" stroke="none" />
        <circle cx="23" cy="14" r="1.8" fill="#C9A96E" stroke="none" />
        <circle cx="-14" cy="25" r="1.4" fill="#F4F0E7" stroke="none" />
      </g>
    </svg>
  );
}

function GuruMotif() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
      <g fill="none" stroke="#C9A96E" strokeWidth="1">
        <rect x="38" y="20" width="96" height="42" rx="11" strokeOpacity="0.55" />
        <path d="M54 35h58 M54 46h37" strokeOpacity="0.4" strokeLinecap="round" />
        <rect x="66" y="55" width="94" height="38" rx="11" strokeOpacity="0.35" />
        <path d="M82 69h58 M82 80h38" strokeOpacity="0.3" strokeLinecap="round" />
      </g>
      <circle cx="161" cy="21" r="2.4" fill="#F4F0E7" opacity="0.8" />
      <circle cx="37" cy="93" r="1.6" fill="#C9A96E" opacity="0.7" />
    </svg>
  );
}

function CompatibilityMotif() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
      <g fill="none" stroke="#C9A96E" strokeWidth="1">
        <path d="M62 16 L96 50 L62 84 L28 50 Z" strokeOpacity="0.65" />
        <path d="M138 16 L172 50 L138 84 L104 50 Z" strokeOpacity="0.45" />
        <path d="M96 50 H104" strokeOpacity="0.8" />
        <circle cx="100" cy="50" r="14" strokeOpacity="0.8" />
      </g>
      <circle cx="100" cy="50" r="2.4" fill="#F4F0E7" />
      <circle cx="62" cy="16" r="1.8" fill="#F4F0E7" opacity="0.7" />
      <circle cx="172" cy="84" r="1.4" fill="#C9A96E" opacity="0.8" />
    </svg>
  );
}
