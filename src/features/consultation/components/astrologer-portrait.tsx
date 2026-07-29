"use client";

import Link from "next/link";
import { MessageCircle, Mic } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { consultationPaths } from "@/lib/constants/routes";
import { AiAstrologerAvatar } from "@/features/consultation/components/ai-astrologer-avatar";
import type { VirtualAstrologer } from "@/domain/consultation/virtual-astrologers";

export function AstrologerPortrait({
  astrologer,
  size = "md",
  className,
}: {
  astrologer: Pick<VirtualAstrologer, "id" | "displayName" | "monogram" | "accent" | "gender">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass =
    size === "sm"
      ? "h-12 w-12"
      : size === "lg"
        ? "h-24 w-24"
        : size === "xl"
          ? "h-32 w-32 sm:h-40 sm:w-40"
          : "h-16 w-16";

  return (
    <AiAstrologerAvatar
      astrologer={astrologer}
      className={cn("ring-border/60 shadow-soft ring-1", sizeClass, className)}
    />
  );
}

export function AstrologerTile({ astrologer }: { astrologer: VirtualAstrologer }) {
  const accentBar: Record<VirtualAstrologer["accent"], string> = {
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
          accentBar[astrologer.accent],
        )}
        aria-hidden
      />
      <div className="flex items-start gap-3 pl-1">
        <div className="ring-gold/25 group-hover:ring-gold/45 relative shrink-0 rounded-full ring-1 transition-shadow duration-300">
          <AstrologerPortrait astrologer={astrologer} size="lg" className="!h-20 !w-20 shrink-0" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
            {astrologer.title}
          </p>
          <Link
            href={consultationPaths.astrologer(astrologer.id)}
            className="font-display hover:text-gold text-lg leading-tight tracking-tight transition-colors"
          >
            {astrologer.displayName}
          </Link>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {astrologer.shortBlurb}
          </p>
          <p className="text-gold/80 text-[11px] font-medium">{astrologer.tradition}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-1">
        <Link
          href={consultationPaths.chat(astrologer.id)}
          className="border-border/60 bg-background/70 hover:border-gold/40 hover:bg-gold/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Chat
        </Link>
        <Link
          href={consultationPaths.voice(astrologer.id)}
          className="border-border/60 bg-background/70 hover:border-gold/40 hover:bg-gold/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Mic className="h-3.5 w-3.5" />
          Speak
        </Link>
      </div>
    </article>
  );
}
