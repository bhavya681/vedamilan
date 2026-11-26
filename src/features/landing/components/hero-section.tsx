"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";

import { Button } from "@/components/ui/button";
import { landingCta } from "@/features/landing/lib/nav";
import { useSafeReducedMotion as useReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { brand } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const SIGNALS = ["Kundli & charts", "AI Guru & wisdom", "Vedic compatibility"] as const;
const PREVIEW = [
  { title: "Kundli", detail: "Planets · Nakshatras · Dashas", glyph: "kundli" },
  { title: "AI Guru", detail: "Wisdom, explained", glyph: "guru" },
  { title: "Compatibility", detail: "Guna Milan · life goals", glyph: "compatibility" },
] as const;

type GlyphKind = (typeof PREVIEW)[number]["glyph"];

export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const finePointer = useRef(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mx = useMotionValue(50);
  const my = useMotionValue(40);
  const spotX = useSpring(mx, { stiffness: 50, damping: 22 });
  const spotY = useSpring(my, { stiffness: 50, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(38rem 28rem at ${spotX}% ${spotY}%, rgba(201,169,110,0.16), transparent 58%)`;
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    finePointer.current = window.matchMedia("(pointer: fine)").matches;
  }, []);

  function onMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || !finePointer.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(((event.clientX - rect.left) / rect.width) * 100);
    my.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(50);
        my.set(40);
      }}
      className="relative isolate min-h-0 overflow-hidden sm:min-h-[100svh]"
      aria-labelledby="hero-heading"
    >
      <div className="landing-hero-surface absolute inset-0 -z-20" aria-hidden />
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduceMotion ? undefined : { y: artY, scale: artScale }}
        aria-hidden
      >
        <svg
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          className="text-foreground h-full w-full opacity-[0.14]"
        >
          <g fill="none" stroke="#C9A96E">
            <circle cx="900" cy="360" r="258" strokeOpacity="0.32" strokeDasharray="2 12" />
            <circle cx="900" cy="360" r="182" strokeOpacity="0.24" />
            <path d="M900 102 L1158 360 L900 618 L642 360 Z" strokeOpacity="0.28" />
            <path d="M642 360 H1158 M900 102 V618" strokeOpacity="0.14" />
            <circle cx="900" cy="102" r="2.5" fill="#C9A96E" stroke="none" />
            <circle cx="1158" cy="360" r="2" fill="currentColor" stroke="none" opacity="0.75" />
          </g>
        </svg>
      </motion.div>
      <div className="landing-hero-wash absolute inset-0 -z-10" aria-hidden />
      <div
        className="from-background via-background/50 absolute inset-x-0 bottom-0 -z-10 h-[18%] bg-gradient-to-t to-transparent md:h-[26%]"
        aria-hidden
      />
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
          style={{ background: spotlight }}
          aria-hidden
        />
      ) : null}
      <div className="landing-hero-grain -z-10 hidden md:block" aria-hidden />

      <FrameMarks />

      <div className="landing-container relative grid items-end gap-8 pt-[calc(5.75rem+var(--landing-notice,0px)+env(safe-area-inset-top,0px))] pb-10 sm:min-h-[100svh] sm:pb-14 md:items-center md:pb-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12 lg:pb-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] xl:gap-16 2xl:gap-24">
        <div className="max-w-xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-muted-foreground flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-[11px] sm:tracking-[0.26em]"
          >
            <span className="bg-gold inline-block h-px w-8" aria-hidden />
            {brand.tagline}
          </motion.p>

          <h1
            id="hero-heading"
            className="font-display text-foreground mt-4 text-[2.15rem] leading-[1.05] tracking-tight text-balance sm:mt-5 sm:text-4xl md:text-5xl lg:text-[4.15rem] lg:leading-[0.98]"
          >
            <motion.span
              className="block"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.06 }}
            >
              Discover the intelligence
            </motion.span>
            <motion.span
              className="mt-1 block"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.14 }}
            >
              of your{" "}
              <em className="relative inline-block italic">
                Vedic universe
                <span className="bg-gold/80 absolute inset-x-0 -bottom-1 h-px" aria-hidden />
              </em>
              .
            </motion.span>
          </h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.24 }}
            className="text-muted-foreground mt-6 max-w-md text-sm leading-relaxed sm:text-base"
          >
            Explore your Kundli, understand ancient wisdom with AI, and discover meaningful
            compatibility — all in one intelligent platform.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.34 }}
            className="mt-6 flex w-full max-w-lg flex-col gap-3 sm:mt-8 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90 h-12 w-full sm:w-auto"
            >
              <Link href={landingCta.explore.href}>
                {landingCta.explore.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-background/10 text-foreground hover:bg-foreground/10 h-12 w-full backdrop-blur-sm sm:w-auto"
            >
              <Link href={landingCta.getStarted.href}>{landingCta.getStarted.label}</Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.48 }}
            className="text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] tracking-[0.14em] uppercase"
          >
            {SIGNALS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="bg-gold/80 h-1 w-1 rounded-full" aria-hidden />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <PlatformPreview reduceMotion={Boolean(reduceMotion)} />
      </div>

      <motion.a
        href="#experiences"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="group absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 sm:bottom-5 sm:flex"
        aria-label="Scroll to explore"
      >
        <span className="border-border bg-card/60 text-muted-foreground group-hover:text-foreground group-hover:border-gold/50 shadow-soft rounded-full border px-3 py-1.5 text-[9px] font-semibold tracking-[0.22em] uppercase backdrop-blur-md transition-colors sm:text-[10px]">
          Explore
        </span>
        <span className="relative h-12 w-6" aria-hidden>
          <span className="from-gold/0 via-foreground/25 to-gold/0 absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b" />
          <span className="absolute top-0 left-1/2 -translate-x-1/2">
            <motion.span
              className="bg-gold block h-3 w-1.5 rounded-full shadow-[0_0_12px_rgba(201,169,110,0.65)]"
              animate={reduceMotion ? undefined : { y: [0, 28, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <span className="text-gold absolute -bottom-1.5 left-1/2 -translate-x-1/2">
            <motion.span
              className="block"
              animate={reduceMotion ? undefined : { y: [0, 3, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </span>
        </span>
      </motion.a>
    </section>
  );
}

function PlatformPreview({ reduceMotion }: { reduceMotion: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const rx = useSpring(0, { stiffness: 140, damping: 18 });
  const ry = useSpring(0, { stiffness: 140, damping: 18 });

  function onMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    ry.set(((event.clientX - rect.left) / rect.width - 0.5) * 10);
    rx.set((0.5 - (event.clientY - rect.top) / rect.height) * 8);
  }

  return (
    <motion.aside
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, ease, delay: 0.22 }}
      style={{
        rotateX: reduceMotion ? 0 : rx,
        rotateY: reduceMotion ? 0 : ry,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      className="relative mx-auto w-full max-w-[20rem] sm:max-w-[24rem] lg:mx-0 lg:justify-self-end xl:max-w-[28rem] 2xl:max-w-[32rem]"
      aria-label="Illustrative KUNDLIV platform preview"
    >
      <div
        className="landing-hero-glow bg-gold/18 pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        aria-hidden
      />

      <svg
        viewBox="0 0 360 360"
        className="landing-hero-ring text-foreground pointer-events-none absolute -top-6 -right-8 hidden h-[22rem] w-[22rem] opacity-50 sm:block"
        aria-hidden
      >
        <circle
          cx="180"
          cy="180"
          r="148"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="0.6"
          strokeDasharray="3 10"
        />
        <circle
          cx="180"
          cy="180"
          r="118"
          fill="none"
          stroke="#C9A96E"
          strokeOpacity="0.35"
          strokeWidth="0.7"
        />
        <circle cx="180" cy="32" r="2.2" fill="#C9A96E" />
        <circle cx="318" cy="180" r="1.6" fill="currentColor" fillOpacity="0.7" />
      </svg>

      <div className="border-border bg-card/80 shadow-elevated mt-5 rounded-2xl border p-4 backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
            Platform preview
          </p>
          <p className="text-foreground/70 border-border rounded-full border px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase">
            Illustrative
          </p>
        </div>
        <ul className="mt-4 space-y-3">
          {PREVIEW.map((item, i) => (
            <li key={item.title} className="flex items-center gap-3">
              <span className="border-border bg-foreground/5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                <PreviewGlyph kind={item.glyph} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-foreground block text-sm">{item.title}</span>
                <span className="text-muted-foreground block text-[11px]">{item.detail}</span>
              </span>
              <span className="text-muted-foreground text-[10px] tracking-[0.16em] tabular-nums">
                0{i + 1}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-border text-muted-foreground mt-5 border-t pt-4 text-[10px] tracking-[0.12em] uppercase">
          Engine-calculated charts · AI-guided explanations
        </p>
      </div>
    </motion.aside>
  );
}

function PreviewGlyph({ kind }: { kind: GlyphKind }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#C9A96E" aria-hidden>
      {kind === "kundli" ? (
        <>
          <path d="M12 3 L21 12 L12 21 L3 12 Z" strokeOpacity="0.85" />
          <path d="M3 12 H21 M12 3 V21" strokeOpacity="0.35" />
        </>
      ) : null}
      {kind === "guru" ? (
        <>
          <rect x="3" y="4" width="13" height="10" rx="3" strokeOpacity="0.8" />
          <path d="M6 8h7 M6 11h4" strokeOpacity="0.5" strokeLinecap="round" />
          <circle cx="19" cy="18" r="2" strokeOpacity="0.6" />
        </>
      ) : null}
      {kind === "compatibility" ? (
        <>
          <circle cx="9" cy="12" r="6" strokeOpacity="0.75" />
          <circle cx="15" cy="12" r="6" strokeOpacity="0.45" />
          <circle cx="12" cy="12" r="1.6" fill="#C9A96E" stroke="none" />
        </>
      ) : null}
    </svg>
  );
}

function FrameMarks() {
  const mark = "border-foreground/25 pointer-events-none absolute h-5 w-5";
  return (
    <div className="hidden lg:block" aria-hidden>
      <span className={cn(mark, "top-[5.5rem] left-8 border-t border-l")} />
      <span className={cn(mark, "top-[5.5rem] right-8 border-t border-r")} />
      <span className={cn(mark, "bottom-10 left-8 border-b border-l")} />
      <span className={cn(mark, "right-8 bottom-10 border-r border-b")} />
    </div>
  );
}
