"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { Button } from "@/components/ui/button";
import { editorial } from "@/features/landing/lib/images";
import { landingCta } from "@/features/landing/lib/nav";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const SCORE = 92;
const LAYERS = [
  { label: "Vedic", value: 94 },
  { label: "Values", value: 93 },
  { label: "Life goals", value: 89 },
] as const;
const SIGNALS = ["Private by design", "Vedic compatibility", "Human preferences"] as const;

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
  const spotlight = useMotionTemplate`radial-gradient(38rem 28rem at ${spotX}% ${spotY}%, rgba(212,175,55,0.22), transparent 58%)`;
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

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
      className="relative isolate overflow-hidden min-h-0 sm:min-h-[100svh]"
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        aria-hidden
      >
        <Image
          src={editorial.hero.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%]"
        />
      </motion.div>

      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(108deg,rgba(20,17,14,0.92)_0%,rgba(20,17,14,0.62)_42%,rgba(20,17,14,0.18)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(20,17,14,0.35),transparent_42%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[18%] bg-gradient-to-t from-[#F7F1E3] via-[#F7F1E3]/50 to-transparent md:h-[26%]"
        aria-hidden
      />
      {!reduceMotion ? (
        <motion.div className="pointer-events-none absolute inset-0 -z-10 hidden md:block" style={{ background: spotlight }} aria-hidden />
      ) : null}
      <div className="landing-hero-grain -z-10 hidden md:block" aria-hidden />

      <FrameMarks />

      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-8 px-4 pt-[calc(5.75rem+var(--landing-notice,0px)+env(safe-area-inset-top,0px))] pb-10 sm:min-h-[100svh] sm:px-6 sm:pb-14 md:items-center md:pb-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12 lg:px-8 lg:pb-16">
        <div className="max-w-xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-ivory/72 flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-[11px] sm:tracking-[0.26em]"
          >
            <span className="bg-[#D4AF37] inline-block h-px w-8" aria-hidden />
            Where compatibility meets destiny
          </motion.p>

          <h1
            id="hero-heading"
            className="font-display text-ivory mt-4 text-[2.15rem] leading-[1.05] tracking-tight text-balance sm:mt-5 sm:text-4xl md:text-5xl lg:text-[4.15rem] lg:leading-[0.98]"
          >
            <motion.span
              className="block"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.06 }}
            >
              Find someone
            </motion.span>
            <motion.span
              className="mt-1 block"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.14 }}
            >
              who{" "}
              <em className="relative inline-block italic">
                aligns
                <span className="absolute inset-x-0 -bottom-1 h-px bg-[#D4AF37]/80" aria-hidden />
              </em>{" "}
              with your life.
            </motion.span>
          </h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.24 }}
            className="text-ivory/78 mt-6 max-w-md text-sm leading-relaxed sm:text-base"
          >
            Modern matchmaking, Vedic compatibility, and guidance you can actually understand — so
            you find a partner who fits your values, timing, and household, not just a profile.
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
              className="h-12 w-full bg-[#F7F1E3] text-[#14110E] shadow-[0_12px_40px_rgba(247,241,227,0.16)] hover:bg-[#F7F1E3]/90 sm:w-auto"
            >
              <Link href={landingCta.match.href}>
                {landingCta.match.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ivory/30 bg-ivory/5 text-ivory hover:bg-ivory/10 h-12 w-full backdrop-blur-sm sm:w-auto"
            >
              <Link href={landingCta.compatibility.href}>{landingCta.compatibility.label}</Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.48 }}
            className="text-ivory/58 mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] tracking-[0.14em] uppercase"
          >
            {SIGNALS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="bg-[#D4AF37]/80 h-1 w-1 rounded-full" aria-hidden />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <MatchPreview reduceMotion={Boolean(reduceMotion)} />
      </div>

      <motion.a
        href="#discover"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="text-foreground/45 hover:text-foreground absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.22em] uppercase lg:flex"
      >
        <span>Begin</span>
        <span className="bg-foreground/20 relative h-10 w-px overflow-hidden" aria-hidden>
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-[#D4AF37]"
            animate={reduceMotion ? undefined : { y: [0, 24, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}

function MatchPreview({ reduceMotion }: { reduceMotion: boolean }) {
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
      className="relative mx-auto w-full max-w-[20rem] sm:max-w-[24rem] lg:mx-0 lg:justify-self-end"
      aria-label="Illustrative compatibility preview"
    >
      <div className="landing-hero-glow pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/18 blur-3xl" aria-hidden />

      <svg viewBox="0 0 360 360" className="landing-hero-ring pointer-events-none absolute -top-6 -right-8 hidden h-[22rem] w-[22rem] opacity-50 sm:block" aria-hidden>
        <circle cx="180" cy="180" r="148" fill="none" stroke="#F7F1E3" strokeOpacity="0.14" strokeWidth="0.6" strokeDasharray="3 10" />
        <circle cx="180" cy="180" r="118" fill="none" stroke="#D4AF37" strokeOpacity="0.35" strokeWidth="0.7" />
        <circle cx="180" cy="32" r="2.2" fill="#D4AF37" />
        <circle cx="318" cy="180" r="1.6" fill="#F7F1E3" fillOpacity="0.7" />
      </svg>

      <div className="relative flex items-end justify-center px-1 pt-4">
        <PreviewPerson
          label="You"
          name="Adrian"
          src={editorial.you.src}
          className="-rotate-6 translate-y-3"
          delay={0.32}
          reduceMotion={reduceMotion}
        />
        <ScoreOrb reduceMotion={reduceMotion} />
        <PreviewPerson
          label="Partner"
          name="Elena"
          src={editorial.partner.src}
          className="rotate-6 translate-y-3"
          delay={0.4}
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="border-ivory/14 mt-5 rounded-2xl border bg-[#14110E]/72 p-4 shadow-[0_28px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-ivory/50 text-[10px] tracking-[0.2em] uppercase">Product preview</p>
          <p className="text-ivory/70 rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase">
            Strong alignment
          </p>
        </div>
        <dl className="mt-4 space-y-3">
          {LAYERS.map((layer, i) => (
            <div key={layer.label}>
              <div className="flex items-center justify-between text-xs">
                <dt className="text-ivory/70">{layer.label}</dt>
                <dd className="text-ivory tabular-nums">{layer.value}</dd>
              </div>
              <div className="mt-1.5 h-px overflow-hidden bg-white/10">
                <motion.div
                  className="h-px origin-left bg-[#D4AF37]"
                  initial={reduceMotion ? { scaleX: layer.value / 100 } : { scaleX: 0 }}
                  animate={{ scaleX: layer.value / 100 }}
                  transition={{ duration: 0.9, delay: 0.45 + i * 0.08, ease }}
                />
              </div>
            </div>
          ))}
        </dl>
      </div>
    </motion.aside>
  );
}

function ScoreOrb({ reduceMotion }: { reduceMotion: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - SCORE / 100);

  return (
    <div className="relative z-10 -mx-3 mb-8 flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center sm:-mx-5 sm:mb-10 sm:h-[6.75rem] sm:w-[6.75rem]">
      <div className="absolute inset-0 rounded-full bg-[#14110E]/80 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/15 backdrop-blur-md" />
      <svg viewBox="0 0 88 88" className="relative -rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(247,241,227,0.16)" strokeWidth="1.6" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduceMotion ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.35, delay: 0.45, ease }}
        />
      </svg>
      <p className="font-display text-ivory absolute inset-0 flex flex-col items-center justify-center leading-none">
        <AnimatedScore value={SCORE} reduceMotion={reduceMotion} />
        <span className="text-ivory/50 mt-1 text-[9px] tracking-[0.18em] uppercase">Match</span>
      </p>
    </div>
  );
}

function AnimatedScore({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const spring = useSpring(reduceMotion ? value : 0, { stiffness: 70, damping: 18 });
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useMotionValueEvent(spring, "change", (next) => {
    setShown(Math.round(next));
  });

  return <span className="text-[1.5rem] tabular-nums sm:text-[1.85rem]">{shown}</span>;
}

function PreviewPerson({
  label,
  name,
  src,
  className,
  delay,
  reduceMotion,
}: {
  label: string;
  name: string;
  src: string;
  className?: string;
  delay: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay }}
      className={cn("w-[5.5rem] sm:w-[7.25rem] md:w-[8.25rem]", className)}
    >
      <p className="text-ivory/55 mb-2 text-center text-[10px] tracking-[0.18em] uppercase">{label}</p>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/20 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <Image src={src} alt="" fill sizes="160px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110E]/55 to-transparent" />
        <figcaption className="font-display text-ivory absolute inset-x-0 bottom-2 text-center text-sm">{name}</figcaption>
      </div>
    </motion.figure>
  );
}

function FrameMarks() {
  const mark = "pointer-events-none absolute h-5 w-5 border-[#F7F1E3]/25";
  return (
    <div className="hidden lg:block" aria-hidden>
      <span className={cn(mark, "top-[5.5rem] left-8 border-t border-l")} />
      <span className={cn(mark, "top-[5.5rem] right-8 border-t border-r")} />
      <span className={cn(mark, "bottom-10 left-8 border-b border-l")} />
      <span className={cn(mark, "bottom-10 right-8 border-b border-r")} />
    </div>
  );
}
