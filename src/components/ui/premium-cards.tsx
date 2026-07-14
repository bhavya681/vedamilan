"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, GitCompareArrows } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";

export function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("glass-panel rounded-3xl p-5 sm:p-6", glow && "glow-border", className)}>
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
    <GlassCard className="transition-transform duration-300 hover:-translate-y-0.5">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className={cn("font-display mt-3 text-3xl sm:text-4xl", toneClass)}>{value}</p>
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
  aiScore,
  headline,
  photo,
  href = routes.matchProfile,
  onShortlist,
  shortlisting,
}: {
  name: string;
  age: number;
  city: string;
  profession: string;
  score: number;
  aiScore: number;
  headline: string;
  photo?: string;
  href?: string;
  onShortlist?: () => void;
  shortlisting?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group border-border/40 bg-navy shadow-elevated relative overflow-hidden rounded-3xl border"
    >
      <div className="relative aspect-[4/5] w-full">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="bg-brand-dual-soft absolute inset-0" />
        )}
        <div className="from-navy via-navy/35 absolute inset-0 bg-gradient-to-t to-transparent" />

        <div className="border-gold/40 bg-navy/50 absolute top-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-md">
          <div
            className="bg-compat-dual text-navy flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold"
            aria-label={`${score}% compatibility`}
          >
            {score}
          </div>
        </div>

        <div className="text-ivory absolute inset-x-0 bottom-0 space-y-3 p-5">
          <div>
            <h3 className="font-display text-2xl tracking-tight">{name}</h3>
            <p className="text-ivory/75 mt-1 text-sm">
              {age} · {city} · {profession}
            </p>
          </div>
          <p className="text-ivory/80 line-clamp-2 text-sm leading-relaxed">{headline}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ivory/90 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
              AI {aiScore}%
            </span>
            <span className="bg-gold/20 text-gold rounded-full px-2.5 py-1 text-[11px]">
              Compat {score}%
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button asChild size="sm" className="flex-1">
              <Link href={href}>View profile</Link>
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="border-ivory/25 text-ivory"
              aria-label="Shortlist"
              type="button"
              disabled={shortlisting}
              onClick={onShortlist}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="border-ivory/25 text-ivory"
              aria-label="Compare"
            >
              <Link href={routes.matchCompare}>
                <GitCompareArrows className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer h-40 rounded-3xl", className)} aria-hidden />;
}
