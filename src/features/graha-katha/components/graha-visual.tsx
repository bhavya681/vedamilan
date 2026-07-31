"use client";

import type { GrahaAccent, GrahaId } from "@/domain/graha-katha/types";
import { GrahaCharacter } from "@/features/graha-katha/components/graha-character";
import { cn } from "@/lib/utils/cn";

const ACCENT: Record<GrahaAccent, { wash: string; ink: string; ring: string; glow: string }> = {
  gold: {
    wash: "from-[#2a2110] via-[#5c4518] to-[#1a140c]",
    ink: "text-[#f3e2a8]",
    ring: "stroke-[#d4af37]",
    glow: "bg-[#d4af37]/25",
  },
  saffron: {
    wash: "from-[#2c180c] via-[#8a4a14] to-[#1c120a]",
    ink: "text-[#ffd6a8]",
    ring: "stroke-[#e08a2c]",
    glow: "bg-[#c47a1a]/30",
  },
  cosmic: {
    wash: "from-[#0f1a28] via-[#1f3a5f] to-[#0c121c]",
    ink: "text-[#c9d8ec]",
    ring: "stroke-[#8fb0d4]",
    glow: "bg-[#2a4a6f]/35",
  },
  rose: {
    wash: "from-[#2a1418] via-[#6e3a42] to-[#180e12]",
    ink: "text-[#f0d0d4]",
    ring: "stroke-[#b76e79]",
    glow: "bg-[#b76e79]/28",
  },
  ivory: {
    wash: "from-[#2a261e] via-[#5a5246] to-[#161410]",
    ink: "text-[#f4eee2]",
    ring: "stroke-[#e8dcc4]",
    glow: "bg-[#f7f1e3]/18",
  },
  charcoal: {
    wash: "from-[#0c0c0e] via-[#23262c] to-[#080809]",
    ink: "text-[#e4e2dc]",
    ring: "stroke-[#9a958c]",
    glow: "bg-[#d4af37]/12",
  },
};

/** Short visual cue under the character — helps beginners decode the archetype. */
const VISUAL_CUE: Partial<Record<GrahaId, string>> = {
  surya: "Radiant authority",
  chandra: "Mind & tides",
  mangal: "Courage in action",
  budha: "Messenger of ideas",
  guru: "Teacher of wisdom",
  shukra: "Love & beauty",
  shani: "Time & discipline",
  rahu: "Rising desire",
  ketu: "Path of release",
};

export function GrahaVisual({
  graha,
  size = "md",
  className,
  animated = true,
}: {
  graha: {
    id?: GrahaId | string;
    englishName: string;
    sanskritName: string;
    accent: GrahaAccent;
    archetype?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}) {
  const theme = ACCENT[graha.accent];
  const dims =
    size === "lg"
      ? "min-h-[200px] sm:min-h-[260px] lg:min-h-[300px]"
      : size === "sm"
        ? "min-h-[148px] sm:min-h-[168px]"
        : "min-h-[180px] sm:min-h-[200px]";
  const cue = graha.id ? VISUAL_CUE[graha.id as GrahaId] : undefined;

  return (
    <div
      className={cn(
        "shadow-elevated relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br",
        theme.wash,
        theme.ink,
        dims,
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          theme.glow,
          animated && "animate-float-soft motion-reduce:animate-none",
        )}
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="78"
          className={theme.ring}
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
        <circle
          cx="100"
          cy="100"
          r="58"
          className={theme.ring}
          strokeOpacity="0.28"
          strokeWidth="0.5"
        />
        <circle
          cx="100"
          cy="100"
          r="38"
          className={theme.ring}
          strokeOpacity="0.18"
          strokeWidth="0.5"
        />
      </svg>

      <div className="relative flex h-full flex-col items-center justify-center gap-1 px-4 py-5 text-center sm:gap-1.5 sm:px-6 sm:py-7">
        <GrahaCharacter
          grahaId={graha.id}
          englishName={graha.englishName}
          size={size}
          animated={animated}
        />
        <span className="font-indic text-sm tracking-wide opacity-90 sm:text-base">
          {graha.sanskritName}
        </span>
        {cue ? (
          <span className="text-[10px] tracking-[0.14em] uppercase opacity-65 sm:text-[11px]">
            {cue}
          </span>
        ) : null}
        {size === "lg" && graha.archetype ? (
          <span className="mt-0.5 max-w-[17rem] text-[11px] leading-snug tracking-[0.12em] uppercase opacity-70">
            {graha.archetype}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
