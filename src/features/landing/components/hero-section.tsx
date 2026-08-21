"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type PointerEvent } from "react";

import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { editorial } from "@/features/landing/lib/images";
import { landingCta } from "@/features/landing/lib/nav";

const ease = [0.22, 1, 0.36, 1] as const;

export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const starX = useSpring(mx, { stiffness: 40, damping: 20 });
  const starY = useSpring(my, { stiffness: 40, damping: 20 });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  function onMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    my.set(((event.clientY - rect.top) / rect.height - 0.5) * 10);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative isolate min-h-[100svh] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduceMotion ? undefined : { y: imageY }}
        aria-hidden
      >
        <Image
          src={editorial.hero.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,17,14,0.88)_0%,rgba(20,17,14,0.55)_48%,rgba(20,17,14,0.22)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110E] via-transparent to-[#14110E]/30" />
      </motion.div>

      <Spotlight className="-top-24 left-10 opacity-40 md:left-40" fill="#F7F1E3" />
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        style={reduceMotion ? undefined : { x: starX, y: starY }}
        aria-hidden
      >
        <Constellation reduceMotion={Boolean(reduceMotion)} />
      </motion.div>

      <div className="relative mx-auto grid min-h-[100svh] w-full max-w-7xl items-end gap-8 px-4 pt-[calc(5.5rem+var(--landing-notice,0px)+env(safe-area-inset-top,0px))] pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:px-8 lg:pb-20">
        <div className="max-w-xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-ivory/70 text-[11px] font-semibold tracking-[0.22em] uppercase"
          >
            Where compatibility meets destiny
          </motion.p>
          <h1
            id="hero-heading"
            className="font-display text-ivory mt-4 text-[2.55rem] leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.6rem]"
          >
            <motion.span
              className="block"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.08 }}
            >
              Find someone who aligns with your life.
            </motion.span>
          </h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="text-ivory/78 mt-5 max-w-lg text-sm leading-relaxed sm:text-base"
          >
            VedaMilan brings together modern matchmaking, Vedic compatibility and intelligent
            guidance to help you discover a partner who fits not only your preferences — but your
            life.
          </motion.p>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.32 }}
            className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="h-12 w-full sm:w-auto">
              <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ivory/30 bg-ivory/5 text-ivory hover:bg-ivory/12 h-12 w-full sm:w-auto"
            >
              <Link href={landingCta.compatibility.href}>{landingCta.compatibility.label}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.28 }}
          className="border-ivory/15 bg-[#14110E]/80 w-full max-w-sm justify-self-end rounded-2xl border p-5 text-[#F7F1E3] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md lg:p-6"
          aria-label="Illustrative compatibility preview"
        >
          <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">Product preview</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <PreviewPerson label="You" name="Bhavya" src={editorial.you.src} />
            <PreviewPerson label="Partner" name="Aarohi" src={editorial.partner.src} />
          </div>
          <p className="font-display mt-5 text-5xl leading-none tabular-nums">92%</p>
          <p className="text-ivory/60 mt-1 text-xs tracking-[0.16em] uppercase">Compatibility</p>
          <dl className="mt-5 space-y-2 text-sm">
            {[
              ["Vedic", "94"],
              ["Life goals", "89"],
              ["Values", "93"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-t border-white/10 pt-2">
                <dt className="text-ivory/70">{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm">Strong alignment</p>
        </motion.aside>
      </div>
    </section>
  );
}

function PreviewPerson({ label, name, src }: { label: string; name: string; src: string }) {
  return (
    <div>
      <p className="text-ivory/45 text-[10px] tracking-[0.16em] uppercase">{label}</p>
      <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-full">
        <Image src={src} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <p className="mt-2 text-sm">{name}</p>
    </div>
  );
}

function Constellation({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 800 600"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40"
      initial={false}
    >
      <g fill="none" stroke="#F7F1E3" strokeOpacity="0.22" strokeWidth="0.6">
        <ellipse cx="620" cy="220" rx="180" ry="90" />
        <ellipse cx="620" cy="220" rx="120" ry="160" />
        <path d="M480 180 L620 220 L740 160" />
      </g>
      {[
        [500, 170],
        [620, 220],
        [740, 160],
        [560, 280],
        [700, 300],
      ].map(([x, y], i) => (
        <motion.circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="1.6"
          fill="#F7F1E3"
          animate={reduceMotion ? undefined : { opacity: [0.25, 0.8, 0.25] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
  );
}
