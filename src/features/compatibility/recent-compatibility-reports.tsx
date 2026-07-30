"use client";

import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SoftEmoji, useCompatMood } from "@/features/compatibility/compatibility-visuals";
import { useT } from "@/components/i18n/i18n-provider";
import { localizeDecisionSummary } from "@/lib/i18n/catalogs/localize";
import { shouldUnoptimizeImage } from "@/features/profile/profile-photo";
import { cn } from "@/lib/utils/cn";

export type RecentReportPair = {
  you: { userId: string; name: string; photo: string | null };
  them: { userId: string; name: string; photo: string | null; city?: string | null };
};

export type RecentReportItem = {
  _id?: string;
  decisionSummary?: string;
  decisionReason?: string;
  deepOverallScore?: number;
  overallScore?: number;
  displayScore?: number;
  totalGuna?: number;
  maxGuna?: number;
  calculatedAt?: string;
  strengths?: string[];
  challenges?: string[];
  pair?: RecentReportPair;
};

function MiniAvatar({ name, photo, ring }: { name: string; photo?: string | null; ring: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-sm ring-2 sm:h-14 sm:w-14",
        ring,
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
          unoptimized={shouldUnoptimizeImage(photo)}
        />
      ) : (
        <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-xs font-semibold sm:text-sm">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}

function scoreToneClasses(tone: string) {
  switch (tone) {
    case "excellent":
      return {
        chip: "border-emerald/40 bg-emerald/12 text-foreground",
        bar: "bg-emerald",
        score: "text-emerald",
        emoji: "💚",
        label: "Excellent",
      };
    case "strong":
      return {
        chip: "border-gold/45 bg-gold/15 text-foreground",
        bar: "bg-gold",
        score: "text-foreground",
        emoji: "✨",
        label: "Strong",
      };
    case "balanced":
      return {
        chip: "border-primary/35 bg-primary/10 text-foreground",
        bar: "bg-primary",
        score: "text-foreground",
        emoji: "🤝",
        label: "Balanced",
      };
    case "cautious":
      return {
        chip: "border-saffron/40 bg-saffron/12 text-foreground",
        bar: "bg-saffron",
        score: "text-foreground",
        emoji: "🌿",
        label: "Needs care",
      };
    default:
      return {
        chip: "border-rose/35 bg-rose/10 text-foreground",
        bar: "bg-rose",
        score: "text-foreground",
        emoji: "🕊️",
        label: "Challenging",
      };
  }
}

function ReportRow({
  report,
  active,
  onSelect,
}: {
  report: RecentReportItem;
  active?: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const score = report.displayScore ?? report.deepOverallScore ?? report.overallScore ?? 0;
  const mood = useCompatMood(score);
  const tone = scoreToneClasses(mood.tone);
  const summary = report.decisionSummary
    ? localizeDecisionSummary(t, report.decisionSummary)
    : mood.title;
  const you = report.pair?.you;
  const them = report.pair?.them;
  const strengthN = report.strengths?.length ?? 0;
  const challengeN = report.challenges?.length ?? 0;
  const dateLabel = report.calculatedAt
    ? new Date(report.calculatedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-muted/35 w-full px-3 py-3.5 text-left transition-colors sm:px-4 sm:py-4",
        active && "bg-primary/6",
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Pair faces */}
        <div className="relative flex shrink-0 items-center">
          <MiniAvatar name={you?.name || "You"} photo={you?.photo} ring="ring-primary/30" />
          <MiniAvatar name={them?.name || "Match"} photo={them?.photo} ring="-ml-3 ring-gold/35" />
          <span className="border-border/50 bg-background absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm">
            <SoftEmoji
              emoji={tone.emoji}
              size="sm"
              pulse={false}
              className="text-sm leading-none"
            />
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-display truncate text-base leading-tight sm:text-lg">
              <span className="text-foreground/80">{you?.name?.split(" ")[0] || "You"}</span>
              <Heart className="text-gold/80 mx-1.5 inline h-3.5 w-3.5" />
              <span>{them?.name || "Match"}</span>
            </p>
            <Badge className={cn("border text-[10px]", tone.chip)}>
              {tone.emoji} {tone.label}
            </Badge>
          </div>

          <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
            {summary || mood.title}
            {them?.city ? ` · ${them.city}` : ""}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
            {typeof report.totalGuna === "number" ? (
              <span className="text-muted-foreground">
                Guna {report.totalGuna}/{report.maxGuna || 36}
              </span>
            ) : null}
            {strengthN > 0 ? (
              <span className="text-emerald inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {strengthN} strengths
              </span>
            ) : null}
            {challengeN > 0 ? (
              <span className="text-muted-foreground">{challengeN} to discuss</span>
            ) : null}
          </div>

          <div className="bg-muted/50 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
            <div
              className={cn("h-full rounded-full transition-[width]", tone.bar)}
              style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
            />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={cn(
              "font-display text-2xl leading-none tabular-nums sm:text-3xl",
              tone.score,
            )}
          >
            {Math.round(score)}
            <span className="text-muted-foreground text-sm">%</span>
          </p>
          <p className="text-muted-foreground mt-1 text-[10px] tracking-wide uppercase">
            {mood.tone === "challenging" || mood.tone === "cautious" ? "Watch" : "Align"}
          </p>
        </div>
      </div>
    </button>
  );
}

export function RecentCompatibilityReports({
  reports,
  activeId,
  onSelect,
}: {
  reports: RecentReportItem[];
  activeId?: string | null;
  onSelect: (report: RecentReportItem) => void;
}) {
  if (!reports.length) return null;

  return (
    <div className="border-border/70 bg-card shadow-soft divide-border/50 divide-y overflow-hidden rounded-2xl border">
      {reports.map((r) => (
        <ReportRow
          key={String(r._id)}
          report={r}
          active={activeId != null && String(r._id) === String(activeId)}
          onSelect={() => onSelect(r)}
        />
      ))}
    </div>
  );
}
