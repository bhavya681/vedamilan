"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { SoftEmoji, moodFromScore } from "@/features/compatibility/compatibility-visuals";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

/** Solid surface — default product container. Pass glass for overlays only. */
export function GlassCard({
  children,
  className,
  glow,
  glass = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  /** Reserve glass for overlays / floating AI — default is solid. */
  glass?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 sm:p-6",
        glass ? "glass-panel" : "border-border/70 bg-card shadow-soft border",
        glow && "glow-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ai" | "gold" | "rose" | "success";
}) {
  const toneClass = {
    default: "text-foreground",
    ai: "text-ai",
    gold: "text-gold",
    rose: "text-rose",
    success: "text-emerald",
  }[tone];

  return (
    <GlassCard>
      <p className="text-muted-foreground text-xs font-medium tracking-wide">{label}</p>
      <p className={cn("font-display mt-2 text-3xl sm:text-4xl", toneClass)}>{value}</p>
      {hint ? <p className="text-muted-foreground mt-2 text-xs">{hint}</p> : null}
    </GlassCard>
  );
}

export function MatchCard({
  name,
  age,
  city,
  profession,
  score,
  headline,
  photo,
  href = routes.matchProfile,
  onShortlist,
  shortlisting,
  onInterest,
  interested,
  interestBusy,
}: {
  name: string;
  age: number;
  city: string;
  profession: string;
  score: number;
  /** @deprecated Ignored — one score only */
  aiScore?: number;
  headline: string;
  photo?: string;
  href?: string;
  onShortlist?: () => void;
  shortlisting?: boolean;
  onInterest?: () => void;
  interested?: boolean;
  interestBusy?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const mood = moodFromScore(score);

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group border-border/40 bg-navy shadow-elevated relative overflow-hidden rounded-2xl border"
    >
      <div className="relative aspect-[4/5] w-full">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            unoptimized={Boolean(photo?.startsWith("/"))}
          />
        ) : (
          <div className="bg-brand-dual-soft absolute inset-0" />
        )}
        <div className="from-navy via-navy/40 absolute inset-0 bg-gradient-to-t to-transparent" />

        <div
          className="border-gold/50 bg-navy/60 absolute top-4 right-4 flex flex-col items-center gap-0.5 rounded-2xl border px-2.5 py-1.5 backdrop-blur-md"
          aria-label={`${score}% compatibility — ${mood.title}`}
        >
          <SoftEmoji emoji={mood.emoji} size="sm" pulse={false} />
          <span className="text-ivory text-sm leading-none font-semibold">{score}</span>
        </div>

        <div className="text-ivory absolute inset-x-0 bottom-0 space-y-3 p-5">
          <div>
            <h3 className="font-display text-2xl tracking-tight">{name}</h3>
            <p className="text-ivory/75 mt-1 text-sm">
              {[age, city, profession].filter(Boolean).join(" · ")}
            </p>
          </div>
          <p className="text-ivory/85 line-clamp-2 text-sm leading-relaxed">{headline}</p>
          <div className="flex gap-2 pt-1">
            <Button asChild size="sm" className="flex-1">
              <Link href={href}>View profile</Link>
            </Button>
            {onInterest ? (
              <Button
                size="sm"
                variant="outline"
                className="border-ivory/25 text-ivory hover:bg-ivory/10"
                type="button"
                disabled={interestBusy || interested}
                onClick={onInterest}
                aria-label={interested ? "Interest sent" : "Interested"}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {interested ? "Interested ✓" : "Interested"}
                </span>
              </Button>
            ) : null}
            <Button
              size="icon"
              variant="outline"
              className="border-ivory/25 text-ivory hover:bg-ivory/10"
              aria-label="Shortlist"
              type="button"
              disabled={shortlisting}
              onClick={onShortlist}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Skeleton className={cn("h-40 rounded-2xl", className)} />;
}
