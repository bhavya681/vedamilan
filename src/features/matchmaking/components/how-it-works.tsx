"use client";

import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";

const steps = [
  {
    n: "01",
    title: "Add your birth details",
    body: "Accurate time and place unlock authentic Lahiri kundli—the foundation of every recommendation.",
  },
  {
    n: "02",
    title: "See clear compatibility",
    body: "Ashta Koota, Manglik harmony, and explainable blend scores appear beside each profile.",
  },
  {
    n: "03",
    title: "Connect with intention",
    body: "Express interest, connect when mutual, and message only after both sides are ready.",
  },
];

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="how">
      <FadeIn>
        <SectionIntro
          eyebrow="How it works"
          title="Clarity in three steps"
          description="From birth chart to meaningful connection—without marketplace noise."
          align="center"
        />
      </FadeIn>

      <div className="relative mt-12 md:mt-16">
        <div
          className="via-border absolute top-10 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent to-transparent md:block"
          aria-hidden
        />
        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => (
            <FadeIn key={step.n} delay={0.08 * index}>
              <motion.li
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="relative text-center md:text-left"
              >
                <div className="border-border/60 bg-card shadow-soft mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border md:mx-0">
                  <span className="font-display text-gold text-xl tracking-tight">{step.n}</span>
                </div>
                <h3 className="font-display mt-5 text-xl tracking-tight sm:text-2xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed md:mx-0">
                  {step.body}
                </p>
              </motion.li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </LandingSection>
  );
}
