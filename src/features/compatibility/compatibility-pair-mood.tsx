"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SoftEmoji, moodFromScore } from "@/features/compatibility/compatibility-visuals";
import { cn } from "@/lib/utils/cn";

export type PairPerson = {
  name: string;
  photo?: string | null;
  label?: string;
};

function ConvergenceMotif({ tone }: { tone: string }) {
  const stroke =
    tone === "excellent"
      ? "stroke-emerald/50"
      : tone === "strong"
        ? "stroke-gold/55"
        : tone === "balanced"
          ? "stroke-primary/45"
          : tone === "cautious"
            ? "stroke-saffron/50"
            : "stroke-rose/45";

  return (
    <svg
      viewBox="0 0 120 48"
      className="text-muted-foreground/40 mx-auto h-8 w-28 sm:h-10 sm:w-32"
      aria-hidden
    >
      <path
        d="M8 24 C 32 8, 48 8, 60 24 C 72 40, 88 40, 112 24"
        fill="none"
        strokeWidth="1.25"
        className={cn(stroke)}
      />
      <path
        d="M8 24 C 32 40, 48 40, 60 24 C 72 8, 88 8, 112 24"
        fill="none"
        strokeWidth="1.25"
        className={cn(stroke)}
      />
      <circle cx="60" cy="24" r="3.5" className="fill-gold/80" />
    </svg>
  );
}

function Avatar({
  person,
  side,
  size = "md",
}: {
  person: PairPerson;
  side: "left" | "right";
  size?: "sm" | "md" | "lg";
}) {
  const initials = person.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 sm:gap-2">
      <div
        className={cn(
          "ring-background relative overflow-hidden rounded-full shadow-md ring-4",
          size === "sm" && "h-14 w-14 sm:h-16 sm:w-16",
          size === "md" && "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24",
          size === "lg" && "h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28",
          side === "left" ? "ring-primary/25" : "ring-gold/30",
        )}
      >
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm font-semibold sm:text-lg">
            {initials || "?"}
          </div>
        )}
      </div>
      <div className="w-full max-w-[5.5rem] text-center sm:max-w-[8rem] md:max-w-[10rem]">
        <p className="truncate text-xs font-medium sm:text-sm">{person.name}</p>
        {person.label ? <p className="text-muted-foreground text-[11px]">{person.label}</p> : null}
      </div>
    </div>
  );
}

function MoodCenter({
  score,
  decisionSummary,
  compact = false,
}: {
  score: number;
  decisionSummary?: string | null;
  compact?: boolean;
}) {
  const mood = moodFromScore(score);
  const reduceMotion = useReducedMotion();
  const toneRing =
    mood.tone === "excellent"
      ? "bg-emerald/12 ring-emerald/30"
      : mood.tone === "strong"
        ? "bg-gold/12 ring-gold/35"
        : mood.tone === "balanced"
          ? "bg-primary/10 ring-primary/25"
          : mood.tone === "cautious"
            ? "bg-saffron/12 ring-saffron/30"
            : "bg-rose/10 ring-rose/25";

  return (
    <div className="flex max-w-sm min-w-0 flex-1 flex-col items-center px-2 text-center lg:max-w-md">
      <ConvergenceMotif tone={mood.tone} />
      <motion.div
        className={cn(
          "mt-3 flex items-center justify-center rounded-full ring-1",
          toneRing,
          compact ? "h-14 w-14" : "h-16 w-16 lg:h-[4.5rem] lg:w-[4.5rem]",
        )}
        initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <SoftEmoji emoji={mood.emoji} size={compact ? "lg" : "xl"} />
      </motion.div>
      <p
        className={cn(
          "font-display text-foreground mt-3 leading-none",
          compact ? "text-4xl sm:text-5xl" : "text-5xl lg:text-6xl",
        )}
      >
        {score}%
      </p>
      <p
        className={cn(
          "font-display mt-3 tracking-tight",
          compact ? "text-xl sm:text-2xl" : "text-2xl lg:text-3xl",
        )}
      >
        {mood.title}
      </p>
      {decisionSummary ? (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{decisionSummary}</p>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{mood.blurb}</p>
      )}
    </div>
  );
}

export function CompatibilityPairMood({
  you,
  them,
  score,
  decisionSummary,
  className,
}: {
  you: PairPerson;
  them: PairPerson;
  score: number;
  decisionSummary?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card shadow-soft relative overflow-hidden rounded-2xl border px-3 py-6 sm:px-6 sm:py-8 md:px-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_8%,transparent),transparent_65%)]" />

      <div className="relative flex flex-col items-center gap-5 md:hidden">
        <div className="flex w-full items-start justify-between gap-2 px-1">
          <Avatar person={you} side="left" size="md" />
          <div className="flex flex-1 justify-center pt-2">
            <ConvergenceMotif tone={moodFromScore(score).tone} />
          </div>
          <Avatar person={them} side="right" size="md" />
        </div>
        <MoodCenter score={score} decisionSummary={decisionSummary} compact />
      </div>

      <div className="relative hidden items-center justify-center gap-4 md:flex lg:gap-10">
        <Avatar person={you} side="left" size="lg" />
        <MoodCenter score={score} decisionSummary={decisionSummary} />
        <Avatar person={them} side="right" size="lg" />
      </div>
    </div>
  );
}
