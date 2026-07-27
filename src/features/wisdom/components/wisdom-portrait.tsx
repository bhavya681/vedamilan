"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Mic } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { sagePortraitUrl } from "@/domain/wisdom/sage-portraits";
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
  guide: Pick<WisdomGuide, "id" | "displayName" | "monogram" | "accent">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const portrait = sagePortraitUrl(guide.id);
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === "sm"
      ? "h-12 w-12 text-lg"
      : size === "lg"
        ? "h-24 w-24 text-3xl"
        : size === "xl"
          ? "h-32 w-32 text-4xl sm:h-40 sm:w-40 sm:text-5xl"
          : "h-16 w-16 text-2xl";

  if (portrait && !failed) {
    return (
      <div
        className={cn(
          "ring-border/60 relative overflow-hidden rounded-full ring-1",
          sizeClass,
          className,
        )}
      >
        {/* Wikimedia / Wikipedia portraits — native img for host flexibility */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait}
          alt={`Portrait depiction of ${guide.displayName}`}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

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

/** Compact tile: portrait + chat / speak actions for the Rishi Sage home. */
export function RishiSageTile({ guide }: { guide: WisdomGuide }) {
  const accentBar: Record<WisdomGuide["accent"], string> = {
    gold: "from-gold/80 via-gold/40 to-transparent",
    saffron: "from-primary/80 via-primary/40 to-transparent",
    cosmic: "from-cosmic/80 via-cosmic/40 to-transparent",
    rose: "from-rose/80 via-rose/40 to-transparent",
    ivory: "from-foreground/35 via-foreground/15 to-transparent",
  };

  return (
    <article className="border-border/55 from-card/95 via-card/80 group to-muted/25 shadow-soft hover:border-gold/35 hover:shadow-gold relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 hover:-translate-y-0.5 sm:p-5">
      <span
        className={cn(
          "absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b opacity-80",
          accentBar[guide.accent],
        )}
        aria-hidden
      />
      <div className="flex items-start gap-3 pl-1">
        <div className="ring-gold/20 group-hover:ring-gold/40 relative shrink-0 rounded-full ring-1 transition-shadow duration-300">
          <WisdomPortrait guide={guide} size="lg" className="!h-20 !w-20 shrink-0 !text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gold/75 text-[10px] font-medium tracking-[0.14em] uppercase">
            {guide.role}
          </p>
          <h3 className="font-display mt-0.5 truncate text-lg leading-tight tracking-tight">
            {guide.displayName}
          </h3>
          {guide.sanskritName ? (
            <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
              {guide.sanskritName}
            </p>
          ) : null}
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
            {guide.domain}
          </p>
        </div>
      </div>
      <p className="font-display text-foreground/85 line-clamp-2 pl-1 text-sm leading-snug">
        <span className="text-gold/55 mr-1" aria-hidden>
          ॥
        </span>
        {guide.shortPhilosophy}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pl-1">
        <Link
          href={`${routes.vedicWisdom}/${guide.id}/chat`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors sm:flex-none"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          Chat
        </Link>
        <Link
          href={`${routes.vedicWisdom}/${guide.id}/voice`}
          className="border-border/70 hover:border-gold/35 hover:bg-gold/8 inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors sm:flex-none"
        >
          <Mic className="h-3.5 w-3.5" aria-hidden />
          Speak
        </Link>
        <Link
          href={`${routes.vedicWisdom}/${guide.id}`}
          className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center px-2 text-xs font-medium transition-colors"
        >
          Profile
        </Link>
      </div>
    </article>
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
      <WisdomPortrait guide={guide} size={featured ? "xl" : "lg"} className="shrink-0" />
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
          Portrait is a public-domain artistic depiction from Wikimedia / Wikipedia archives.
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
