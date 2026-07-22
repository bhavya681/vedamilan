"use client";

import { cn } from "@/lib/utils/cn";

export type PairPerson = {
  name: string;
  photo?: string | null;
  label?: string;
};

function moodForScore(score: number): {
  emoji: string;
  title: string;
  blurb: string;
  tone: "excellent" | "strong" | "balanced" | "cautious" | "challenging";
} {
  if (score >= 85) {
    return {
      emoji: "✨",
      title: "Radiant alignment",
      blurb: "Charts suggest warm chemistry and strong long-term potential.",
      tone: "excellent",
    };
  }
  if (score >= 70) {
    return {
      emoji: "😊",
      title: "Warm & promising",
      blurb: "A supportive match with clear strengths to build on together.",
      tone: "strong",
    };
  }
  if (score >= 55) {
    return {
      emoji: "🙂",
      title: "Steady potential",
      blurb: "Solid foundation — thoughtful communication will deepen harmony.",
      tone: "balanced",
    };
  }
  if (score >= 40) {
    return {
      emoji: "🤔",
      title: "Proceed mindfully",
      blurb: "Some friction areas appear. Explore them honestly before committing.",
      tone: "cautious",
    };
  }
  return {
    emoji: "🌧️",
    title: "Challenging mix",
    blurb: "Charts show tension. Understanding differences is essential.",
    tone: "challenging",
  };
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
        {person.label ? (
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase sm:text-[10px]">
            {person.label}
          </p>
        ) : null}
      </div>
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
  const mood = moodForScore(score);

  return (
    <div
      className={cn(
        "border-border/40 from-card via-gold/5 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-b px-3 py-5 sm:rounded-[1.75rem] sm:px-6 sm:py-7 md:px-8 md:py-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_12%,transparent),transparent_60%)]" />

      {/* Mobile: avatars on top row, mood below. md+: classic triad */}
      <div className="relative flex flex-col items-center gap-4 md:hidden">
        <div className="flex w-full items-start justify-between gap-2 px-1">
          <Avatar person={you} side="left" size="md" />
          <div className="flex flex-col items-center pt-1">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm",
                mood.tone === "excellent" && "bg-emerald/15 ring-emerald/25 ring-1",
                mood.tone === "strong" && "bg-gold/15 ring-gold/30 ring-1",
                mood.tone === "balanced" && "bg-primary/10 ring-primary/20 ring-1",
                mood.tone === "cautious" && "bg-saffron/15 ring-saffron/25 ring-1",
                mood.tone === "challenging" && "bg-rose/10 ring-rose/20 ring-1",
              )}
              aria-hidden
            >
              {mood.emoji}
            </div>
            <span className="text-muted-foreground mt-1 text-[10px]">vs</span>
          </div>
          <Avatar person={them} side="right" size="md" />
        </div>

        <div className="w-full max-w-md space-y-2 text-center">
          <p className="font-display text-gold text-4xl leading-none tracking-tight sm:text-5xl">
            {score}%
          </p>
          <p className="text-sm font-semibold tracking-tight sm:text-base">{mood.title}</p>
          {decisionSummary ? (
            <p className="text-muted-foreground px-2 text-xs leading-relaxed sm:text-sm">
              {decisionSummary}
            </p>
          ) : null}
          <p className="text-muted-foreground px-2 text-xs leading-relaxed sm:text-sm">
            {mood.blurb}
          </p>
        </div>
      </div>

      {/* Tablet / desktop triad */}
      <div className="relative hidden items-center justify-center gap-4 md:flex lg:gap-8">
        <Avatar person={you} side="left" size="lg" />

        <div className="flex max-w-sm min-w-0 flex-1 flex-col items-center px-2 text-center lg:max-w-md">
          <div
            className={cn(
              "mb-2 flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-sm lg:h-16 lg:w-16 lg:text-4xl",
              mood.tone === "excellent" && "bg-emerald/15 ring-emerald/25 ring-1",
              mood.tone === "strong" && "bg-gold/15 ring-gold/30 ring-1",
              mood.tone === "balanced" && "bg-primary/10 ring-primary/20 ring-1",
              mood.tone === "cautious" && "bg-saffron/15 ring-saffron/25 ring-1",
              mood.tone === "challenging" && "bg-rose/10 ring-rose/20 ring-1",
            )}
            aria-hidden
          >
            {mood.emoji}
          </div>
          <p className="font-display text-gold text-5xl leading-none lg:text-6xl">{score}%</p>
          <p className="mt-2 text-base font-semibold tracking-tight lg:text-lg">{mood.title}</p>
          {decisionSummary ? (
            <p className="text-muted-foreground mt-1 text-sm">{decisionSummary}</p>
          ) : null}
          <div className="via-border mt-3 h-px w-16 bg-gradient-to-r from-transparent to-transparent" />
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{mood.blurb}</p>
        </div>

        <Avatar person={them} side="right" size="lg" />
      </div>
    </div>
  );
}
