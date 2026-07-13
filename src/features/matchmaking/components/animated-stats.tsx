"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";

const stats = [
  { label: "Members exploring", value: 48920, suffix: "+" },
  { label: "Compatibility clarity", value: 87, suffix: "%" },
  { label: "Expert consultations", value: 12600, suffix: "+" },
  { label: "Cities covered", value: 180, suffix: "+" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className="font-display text-brand-dual text-3xl sm:text-4xl lg:text-5xl">
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function AnimatedStatsSection() {
  return (
    <LandingSection aria-label="Platform statistics" innerClassName="!py-10 sm:!py-12 lg:!py-14">
      <FadeIn>
        <div className="lotus-divider mb-8 sm:mb-10" />
      </FadeIn>
      <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.06 * index}>
            <motion.div className="text-center sm:text-left">
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="text-muted-foreground mt-2 text-xs sm:text-sm">{stat.label}</p>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
