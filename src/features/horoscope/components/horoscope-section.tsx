"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { landingImages } from "@/lib/constants/images";

export function HoroscopeSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="horoscope"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="horoscope-heading"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <FadeIn>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            className="border-primary/20 shadow-elevated relative aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] border"
          >
            <Image
              src={landingImages.horoscope.src}
              alt={landingImages.horoscope.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
            />
            <div className="from-navy via-navy/45 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="mandala-bg absolute inset-0 opacity-30 mix-blend-soft-light" />
            <div className="text-ivory absolute inset-x-0 bottom-0 p-6">
              <p className="font-display text-gold text-2xl">Swiss Ephemeris precision</p>
              <p className="text-ivory/80 mt-2 text-sm">
                Planetary longitudes, house cusps, and node calculations for authentic Vedic charts.
              </p>
            </div>
          </motion.div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-saffron text-xs font-semibold tracking-[0.2em] uppercase">Horoscope</p>
          <h2 id="horoscope-heading" className="font-display mt-3 text-3xl sm:text-4xl">
            Charts that feel ceremonial, not clinical
          </h2>
          <p className="text-muted-foreground mt-4">
            Generate natal insights, daily guidance, and relationship-ready reports with an
            interface designed for both seekers and families.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Lagna and navamsa synthesis",
              "Dasha timeline clarity",
              "Manglik and dosha indicators",
              "Exportable compatibility reports",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={reduceMotion ? undefined : { x: 4 }}
                className="border-border/60 bg-card/70 shadow-soft rounded-xl border p-4 text-sm"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
