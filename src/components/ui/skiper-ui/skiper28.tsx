"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";

import { cn } from "@/lib/utils/index";

const Skiper28 = () => {
  return (
    <PerspectiveTextScroll text="Compatibility is more than a number." />
  );
};

export function PerspectiveTextScroll({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 1], [220, 0]);
  const transform = useMotionTemplate`rotateX(28deg) translateY(${yMotionValue}px) translateZ(10px)`;

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[180vh] w-full", className)}>
      <div
        className="sticky top-0 mx-auto flex h-screen items-center justify-center bg-transparent py-16"
        style={{
          transformStyle: "preserve-3d",
          perspective: "220px",
        }}
      >
        <motion.div
          style={{
            transformStyle: "preserve-3d",
            transform,
          }}
          className="font-display w-full max-w-4xl px-6 text-center text-4xl font-medium tracking-tight text-gold sm:text-6xl md:text-7xl"
        >
          {text}
        </motion.div>
      </div>
    </div>
  );
}

export { Skiper28 };

/**
 * Skiper 28 PerspectiveTextScroll — React + framer motion + lenis
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
