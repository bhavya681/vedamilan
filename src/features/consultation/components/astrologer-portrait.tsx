"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle, Mic } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { consultationPaths } from "@/lib/constants/routes";
import { AiAstrologerAvatar } from "@/features/consultation/components/ai-astrologer-avatar";
import { ASTROLOGER_SYSTEM_META } from "@/features/consultation/system-meta";
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

const accentBar: Record<VirtualAstrologer["accent"], string> = {
  gold: "from-gold/80 via-gold/40 to-transparent",
  saffron: "from-primary/80 via-primary/40 to-transparent",
  cosmic: "from-cosmic/80 via-cosmic/40 to-transparent",
  rose: "from-rose/80 via-rose/40 to-transparent",
  ivory: "from-foreground/35 via-foreground/15 to-transparent",
};

const accentGlow: Record<VirtualAstrologer["accent"], string> = {
  gold: "bg-gold/15",
  saffron: "bg-primary/15",
  cosmic: "bg-cosmic/15",
  rose: "bg-rose/15",
  ivory: "bg-foreground/10",
};

export function AstrologerTile({ astrologer }: { astrologer: VirtualAstrologer }) {
  const system = ASTROLOGER_SYSTEM_META[astrologer.system];
  const SystemIcon = system.icon;

  return (
    <article className="border-border/55 from-card/95 via-card/80 group to-muted/25 shadow-soft hover:border-gold/35 hover:shadow-gold focus-within:ring-gold/30 relative flex h-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 focus-within:ring-2 hover:-translate-y-0.5 sm:p-5">
      <span
        className={cn(
          "absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b opacity-80",
          accentBar[astrologer.accent],
        )}
        aria-hidden
      />
      <div className="flex min-w-0 items-start gap-3 pl-1">
        <div className="relative shrink-0">
          <span
            className={cn(
              "absolute -inset-1.5 rounded-full blur-md transition-opacity duration-300 group-hover:opacity-100",
              accentGlow[astrologer.accent],
              "opacity-60",
            )}
            aria-hidden
          />
          <div className="ring-gold/25 group-hover:ring-gold/45 relative rounded-full ring-1 transition-shadow duration-300">
            <AstrologerPortrait
              astrologer={astrologer}
              size="lg"
              className="!h-20 !w-20 shrink-0"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <span className="border-border/60 bg-background/60 text-muted-foreground inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-medium tracking-[0.1em] uppercase">
            <SystemIcon className="text-gold h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{system.label}</span>
          </span>
          <Link
            href={consultationPaths.astrologer(astrologer.id)}
            className="font-display hover:text-gold inline-flex min-w-0 items-center gap-1 text-lg leading-tight tracking-tight transition-colors"
          >
            <span className="truncate">{astrologer.displayName}</span>
            <ArrowUpRight
              className="text-muted-foreground group-hover:text-gold h-3.5 w-3.5 shrink-0 transition-colors"
              aria-hidden
            />
          </Link>
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.12em] uppercase">
            {astrologer.title}
          </p>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {astrologer.shortBlurb}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pl-1">
        {astrologer.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="border-border/50 bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px]"
          >
            {topic}
          </span>
        ))}
      </div>

      <p className="text-gold/80 pl-1 text-[11px] font-medium">{astrologer.tradition}</p>

      <div className="mt-auto flex flex-wrap gap-2 pl-1">
        <Link
          href={consultationPaths.chat(astrologer.id)}
          className="border-border/60 bg-background/70 hover:border-gold/40 hover:bg-gold/8 inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          Chat
        </Link>
        <Link
          href={consultationPaths.voice(astrologer.id)}
          className="border-border/60 bg-background/70 hover:border-gold/40 hover:bg-gold/8 inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Mic className="h-3.5 w-3.5" aria-hidden />
          Speak
        </Link>
        <Link
          href={consultationPaths.astrologer(astrologer.id)}
          className="text-muted-foreground hover:text-foreground ml-auto inline-flex min-h-9 items-center gap-1 px-1 text-xs font-medium transition-colors"
        >
          Profile
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
