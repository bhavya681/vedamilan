"use client";

import { Heart } from "lucide-react";

import { GlassCard } from "@/components/ui/premium-cards";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";

export type Window = {
  label: string;
  window: string;
  score: number;
  reason?: string;
  kind?: "PARTNER_ARRIVAL" | "MARRIAGE" | "INTRODUCTION";
  dashaLabel?: string;
  startDate?: string;
  endDate?: string;
  approxNote?: string;
};

export type Factor = {
  id: string;
  name: string;
  score: number;
  weight: number;
  note: string;
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald";
  if (score >= 60) return "text-foreground";
  if (score >= 40) return "text-primary";
  return "text-rose";
}

function verdictLabel(score: number): string {
  if (score >= 80) return "FAVORABLE";
  if (score >= 65) return "SUPPORTIVE";
  if (score >= 45) return "NEUTRAL";
  if (score >= 30) return "CAUTIOUS";
  return "UNFAVORABLE";
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function MarriageWindowsPanel({
  marriageWindows,
  pastMarriageWindows,
  timingFactors,
  timingMethodology,
}: {
  marriageWindows?: Window[];
  pastMarriageWindows?: Window[];
  timingFactors?: Factor[];
  timingMethodology?: string | null;
}) {
  const hasWindows = marriageWindows && marriageWindows.length > 0;
  const topWindow = hasWindows ? marriageWindows![0] : null;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="text-rose h-4 w-4" />
        <h3 className="font-display text-lg">Marriage timing</h3>
      </div>

      {topWindow ? (
        <>
          <div className="border-border/50 rounded-xl border p-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{topWindow.label}</p>
              <span className={cn("font-display text-xl", scoreColor(topWindow.score))}>
                {topWindow.score}%
              </span>
            </div>
            <p className="border-gold/30 text-muted-foreground mt-1.5 border-l pl-2 text-xs">
              {topWindow.window}
            </p>
            {topWindow.reason ? (
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {topWindow.reason}
              </p>
            ) : null}
          </div>

          {hasWindows && marriageWindows!.length > 1 ? (
            <div className="space-y-2.5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Other windows
              </p>
              <ul className="space-y-2">
                {marriageWindows!.slice(1, 6).map((w) => (
                  <li key={w.label} className="border-border/40 border-l px-2 py-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium">{w.label}</span>
                      <span className={cn("text-xs", scoreColor(w.score))}>{w.score}%</span>
                    </div>
                    <p className="text-muted-foreground text-[10px]">
                      {formatDate(w.startDate)} - {formatDate(w.endDate) || w.window}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          {pastMarriageWindows && pastMarriageWindows.length > 0
            ? "No future marriage windows — see recent activations below."
            : "Generate your kundli and dasha to reveal marriage windows."}
        </p>
      )}

      {pastMarriageWindows && pastMarriageWindows.length > 0 ? (
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Recent activations (past)
          </p>
          <ul className="space-y-2">
            {pastMarriageWindows.slice(0, 5).map((w, i) => (
              <li key={`past-${i}`} className="border-border/40 border-l px-2 py-1.5">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">{w.label}</span>
                  <span className={cn("text-xs", scoreColor(w.score))}>{w.score}%</span>
                </div>
                <p className="text-muted-foreground text-[10px]">{w.window}</p>
                {w.dashaLabel ? (
                  <p className="text-gold/70 mt-0.5 text-[10px]">{w.dashaLabel}</p>
                ) : null}
                <p className="text-muted-foreground mt-1 text-[10px] leading-relaxed">{w.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {timingFactors && timingFactors.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Vedic timing factors
            </p>
            {timingFactors[0]?.weight != null ? (
              <Badge variant="secondary" className="text-[10px]">
                Weighted scoring
              </Badge>
            ) : null}
          </div>
          <ul className="space-y-2.5">
            {timingFactors.map((f) => {
              const weighted = Math.round((f.score * f.weight) / 100);
              return (
                <li key={f.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium">{f.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {f.score}% x {f.weight}%w = {weighted}
                    </span>
                  </div>
                  <Progress value={f.score} className="h-1" />
                  <p className="text-muted-foreground text-[10px] leading-relaxed">{f.note}</p>
                </li>
              );
            })}
          </ul>
          {timingMethodology ? (
            <p className="border-border/40 text-muted-foreground border-t pt-2 text-[10px] leading-relaxed">
              {timingMethodology}
            </p>
          ) : null}
        </div>
      ) : null}

      {topWindow?.score != null ? (
        <div className="border-border/30 border-t pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Timing verdict</p>
            <span className={cn("font-display text-sm", scoreColor(topWindow.score))}>
              {verdictLabel(topWindow.score)}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-[11px]">
            Probability derived from Dasha + Gochar + Bond strength. These windows show when Vedic
            transits align with your natal chart for marriage activation.
          </p>
        </div>
      ) : null}
    </GlassCard>
  );
}
