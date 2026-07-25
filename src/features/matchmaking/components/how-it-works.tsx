"use client";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";

const steps = [
  {
    n: "01",
    title: "Share who you are",
    body: "Preferences, personality, and accurate birth details — the foundation for every recommendation.",
  },
  {
    n: "02",
    title: "Understand alignment",
    body: "See not only a score, but why two people may fit — values first, Vedic signals in support.",
  },
  {
    n: "03",
    title: "Connect with care",
    body: "Express interest, connect when mutual, and message only after both sides are ready.",
  },
];

export function HowItWorksSection() {
  return (
    <LandingSection id="how">
      <FadeIn>
        <SectionIntro
          eyebrow="The approach"
          title="People, preferences, and Vedic compatibility"
          description="Finding someone is easy. Finding someone aligned with your life is different."
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
            <FadeIn key={step.n} delay={0.06 * index}>
              <li className="relative text-center md:text-left">
                <p className="font-display text-gold text-xl tracking-tight">{step.n}</p>
                <h3 className="font-display mt-3 text-xl tracking-tight sm:text-2xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed md:mx-0">
                  {step.body}
                </p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </LandingSection>
  );
}
