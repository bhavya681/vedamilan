"use client";

import {
  formatPlanetStory,
  planetVoiceToneClasses,
  type PlanetVoiceMessage,
} from "@/application/horoscope/planet-voice";
import { cn } from "@/lib/utils/cn";

/** Story card below the D1 chart — high contrast, always readable. */
export function PlanetStoryHover({
  message,
  className,
}: {
  message: PlanetVoiceMessage;
  className?: string;
}) {
  const tone = planetVoiceToneClasses(message.condition);
  const story = formatPlanetStory(message);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-border bg-background text-foreground w-full rounded-xl border-2 px-4 py-3.5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-foreground text-base leading-tight sm:text-lg">
          {message.headline}
        </p>
        <span
          className={cn(
            "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            tone.chip,
          )}
        >
          {message.conditionLabel}
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-[11px] tracking-wide uppercase">
        Karaka · {message.karaka}
      </p>
      <p className="text-foreground mt-2.5 text-sm leading-relaxed sm:text-[15px]">
        &ldquo;{story}&rdquo;
      </p>
    </div>
  );
}

/** @deprecated Use PlanetStoryHover */
export function PlanetVoicePanel({
  message,
  className,
}: {
  message: PlanetVoiceMessage | null;
  className?: string;
}) {
  if (!message) return null;
  return <PlanetStoryHover message={message} className={className} />;
}
