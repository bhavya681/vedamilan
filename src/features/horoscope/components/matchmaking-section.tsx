"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { landingImages } from "@/lib/constants/images";

export function MatchmakingSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="matchmaking"
      className="border-border/40 bg-navy text-ivory relative overflow-hidden border-y"
      aria-labelledby="matchmaking-heading"
    >
      <div className="absolute inset-0 opacity-35">
        <Image
          src={landingImages.matchmaking.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="bg-navy/80 absolute inset-0" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <FadeIn>
          <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">
            AI Matchmaking
          </p>
          <h2 id="matchmaking-heading" className="font-display mt-3 text-3xl sm:text-4xl">
            Intelligent pairing with cultural reverence
          </h2>
          <p className="text-ivory/80 mt-4 max-w-xl">
            Like the best matrimonial journeys—thoughtful discovery first—then Vedic harmony and AI
            ranking that explains every recommendation.
          </p>
          <ul className="text-ivory/75 mt-6 space-y-3 text-sm">
            <li>Explainable match scores with clear drivers</li>
            <li>Privacy-first discovery with intentional messaging gates</li>
            <li>Continuously refined recommendations as your profile evolves</li>
          </ul>
        </FadeIn>
        <FadeIn delay={0.12}>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="border-gold/25 bg-ivory/8 rounded-2xl border p-6 backdrop-blur-xl"
          >
            <div className="space-y-4">
              {[
                { label: "Values alignment", value: 94 },
                { label: "Astrological harmony", value: 88 },
                { label: "Lifestyle compatibility", value: 91 },
              ].map((row, index) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="text-brand-dual font-semibold">{row.value}%</span>
                  </div>
                  <div className="bg-ivory/10 h-2 overflow-hidden rounded-full">
                    <motion.div
                      className="bg-brand-dual h-full rounded-full"
                      initial={reduceMotion ? { width: `${row.value}%` } : { width: 0 }}
                      whileInView={{ width: `${row.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 * index, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
