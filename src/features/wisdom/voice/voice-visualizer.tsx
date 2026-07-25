"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import type { VoiceSessionState } from "@/features/wisdom/voice/types";

export function VoiceOrbVisualizer({
  state,
  className,
}: {
  state: VoiceSessionState;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const active = state === "listening" || state === "speaking" || state === "interrupted";
  const thinking = state === "thinking" || state === "processing" || state === "connecting";

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "border-border/60 mx-auto flex h-28 w-28 items-center justify-center rounded-full border",
          active && "border-gold/40 bg-gold/10",
          thinking && "border-primary/30 bg-primary/5",
          className,
        )}
        aria-hidden
      >
        <span className="bg-gold/70 h-3 w-3 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative mx-auto flex h-36 w-36 items-center justify-center", className)}
      aria-hidden
    >
      <motion.div
        className="border-gold/25 absolute inset-0 rounded-full border"
        animate={
          active
            ? { scale: [1, 1.08, 1], opacity: [0.45, 0.85, 0.45] }
            : thinking
              ? { scale: [1, 1.04, 1], opacity: [0.35, 0.6, 0.35] }
              : { scale: 1, opacity: 0.35 }
        }
        transition={{ duration: active ? 2.4 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="border-primary/20 absolute inset-4 rounded-full border"
        animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="bg-card border-border/50 shadow-soft flex h-16 w-16 items-center justify-center rounded-full border">
        <div className="flex items-end gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className={cn("w-1 rounded-full", state === "speaking" ? "bg-gold" : "bg-primary/70")}
              animate={
                active
                  ? {
                      height: [6, 14 + (i % 3) * 6, 8, 18, 6],
                    }
                  : { height: 6 }
              }
              transition={{
                duration: 1.1 + i * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
