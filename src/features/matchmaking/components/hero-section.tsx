"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

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
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.4]);

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
          className="absolute inset-0 scale-105"
          animate={reduceMotion ? undefined : { scale: [1.04, 1.08, 1.04] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={landingImages.hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        </motion.div>
        <div className="from-navy/95 via-navy/78 to-navy/35 absolute inset-0 bg-gradient-to-r" />
        <div className="from-navy to-navy/55 absolute inset-0 bg-gradient-to-t via-transparent" />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity }}
        className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pt-28 pb-20 sm:px-6 sm:pb-24 lg:justify-center lg:px-8 lg:pb-28"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={96}
              height={96}
              priority
              className="drop-shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              aria-hidden
            />
            <p className="font-display text-[2.75rem] leading-none tracking-wide sm:text-6xl md:text-7xl lg:text-[5rem]">
              <span className="text-brand-gold">{brand.shortName}</span>
              <span className="text-ivory/65 ml-2 align-middle text-[0.42em] font-semibold tracking-[0.18em]">
                AI
              </span>
            </p>
          </div>

          <h1
            id="hero-heading"
            className="font-display text-ivory mt-7 max-w-2xl text-2xl leading-[1.15] text-balance sm:mt-8 sm:text-4xl md:text-5xl"
          >
            Finding someone is easy. Finding someone aligned with your life is different.
          </h1>

          <p className="text-ivory/75 mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
            Preferences, personality, and Vedic compatibility — in one calm, private workspace.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 min-w-[11.5rem]">
              <Link href={routes.register}>
                Begin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ivory/25 bg-ivory/5 text-ivory hover:bg-ivory/12 h-12"
            >
              <Link href="/#how">See how it works</Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
    </section>
  );
}
