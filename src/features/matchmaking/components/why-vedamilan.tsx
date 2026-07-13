"use client";

import { FadeIn } from "@/components/animations/motion";
import { GlassCard } from "@/components/ui/premium-cards";

const reasons = [
  {
    title: "Explainable, not mystical theater",
    body: "Every score and recommendation surfaces drivers you can discuss with family.",
  },
  {
    title: "Luxury calm over marketplace noise",
    body: "Spacing, typography, and motion inspired by premium SaaS—not cluttered classifieds.",
  },
  {
    title: "Vedic depth with modern privacy",
    body: "Charts, messages, and reports stay intentional—visibility is always yours to grant.",
  },
];

export function WhyVedaMilanSection() {
  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="why-heading"
    >
      <FadeIn>
        <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
          Why VedaMilan AI
        </p>
        <h2 id="why-heading" className="font-display mt-3 text-3xl sm:text-4xl">
          Designed for trust at every layer
        </h2>
      </FadeIn>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {reasons.map((r, i) => (
          <FadeIn key={r.title} delay={0.08 * i}>
            <GlassCard className="h-full">
              <h3 className="font-display text-2xl">{r.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{r.body}</p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
