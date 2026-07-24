"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MoodBadge,
  SoftEmoji,
  YoniEnergyCard,
  kootaEmoji,
  moodFromScore,
} from "@/features/compatibility/compatibility-visuals";
import {
  TimingPredictionPanel,
  type TimingPredictionView,
} from "@/features/compatibility/timing-prediction-panel";
import {
  AdvancedMarriageDynamicsPanel,
  type AdvancedMarriageDynamicsView,
} from "@/features/compatibility/advanced-marriage-dynamics-panel";
import { CompatibilitySkeleton, ContentReveal } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type Report = {
  _id?: string;
  totalGuna?: number;
  maxGuna?: number;
  overallScore?: number;
  deepOverallScore?: number;
  decisionSummary?: string;
  decisionReason?: string;
  manglikCompatibility?: string;
  gunaBreakdown?: Array<{
    koota: string;
    score: number;
    max: number;
    note: string;
    emoji?: string | null;
    visual?: string | null;
  }>;
  strengths?: string[];
  challenges?: string[];
  userAId?: string;
  userBId?: string;
  calculatedAt?: string;
  shukraMilan?: { averageScore?: number; percent?: number; observation?: string };
  categoryScores?: Record<string, number>;
  deepAnalysis?: {
    modules?: Array<{ title: string; score: number; observation: string }>;
    remedies?: string[];
  };
  timingPrediction?: TimingPredictionView | null;
  advancedMarriageDynamics?: AdvancedMarriageDynamicsView | null;
};

export default function CompatibilityReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    void fetch("/api/compatibility")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          setError(json.error?.message || "Failed to load report");
          return;
        }
        const reports: Report[] = json.data.reports || [];
        const found = id ? reports.find((r) => String(r._id) === id) : reports[0];
        if (!found) {
          setError("No compatibility report yet. Run deep milan first.");
          return;
        }
        setReport(found);
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load report");
      });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility Report"
        description="Compatibility score — deep chart compare (Ashta Koota, Shukra Milan, weighted modules). Different from discovery match score."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={routes.compatibility}>All reports</Link>
            </Button>
            {report?.userBId ? (
              <Button asChild variant="outline">
                <Link href={`${routes.matchProfile}?id=${report.userBId}`}>View match</Link>
              </Button>
            ) : null}
          </>
        }
      />
      {loading ? <CompatibilitySkeleton /> : null}
      {error && !loading ? (
        <EmptyState
          title="No report yet"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.compatibility}>Run compatibility</Link>
            </Button>
          }
        />
      ) : null}
      {report && !loading ? (
        <ContentReveal className="space-y-6">
          <GlassCard glow>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl">
                  {report.userAId?.slice(0, 8)}… × {report.userBId?.slice(0, 8)}…
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Compatibility score {report.deepOverallScore ?? report.overallScore}% · Shukra{" "}
                  {report.shukraMilan?.averageScore ?? "—"}/10 · Guna {report.totalGuna}/
                  {report.maxGuna} · Manglik {report.manglikCompatibility}
                </p>
                {typeof (report.deepOverallScore ?? report.overallScore) === "number" ? (
                  <div className="mt-3">
                    <MoodBadge score={report.deepOverallScore ?? report.overallScore ?? 0} />
                  </div>
                ) : null}
              </div>
              {report.decisionSummary ? (
                <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                  {report.decisionSummary}
                </Badge>
              ) : null}
            </div>
            {report.decisionReason ? (
              <p className="mt-4 text-sm leading-relaxed">{report.decisionReason}</p>
            ) : null}
            <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
              This is your Compatibility score from the deep engine (Ashta Koota + Shukra Milan +
              weighted modules) — not the Match score shown in discovery. AI may explain this
              dossier but never recalculates placements.
            </p>
            {(report.strengths || []).length ? (
              <div className="mt-6">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(report.strengths || []).slice(0, 8).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(report.challenges || []).length ? (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Challenges</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(report.challenges || []).slice(0, 8).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button asChild className="mt-6" variant="secondary">
              <Link href={routes.aiInsights}>Ask AI Guru to explain</Link>
            </Button>
          </GlassCard>

          {report.timingPrediction ? (
            <TimingPredictionPanel timing={report.timingPrediction} pairMode />
          ) : null}

          {report.advancedMarriageDynamics ? (
            <AdvancedMarriageDynamicsPanel data={report.advancedMarriageDynamics} />
          ) : null}

          {(report.deepAnalysis?.remedies || []).length ? (
            <GlassCard className="space-y-3">
              <div>
                <h3 className="font-display text-xl">Relationship guidance</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Habit and communication themes from the deep compatibility engine — not medical
                  advice, and not AI-invented remedies.
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {report.deepAnalysis?.remedies?.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </GlassCard>
          ) : null}

          {report.categoryScores ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(report.categoryScores)
                .filter(([k]) =>
                  [
                    "emotional",
                    "shukraMilan",
                    "ashtaKoota",
                    "longevity",
                    "family",
                    "trust",
                  ].includes(k),
                )
                .map(([k, v]) => {
                  const mood = moodFromScore(v);
                  return (
                    <GlassCard key={k}>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-muted-foreground text-[10px] uppercase">
                          {k.replace(/([A-Z])/g, " $1")}
                        </p>
                        <SoftEmoji emoji={mood.emoji} size="sm" pulse={false} />
                      </div>
                      <p className="font-display mt-1 text-2xl">{v}%</p>
                      <Progress value={v} className="mt-2 h-1.5" />
                    </GlassCard>
                  );
                })}
            </div>
          ) : null}

          {(() => {
            const yoni = report.gunaBreakdown?.find((g) => g.koota === "Yoni");
            if (!yoni) return null;
            return (
              <YoniEnergyCard
                visual={yoni.visual}
                emoji={yoni.emoji}
                note={yoni.note}
                score={yoni.score}
                max={yoni.max}
              />
            );
          })()}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(report.gunaBreakdown || []).map((g) => (
              <GlassCard key={g.koota}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-muted-foreground text-[10px] uppercase">{g.koota}</p>
                  <SoftEmoji emoji={kootaEmoji(g.koota, g.emoji)} size="sm" />
                </div>
                <p className="font-display text-rose mt-1 text-2xl">
                  {g.score}
                  <span className="text-muted-foreground text-sm">/{g.max}</span>
                </p>
                {g.visual && g.koota !== "Yoni" ? (
                  <p className="text-foreground/80 mt-1.5 text-[11px] font-medium">{g.visual}</p>
                ) : null}
                <p className="text-muted-foreground mt-2 text-xs">{g.note}</p>
              </GlassCard>
            ))}
          </div>

          {(report.deepAnalysis?.modules || []).length ? (
            <GlassCard>
              <h3 className="font-display text-xl">Module snapshot</h3>
              <div className="mt-4 space-y-3">
                {report.deepAnalysis?.modules?.map((m) => (
                  <div key={m.title}>
                    <div className="flex justify-between text-sm">
                      <span>{m.title}</span>
                      <span className="font-medium">{m.score}%</span>
                    </div>
                    <Progress value={m.score} className="mt-1 h-1.5" />
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}

          <Badge variant="outline">
            Calculated{" "}
            {report.calculatedAt ? new Date(report.calculatedAt).toLocaleString() : "recently"}
          </Badge>
        </ContentReveal>
      ) : null}
    </div>
  );
}
