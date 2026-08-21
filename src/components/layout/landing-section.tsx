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
    <section id={id} className={cn("relative overflow-x-clip", toneClass, className)} {...props}>
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-[max(1rem,env(safe-area-inset-left,0px))] py-10 pr-[max(1rem,env(safe-area-inset-right,0px))] sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-16",
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
            "text-[11px] font-semibold tracking-[0.2em] uppercase",
            light ? "text-gold" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display mt-3 text-[1.75rem] tracking-tight text-balance sm:text-4xl md:text-[2.35rem] lg:text-5xl lg:leading-[1.12]",
          light ? "text-ivory" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3.5 text-sm leading-relaxed sm:text-base",
            light ? "text-ivory/72" : "text-muted-foreground",
            align === "center" && "mx-auto max-w-xl",
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
        "relative mx-auto w-full max-w-7xl flex-1 px-4 pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-16 sm:px-6 sm:pt-[calc(7rem+env(safe-area-inset-top,0px))] sm:pb-20 lg:px-8 lg:pb-24",
        className,
      )}
    >
      {children}
    </main>
  );
}
