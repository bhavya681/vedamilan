"use client";

import { motion, useReducedMotion } from "framer-motion";

import { useT } from "@/components/i18n/i18n-provider";
import { moodCodeFromScore, type CompatMoodCode } from "@/lib/i18n/catalogs/codes";
import { cn } from "@/lib/utils/cn";

export type CompatMoodTone = CompatMoodCode;

export function moodFromScore(score: number): {
  emoji: string;
  tone: CompatMoodTone;
  titleKey: string;
  blurbKey: string;
} {
  const tone = moodCodeFromScore(score);
  const emoji =
    tone === "excellent"
      ? "◎"
      : tone === "strong"
        ? "◐"
        : tone === "balanced"
          ? "◯"
          : tone === "cautious"
            ? "◑"
            : "◌";
  return {
    emoji,
    tone,
    titleKey: `compatibility.moods.${tone}.title`,
    blurbKey: `compatibility.moods.${tone}.blurb`,
  };
}

/** Localized mood copy for client components. */
export function useCompatMood(score: number) {
  const t = useT();
  const mood = moodFromScore(score);
  return {
    ...mood,
    title: t(mood.titleKey),
    blurb: t(mood.blurbKey),
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

/** Optional emoji accent — pulse off by default (product chrome should not bounce) */
export function SoftEmoji({
  emoji,
  className,
  size = "md",
  pulse = false,
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
  const mood = useCompatMood(score);
  const toneRing =
    mood.tone === "excellent"
      ? "ring-gold/40"
      : mood.tone === "strong"
        ? "ring-emerald/35"
        : mood.tone === "balanced"
          ? "ring-primary/30"
          : mood.tone === "cautious"
            ? "ring-amber/35"
            : "ring-muted-foreground/25";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1",
        toneRing,
        className,
      )}
    >
      {mood.title}
    </span>
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
        if (marks.length >= 2) return [`You`, `Partner`];
        return null;
      })();

  return (
    <div className={cn("border-border/60 space-y-3 border-y py-5", className)}>
      <p className="text-muted-foreground text-xs font-medium tracking-wide">Yoni energy</p>
      <p className="font-display text-xl sm:text-2xl">Instinctive comfort</p>

      {parts?.length ? (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {parts.map((part, i) => (
            <div key={`${part}-${i}`} className="flex items-center gap-3">
              {i > 0 ? (
                <span className="text-muted-foreground text-sm" aria-hidden>
                  ↔
                </span>
              ) : null}
              <p className="text-sm leading-snug font-medium">
                {part.replace(/\p{Extended_Pictographic}/gu, "").trim() || part}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          {note || "Yoni reflects instinctive chemistry and physical ease between charts."}
        </p>
        <p className="font-display shrink-0 text-2xl">
          {score}
          <span className="text-muted-foreground text-sm">/{max}</span>
        </p>
      </div>

      <div className="bg-muted h-1 overflow-hidden rounded-sm">
        <motion.div
          className="bg-primary h-full"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${Math.round(ratio * 100)}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
