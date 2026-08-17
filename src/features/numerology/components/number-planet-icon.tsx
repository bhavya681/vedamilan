"use client";

import { cn } from "@/lib/utils/cn";

export function NumberPlanetIcon({
  number,
  planet,
  size = "sm",
  className,
  active = false,
}: {
  number: number;
  planet: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  active?: boolean;
}) {
  const sizeClass = {
    sm: "h-9 w-9 text-base",
    md: "h-12 w-12 text-lg",
    lg: "h-16 w-16 text-2xl",
    xl: "h-24 w-24 text-4xl sm:h-28 sm:w-28 sm:text-5xl",
  }[size];

  return (
    <div
      className={cn(
        "border-gold/25 bg-gold/10 dark:bg-gold/15 text-gold flex shrink-0 items-center justify-center rounded-full border",
        sizeClass,
        active && "ring-gold/40 ring-offset-background ring-2 ring-offset-2",
        className,
      )}
      aria-label={`Number ${number} of ${planet}`}
    >
      <span className="font-display leading-none">{number}</span>
    </div>
  );
}
