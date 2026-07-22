"use client";

import Image from "next/image";

import { brand } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

/** Canonical name for every AI chat persona in the product. */
export const AI_GURU_NAME = "AI Guru";

export const AI_GURU_TAGLINE = "Sacred Vedic guidance · grounded in your chart";

export function AiGuruAvatar({
  size = "md",
  className,
  busy = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  busy?: boolean;
}) {
  const dim = size === "sm" ? 28 : size === "lg" ? 44 : 36;

  return (
    <div
      className={cn(
        "border-gold/35 bg-navy shadow-soft relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border",
        size === "sm" && "h-7 w-7 sm:h-8 sm:w-8",
        size === "md" && "h-9 w-9",
        size === "lg" && "h-11 w-11",
        className,
      )}
      aria-hidden
    >
      <Image
        src={brand.logo.mark}
        alt=""
        width={dim}
        height={dim}
        className={cn("object-contain p-1", busy && "opacity-70")}
      />
      {busy ? (
        <span className="border-gold/40 absolute inset-0 animate-pulse rounded-full border" />
      ) : null}
    </div>
  );
}

export function AiGuruLabel({ className }: { className?: string }) {
  return (
    <p className={cn("text-gold text-[11px] font-semibold tracking-[0.14em] uppercase", className)}>
      {AI_GURU_NAME}
    </p>
  );
}

export function AiGuruHeader({
  subtitle,
  className,
  online = false,
}: {
  subtitle?: string;
  className?: string;
  online?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AiGuruAvatar size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl leading-none tracking-tight sm:text-2xl">
            {AI_GURU_NAME}
          </h2>
          {online ? (
            <span className="border-emerald/25 bg-emerald/10 text-emerald inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium">
              <span className="bg-emerald h-1.5 w-1.5 rounded-full" aria-hidden />
              Present
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1.5 truncate text-xs">
          {subtitle || AI_GURU_TAGLINE}
        </p>
      </div>
    </div>
  );
}
