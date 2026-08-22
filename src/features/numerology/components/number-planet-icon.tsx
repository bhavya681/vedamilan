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
    xl: "h-16 w-16 text-2xl sm:h-24 sm:w-24 sm:text-4xl lg:h-28 lg:w-28 lg:text-5xl",
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
