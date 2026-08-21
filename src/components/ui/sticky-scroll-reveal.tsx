"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils/index";

const ease = [0.22, 1, 0.36, 1] as const;

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const updateActive = useCallback(() => {
    const root = ref.current;
    if (!root) return;

    const last = content.length - 1;
    const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 12;
    if (atBottom) {
      setActiveCard(last);
      return;
    }

    const marker = root.getBoundingClientRect().top + Math.min(132, root.clientHeight * 0.3);
    let next = 0;
    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      if (el.getBoundingClientRect().top <= marker + 20) next = index;
    });
    setActiveCard((prev) => (prev === next ? prev : next));
  }, [content.length]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    updateActive();
    root.addEventListener("scroll", updateActive, { passive: true });
    const observer = new ResizeObserver(updateActive);
    observer.observe(root);
    const inner = root.firstElementChild;
    if (inner) observer.observe(inner);
    return () => {
      root.removeEventListener("scroll", updateActive);
      observer.disconnect();
    };
  }, [updateActive]);

  return (
    <div
      ref={ref}
      className="border-border/60 bg-muted/40 dark:bg-muted/50 relative flex h-[32rem] justify-center gap-8 overflow-y-auto rounded-xl border p-6 sm:gap-10 sm:p-10"
    >
      <div className="relative flex items-start px-2 sm:px-4">
        <div className="max-w-xl">
          {content.map((item, index) => (
            <div
              key={item.title + index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="py-16 sm:py-20"
            >
              <motion.h3
                animate={{ opacity: activeCard === index ? 1 : 0.34 }}
                transition={{ duration: 0.35, ease }}
                className="font-display text-foreground text-2xl tracking-tight"
              >
                {item.title}
              </motion.h3>
              <motion.p
                animate={{ opacity: activeCard === index ? 1 : 0.34 }}
                transition={{ duration: 0.35, ease }}
                className="text-muted-foreground mt-5 max-w-sm text-sm leading-relaxed sm:text-base"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-56 sm:h-64" aria-hidden />
        </div>
      </div>
      <div
        className={cn(
          "border-border bg-card relative sticky top-8 hidden h-72 w-80 overflow-hidden rounded-xl border lg:block",
          contentClassName,
        )}
      >
        {content.map((item, index) => (
          <motion.div
            key={item.title + index}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: activeCard === index ? 1 : 0,
              scale: activeCard === index || reduceMotion ? 1 : 1.03,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease }}
            style={{ pointerEvents: activeCard === index ? "auto" : "none" }}
          >
            {item.content ?? null}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
