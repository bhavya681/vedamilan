"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import type { WisdomGuide } from "@/domain/wisdom/guides";

const accentClass: Record<WisdomGuide["accent"], string> = {
  gold: "bg-gold/15 text-gold ring-gold/25",
  saffron: "bg-primary/12 text-primary ring-primary/25",
  cosmic: "bg-cosmic/15 text-cosmic ring-cosmic/25",
  rose: "bg-rose/12 text-rose ring-rose/25",
  ivory: "bg-muted text-foreground/80 ring-border",
};

export function WisdomPortrait({
  guide,
  size = "md",
  className,
}: {
  guide: Pick<WisdomGuide, "displayName" | "monogram" | "accent">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass =
    size === "sm"
      ? "h-12 w-12 text-lg"
      : size === "lg"
        ? "h-24 w-24 text-3xl"
        : size === "xl"
          ? "h-32 w-32 text-4xl sm:h-40 sm:w-40 sm:text-5xl"
          : "h-16 w-16 text-2xl";

  return (
    <div
      className={cn(
        "font-display flex items-center justify-center rounded-full ring-1",
        accentClass[guide.accent],
        sizeClass,
        className,
      )}
      role="img"
      aria-label={`Symbolic monogram for ${guide.displayName} — artistic representation, not a historical photograph`}
    >
      {guide.monogram}
    </div>
  );
}

export function WisdomGuideCard({ guide, featured }: { guide: WisdomGuide; featured?: boolean }) {
  return (
    <article
      className={cn(
        "border-border/60 group flex flex-col gap-4 border-b py-6 sm:flex-row sm:items-start sm:gap-6",
        featured && "sm:py-8",
      )}
    >
      <WisdomPortrait guide={guide} size={featured ? "lg" : "md"} className="shrink-0" />
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
            {guide.role} · {guide.era}
          </p>
          <h3 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
            {guide.displayName}
            {guide.sanskritName ? (
              <span className="text-muted-foreground ml-2 text-base font-normal">
                {guide.sanskritName}
              </span>
            ) : null}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">{guide.domain}</p>
        </div>
        <p className="font-display text-foreground/90 max-w-2xl text-lg leading-snug">
          “{guide.shortPhilosophy}”
        </p>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          AI Wisdom Guide inspired by teachings traditionally associated with {guide.displayName}.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`${routes.vedicWisdom}/${guide.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold transition-colors"
          >
            Explore Wisdom
          </Link>
          <Link
            href={`${routes.vedicWisdom}/${guide.id}/chat`}
            className="border-border hover:bg-muted inline-flex h-10 items-center rounded-xl border px-5 text-sm font-semibold transition-colors"
          >
            Begin Conversation
          </Link>
          <Link
            href={`${routes.vedicWisdom}/${guide.id}/voice`}
            className="border-border hover:bg-muted inline-flex h-10 items-center rounded-xl border px-5 text-sm font-semibold transition-colors"
          >
            Speak with {guide.displayName}
          </Link>
        </div>
      </div>
    </article>
  );
}
