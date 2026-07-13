"use client";

import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";

const steps = [
  {
    n: "01",
    title: "Share birth details",
    body: "Precise time and place unlock authentic Vedic charts—never guesswork.",
  },
  {
    n: "02",
    title: "Receive intelligence",
    body: "Kundli, guna milan, dasha, and AI explanations arrive in one calm workspace.",
  },
  {
    n: "03",
    title: "Act with timing",
    body: "Match, message, and consult experts when planetary windows favor sincerity.",
  },
];

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="how">
      <FadeIn>
        <SectionIntro
          eyebrow="How it works"
          title="Three serene steps to clarity"
          description="A guided path from birth details to intentional action—without marketplace noise."
        />
      </FadeIn>
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
        {steps.map((step, index) => (
          <FadeIn key={step.n} delay={0.08 * index}>
            <motion.article
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="glass-panel relative h-full overflow-hidden rounded-2xl p-5 sm:rounded-3xl sm:p-6"
            >
              <p className="font-display text-brand-dual text-4xl sm:text-5xl">{step.n}</p>
              <h3 className="font-display mt-4 text-xl sm:text-2xl">{step.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{step.body}</p>
            </motion.article>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
