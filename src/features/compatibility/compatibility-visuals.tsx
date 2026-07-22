"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

export type CompatMoodTone = "excellent" | "strong" | "balanced" | "cautious" | "challenging";

export function moodFromScore(score: number): {
  emoji: string;
  title: string;
  blurb: string;
  tone: CompatMoodTone;
} {
  if (score >= 85) {
    return {
      emoji: "✨",
      title: "Strong alignment",
      blurb: "Charts suggest warm chemistry and clear long-term potential.",
      tone: "excellent",
    };
  }
  if (score >= 70) {
    return {
      emoji: "🌞",
      title: "Warm promise",
      blurb: "A supportive match with strengths you can build on together.",
      tone: "strong",
    };
  }
  if (score >= 55) {
    return {
      emoji: "🌿",
      title: "Steady potential",
      blurb: "A solid foundation — thoughtful communication will deepen harmony.",
      tone: "balanced",
    };
  }
  if (score >= 40) {
    return {
      emoji: "🕯️",
      title: "Explore mindfully",
      blurb: "Some friction appears. Understanding differences will matter.",
      tone: "cautious",
    };
  }
  return {
    emoji: "🌧️",
    title: "Challenging mix",
    blurb: "Charts show tension. Clarity about differences is essential.",
    tone: "challenging",
  };
}

const KOOTA_EMOJI: Record<string, string> = {
  Varna: "🕉️",
  Vashya: "🤝",
  Tara: "⭐",
  Yoni: "💞",
  "Graha Maitri": "🌙",
  Gana: "🎭",
  Bhakoot: "🌕",
  Nadi: "💚",
};

export function kootaEmoji(koota: string, fallback?: string | null) {
  return fallback || KOOTA_EMOJI[koota] || "🔹";
}

/** Soft floating emoji — respects reduced motion */
export function SoftEmoji({
  emoji,
  className,
  size = "md",
  pulse = true,
}: {
  emoji: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  pulse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const sizeClass =
    size === "sm"
      ? "text-lg"
      : size === "lg"
        ? "text-4xl"
        : size === "xl"
          ? "text-5xl"
          : "text-2xl";

  return (
    <motion.span
      className={cn("inline-block select-none", sizeClass, className)}
      aria-hidden
      animate={
        reduceMotion || !pulse
          ? undefined
          : {
              y: [0, -3, 0],
              scale: [1, 1.04, 1],
            }
      }
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.span>
  );
}

export function MoodBadge({ score, className }: { score: number; className?: string }) {
  const mood = moodFromScore(score);
  const toneRing =
    mood.tone === "excellent"
      ? "bg-emerald/10 ring-emerald/25"
      : mood.tone === "strong"
        ? "bg-gold/10 ring-gold/30"
        : mood.tone === "balanced"
          ? "bg-primary/10 ring-primary/20"
          : mood.tone === "cautious"
            ? "bg-saffron/10 ring-saffron/25"
            : "bg-rose/10 ring-rose/20";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 ring-1",
        toneRing,
        className,
      )}
    >
      <SoftEmoji emoji={mood.emoji} size="sm" />
      <span className="text-sm font-medium">{mood.title}</span>
    </div>
  );
}

function extractPictographs(value: string): string[] {
  return value.match(/\p{Extended_Pictographic}/gu) ?? [];
}

export function YoniEnergyCard({
  visual,
  emoji,
  note,
  score,
  max = 4,
  className,
}: {
  visual?: string | null;
  emoji?: string | null;
  note?: string | null;
  score: number;
  max?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ratio = max > 0 ? score / max : 0;

  const parts = visual
    ? visual
        .split("↔")
        .map((p) => p.trim())
        .filter(Boolean)
    : (() => {
        const marks = extractPictographs(emoji || "");
        if (marks.length >= 2) return [`${marks[0]} You`, `${marks[1]} Partner`];
        return null;
      })();

  return (
    <div
      className={cn(
        "border-border/70 from-rose/5 via-card to-gold/5 shadow-soft relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6",
        className,
      )}
    >
      <motion.div
        className="pointer-events-none absolute -top-6 -right-6 text-6xl opacity-[0.12]"
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: [0, 6, -4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        💞
      </motion.div>

      <p className="text-muted-foreground text-xs font-medium tracking-wide">Yoni energy</p>
      <p className="font-display mt-1 text-xl sm:text-2xl">Instinctive comfort</p>

      {parts?.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {parts.map((part, i) => (
            <div key={`${part}-${i}`} className="flex items-center gap-3">
              {i > 0 ? (
                <motion.span
                  className="text-muted-foreground text-sm"
                  aria-hidden
                  animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  ↔
                </motion.span>
              ) : null}
              <motion.div
                className="border-border/50 bg-card flex min-w-[7.5rem] flex-col items-center gap-1 rounded-xl border px-3 py-3"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <SoftEmoji emoji={extractPictographs(part)[0] || "💞"} size="lg" />
                <p className="text-center text-xs leading-snug font-medium">
                  {part.replace(/\p{Extended_Pictographic}/gu, "").trim()}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <SoftEmoji emoji="💞" size="lg" />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          {note || "Yoni reflects instinctive chemistry and physical ease between charts."}
        </p>
        <p className="font-display shrink-0 text-2xl">
          {score}
          <span className="text-muted-foreground text-sm">/{max}</span>
        </p>
      </div>

      <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
        <motion.div
          className="bg-compat-dual h-full rounded-full"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${Math.round(ratio * 100)}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
