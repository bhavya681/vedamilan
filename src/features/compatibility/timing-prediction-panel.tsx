"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Progress } from "@/components/ui/progress";
import { SoftEmoji } from "@/features/compatibility/compatibility-visuals";
import { cn } from "@/lib/utils/cn";

export type TimingPredictionView = {
  asOf?: string;
  marryNowVerdict?: string;
  marryNowScore?: number;
  marryNowTitle?: string;
  marryNowReason?: string;
  partnerArrivalWindows?: Array<{
    label: string;
    window: string;
    reason: string;
    score: number;
    kind?: string;
    dashaLabel?: string;
    startDate?: string;
    endDate?: string;
    approxNote?: string;
  }>;
  bestMarriageWindows?: Array<{
    label: string;
    window: string;
    reason: string;
    score: number;
    kind?: string;
    dashaLabel?: string;
    startDate?: string;
    endDate?: string;
    approxNote?: string;
  }>;
  gocharHighlights?: string[];
  dashaSnapshot?: {
    you?: {
      currentMaha?: string | null;
      currentAntar?: string | null;
      seventhLord?: string | null;
    };
    them?: {
      currentMaha?: string | null;
      currentAntar?: string | null;
      seventhLord?: string | null;
    } | null;
  };
  factors?: Array<{ id: string; name: string; score: number; weight: number; note: string }>;
  overallTimingScore?: number;
  methodology?: string;
};

const VERDICT_EMOJI: Record<string, string> = {
  FAVORABLE: "✨",
  SUPPORTIVE: "🌞",
  NEUTRAL: "🌿",
  CAUTIOUS: "🕯️",
  UNFAVORABLE: "🌧️",
};

const VERDICT_RING: Record<string, string> = {
  FAVORABLE: "bg-emerald/12 ring-emerald/30",
  SUPPORTIVE: "bg-gold/12 ring-gold/35",
  NEUTRAL: "bg-primary/10 ring-primary/25",
  CAUTIOUS: "bg-saffron/12 ring-saffron/30",
  UNFAVORABLE: "bg-rose/10 ring-rose/25",
};

