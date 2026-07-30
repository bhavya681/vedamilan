"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { shouldUnoptimizeImage } from "@/features/profile/profile-photo";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

type SurfaceProps = {
  children: React.ReactNode;
  className?: string;
  /** Prefer false. Glass only for overlays / floating panels. */
  glass?: boolean;
  /** @deprecated Decorative glow — ignored for calmer surfaces */
  glow?: boolean;
};

/**
 * Default product surface: solid card + border.
 * Prefer open sections / dividers when content is not a discrete object.
 */
export function Surface({ children, className, glass = false }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 sm:p-6",
        glass ? "glass-panel" : "border-border/70 bg-card border",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** @deprecated Prefer Surface — kept for call-site compatibility */
export function GlassCard({ children, className, glass = false }: SurfaceProps) {
  return (
    <Surface className={className} glass={glass}>
      {children}
    </Surface>
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
    <Surface>
      <p className="text-muted-foreground text-xs font-medium tracking-wide">{label}</p>
      <p className={cn("font-display mt-2 text-3xl sm:text-4xl", toneClass)}>{value}</p>
      {hint ? <p className="text-muted-foreground mt-2 text-xs">{hint}</p> : null}
    </Surface>
  );
}

export function MatchCard({
  name,
  age,
  city,
  profession,
  score,
  mindApprox,
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
  /** Approx mind/temperament alignment from core kundli preview */
  mindApprox?: number;
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
  const mindLabel =
    typeof mindApprox === "number" && mindApprox > 0 ? ` · Mind ~${mindApprox}%` : "";

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group border-border/50 bg-navy shadow-elevated relative overflow-hidden rounded-xl border"
    >
      <div className="relative aspect-[4/5] w-full">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            unoptimized={shouldUnoptimizeImage(photo)}
          />
        ) : (
          <div className="bg-muted absolute inset-0" />
        )}
        <div className="from-navy via-navy/50 absolute inset-0 bg-gradient-to-t to-transparent" />

        <div
          className="border-ivory/20 bg-navy/80 absolute top-3 right-3 min-w-[3.25rem] rounded-md border px-2 py-1 text-center"
          title={`~${score}% approx core kundli match${mindLabel}. Deep compatibility is on the Compatibility page.`}
          aria-label={`Approximately ${score} percent core match score${mindLabel}`}
        >
          <p className="text-ivory text-sm leading-none font-semibold tabular-nums">~{score}%</p>
          <p className="text-ivory/65 mt-0.5 text-[9px] font-medium tracking-wide uppercase">
            Match
          </p>
          {typeof mindApprox === "number" && mindApprox > 0 ? (
            <p className="text-ivory/55 mt-0.5 text-[8px] tracking-wide">Mind ~{mindApprox}%</p>
          ) : null}
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
                <Heart className={cn("h-3.5 w-3.5", interested && "fill-current")} />
                <span className="hidden sm:inline">{interested ? "Interested" : "Interested"}</span>
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
  return <Skeleton className={cn("h-40 rounded-xl", className)} />;
}
