"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";

const stats = [
  { label: "Members exploring", value: 48920, suffix: "+" },
  { label: "Avg. match clarity", value: 87, suffix: "%" },
  { label: "Expert sessions", value: 12600, suffix: "+" },
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
    const duration = 1100;
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
    <span ref={ref} className="font-display text-foreground text-3xl tracking-tight sm:text-4xl">
      {display.toLocaleString("en-IN")}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export function AnimatedStatsSection() {
  return (
    <LandingSection
      aria-label="Platform statistics"
      tone="default"
      className="relative z-10 -mt-10 sm:-mt-14"
      innerClassName="!py-0 sm:!py-0 lg:!py-0"
    >
      <FadeIn>
        <div className="border-border/50 bg-card/80 shadow-soft grid grid-cols-2 overflow-hidden rounded-[1.35rem] border lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`px-5 py-7 text-center sm:px-6 sm:py-8 sm:text-left ${
                index > 0 ? "border-border/40 border-t sm:border-t-0 sm:border-l" : ""
              } ${index === 2 ? "border-t lg:border-t-0" : ""}`}
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="text-muted-foreground mt-2 text-xs tracking-wide sm:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </FadeIn>
    </LandingSection>
  );
}
