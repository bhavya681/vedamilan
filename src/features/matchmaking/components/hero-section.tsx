"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/constants/brand";
import { landingImages } from "@/lib/constants/images";
import { routes } from "@/lib/constants/routes";

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[100svh] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduceMotion ? undefined : { y: imageY }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 scale-110"
          animate={reduceMotion ? undefined : { scale: [1.06, 1.12, 1.06] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={landingImages.hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_28%]"
          />
        </motion.div>
        <div className="from-navy via-navy/88 to-navy/45 absolute inset-0 bg-gradient-to-r" />
        <div className="from-navy via-navy/20 to-navy/50 absolute inset-0 bg-gradient-to-t" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(200,162,74,0.18),transparent_50%)]" />
        <div className="mandala-bg absolute inset-0 opacity-20 mix-blend-soft-light" />
      </motion.div>

      {!reduceMotion ? (
        <>
          <motion.div
            aria-hidden
            className="border-gold/25 pointer-events-none absolute top-[12%] right-[5%] -z-10 hidden h-[22rem] w-[22rem] rounded-full border xl:block"
            style={{
              boxShadow: "0 0 80px rgba(37,99,235,0.12), inset 0 0 50px rgba(200,162,74,0.1)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            aria-hidden
            className="border-ivory/20 pointer-events-none absolute top-[38%] right-[16%] -z-10 hidden h-44 w-44 rounded-full border xl:block"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity }}
        className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pt-24 pb-16 sm:px-6 sm:pb-20 lg:justify-center lg:px-8 lg:pb-24"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="border-ivory/20 bg-ivory/5 text-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Relationship intelligence
          </p>

          <motion.div
            className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
          >
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={88}
              height={88}
              priority
              className="drop-shadow-lg"
              aria-hidden
            />
            <p className="font-display text-[2.5rem] leading-none tracking-wide sm:text-6xl md:text-7xl">
              <span className="text-brand-gold">{brand.shortName}</span>
              <span className="text-ivory/70 ml-2 text-[0.45em] font-semibold tracking-[0.16em]">
                AI
              </span>
            </p>
          </motion.div>

          <h1
            id="hero-heading"
            className="font-display text-ivory mt-5 max-w-2xl text-2xl leading-[1.2] text-balance sm:text-4xl md:text-5xl"
          >
            Find alignment with Vedic clarity and calm AI.
          </h1>

          <p className="text-ivory/78 mt-5 max-w-xl text-sm leading-relaxed sm:text-lg">
            Matchmaking, kundli, compatibility, marriage timing, and expert guidance—designed as a
            premium OS for intentional unions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 min-w-[180px]">
              <Link href={routes.register}>
                Begin your journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ivory/30 bg-ivory/5 text-ivory hover:bg-ivory/12 h-12 backdrop-blur-md"
            >
              <Link href="/#compatibility">See compatibility</Link>
            </Button>
          </div>

          <div className="text-ivory/65 mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="text-gold h-4 w-4" aria-hidden />
              Privacy-first profiles
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="text-gold h-4 w-4" aria-hidden />
              Explainable AI scores
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="text-gold h-4 w-4" aria-hidden />
              Swiss Ephemeris charts
            </span>
          </div>
        </motion.div>
      </motion.div>

      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent" />
    </section>
  );
}
