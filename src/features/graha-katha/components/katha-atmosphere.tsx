"use client";

import { cn } from "@/lib/utils/cn";

/** Soft cosmic wash behind Graha Katha pages — editorial, not glassmorphism. */
export function KathaAtmosphere({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "katha-atmosphere pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(520px,70vh)] overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="katha-atmosphere-glow" />
      <div className="katha-atmosphere-mandala animate-mandala-spin motion-reduce:animate-none" />
    </div>
  );
}
