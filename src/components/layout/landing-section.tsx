"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function LandingSection({
  id,
  children,
  className,
  innerClassName,
  tone = "default",
  ...props
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: "default" | "muted" | "navy" | "soft";
} & HTMLAttributes<HTMLElement>) {
  const toneClass = {
    default: "bg-transparent",
    muted: "border-y border-border/40 bg-muted/30",
    navy: "bg-navy text-ivory",
    soft: "bg-brand-dual-soft",
  }[tone];

  return (
    <section id={id} className={cn("relative", toneClass, className)} {...props}>
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  light,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p
          className={cn(
            "text-[11px] font-semibold tracking-[0.22em] uppercase",
            light ? "text-gold" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display mt-3 text-3xl tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          light ? "text-ivory" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed sm:text-base",
            light ? "text-ivory/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Shared shell for About / Pricing / FAQ / legal marketing pages under fixed overlay nav. */
export function MarketingPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main-content"
      className={cn(
        "relative mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pb-24",
        className,
      )}
    >
      {children}
    </main>
  );
}
