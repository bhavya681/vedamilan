"use client";

import { cn } from "@/lib/utils/cn";

export function NumberPlanetIcon({
  number,
  planet,
  size = "sm",
  className,
}: {
  number: number;
  planet: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }[size];

  return (
    <div
      className={cn(
        "border-gold/25 bg-gold/10 dark:bg-gold/15 text-gold flex shrink-0 items-center justify-center rounded-full border",
        sizeClass,
        className,
      )}
      aria-label={`Number ${number} of ${planet}`}
    >
      <span className="font-display text-base">{number}</span>
    </div>
  );
}