export function TimingPredictionPanel({
  timing,
  pairMode = false,
  className,
}: {
  timing: TimingPredictionView | null | undefined;
  pairMode?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (!timing) {
    return (
      <div className={cn("border-border/70 bg-card shadow-soft rounded-2xl border p-5", className)}>
        <p className="text-muted-foreground text-sm">
          Re-run compatibility to generate Mahadasha + Gochar timing for this pair.
        </p>
      </div>
    );
  }

  const verdict = timing.marryNowVerdict || "NEUTRAL";
  const score = timing.marryNowScore ?? timing.overallTimingScore ?? 0;

  return (
    <div className={cn("space-y-5", className)}>
      <motion.div
        className={cn(
          "shadow-soft relative overflow-hidden rounded-2xl border p-5 sm:p-6",
          "border-border/70 bg-card",
        )}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_10%,transparent),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide">
              {pairMode ? "Is this a good time to marry?" : "Is this a good time for alliance?"}
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full ring-1",
                  VERDICT_RING[verdict] || VERDICT_RING.NEUTRAL,
                )}
              >
                <SoftEmoji emoji={VERDICT_EMOJI[verdict] || "🌿"} size="lg" />
              </div>
              <div>
                <p className="font-display text-2xl tracking-tight sm:text-3xl">
                  {timing.marryNowTitle || "Timing read"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">
                  {verdict.replace(/_/g, " ")} · {score}/100
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              {timing.marryNowReason}
            </p>
          </div>
          <p className="font-display shrink-0 text-4xl sm:text-5xl">{score}</p>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SnapshotCard
          label="Your Mahadasha"
          value={timing.dashaSnapshot?.you?.currentMaha || "—"}
          hint={
            timing.dashaSnapshot?.you?.currentAntar
              ? `Antar · ${timing.dashaSnapshot.you.currentAntar}`
              : undefined
          }
        />
        {pairMode ? (
          <SnapshotCard
            label="Partner Mahadasha"
            value={timing.dashaSnapshot?.them?.currentMaha || "—"}
            hint={
              timing.dashaSnapshot?.them?.currentAntar
                ? `Antar · ${timing.dashaSnapshot.them.currentAntar}`
                : undefined
            }
          />
        ) : (
          <SnapshotCard
            label="7th lord"
            value={timing.dashaSnapshot?.you?.seventhLord || "—"}
            hint="Partnership karaka period"
          />
        )}
        <SnapshotCard
          label={pairMode ? "Your 7th lord" : "Antardasha"}
          value={
            pairMode
              ? timing.dashaSnapshot?.you?.seventhLord || "—"
              : timing.dashaSnapshot?.you?.currentAntar || "—"
          }
        />
        <SnapshotCard
          label="Overall timing"
          value={`${timing.overallTimingScore ?? score}`}
          hint="Weighted multi-factor"
        />
      </div>

      {(timing.factors || []).length ? (
        <section className="space-y-3">
          <h3 className="font-display text-xl">What this verdict weighs</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {timing.factors!.map((f) => (
              <div key={f.id} className="border-border/60 bg-card rounded-xl border px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="font-display text-lg">
                    {f.score}
                    <span className="text-muted-foreground text-xs"> · {f.weight}%</span>
                  </p>
                </div>
                <Progress value={f.score} className="mt-2 h-1" />
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{f.note}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {(timing.gocharHighlights || []).length ? (
        <section className="space-y-2">
          <h3 className="font-display text-xl">Live Gochar highlights</h3>
          <ul className="border-border/70 bg-card divide-border/60 shadow-soft divide-y rounded-2xl border">
            {timing.gocharHighlights!.map((h) => (
              <li key={h} className="flex items-start gap-2 px-4 py-3 text-sm leading-relaxed">
                <SoftEmoji emoji="🪐" size="sm" pulse={false} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <WindowsSection
        title={pairMode ? "Best marriage windows together" : "Best marriage seasons"}
        windows={timing.bestMarriageWindows || []}
        emoji="💍"
      />

      {!pairMode || (timing.partnerArrivalWindows || []).length ? (
        <WindowsSection
          title="Periods favoring a good partner"
          windows={timing.partnerArrivalWindows || []}
          emoji="🕊️"
        />
      ) : null}

      {timing.methodology ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{timing.methodology}</p>
      ) : null}
    </div>
  );
}

function SnapshotCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-border/60 bg-card rounded-xl border px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-display mt-1 text-xl">{value}</p>
      {hint ? <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p> : null}
    </div>
  );
}

function WindowsSection({
  title,
  windows,
  emoji,
}: {
  title: string;
  windows: NonNullable<TimingPredictionView["bestMarriageWindows"]>;
  emoji: string;
}) {
  if (!windows.length) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="space-y-3">
        {windows.map((w) => (
          <div
            key={`${w.label}-${w.window}-${w.dashaLabel || ""}`}
            className="border-border/70 bg-card shadow-soft flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <SoftEmoji emoji={emoji} size="sm" pulse={false} />
                <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  {w.label}
                </p>
                {w.dashaLabel ? (
                  <span className="bg-muted text-foreground/80 rounded-md px-2 py-0.5 text-[11px] font-medium">
                    {w.dashaLabel}
                  </span>
                ) : null}
              </div>
              <p className="font-display text-xl sm:text-2xl">{w.window}</p>
              {w.approxNote ? (
                <p className="text-primary/80 text-xs font-medium">{w.approxNote}</p>
              ) : null}
              <p className="text-muted-foreground text-sm leading-relaxed">{w.reason}</p>
            </div>
            <p className="font-display shrink-0 text-3xl">{w.score}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Compact strip of top approx marriage windows for Compatibility Studio */
export function MarriageWindowsStrip({
  windows,
  onOpenTiming,
  className,
}: {
  windows?: TimingPredictionView["bestMarriageWindows"];
  onOpenTiming?: () => void;
  className?: string;
}) {
  if (!windows?.length) return null;
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl">Approx. marriage windows</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            From Vimshottari Mahadasha–Antardasha (month/year precision)
          </p>
        </div>
        {onOpenTiming ? (
          <button
            type="button"
            onClick={onOpenTiming}
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Full timing read
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {windows.slice(0, 3).map((w) => (
          <div
            key={`${w.window}-${w.dashaLabel}`}
            className="border-border/70 bg-card shadow-soft rounded-2xl border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{w.label}</p>
              <SoftEmoji emoji="💍" size="sm" pulse={false} />
            </div>
            <p className="font-display mt-2 text-xl leading-snug">{w.window}</p>
            {w.dashaLabel ? (
              <p className="text-foreground/80 mt-1 text-xs font-medium">{w.dashaLabel}</p>
            ) : null}
            {w.approxNote ? (
              <p className="text-muted-foreground mt-1 text-[11px]">{w.approxNote}</p>
            ) : null}
            <p className="font-display text-brand-dual mt-3 text-2xl">{w.score}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
