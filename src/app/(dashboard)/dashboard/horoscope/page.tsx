"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AI_GURU_NAME, AiGuruAvatar, AiGuruLabel } from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

export default function HoroscopePage() {
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [dasha, setDasha] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [scores, setScores] = useState({ love: 0, career: 0, health: 0, spirit: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [chartRes, aiRes] = await Promise.all([
        fetch("/api/horoscope"),
        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "HOROSCOPE",
            message: "Give a gentle daily focus based on my stored chart and dasha.",
          }),
        }),
      ]);
      const chart = await chartRes.json();
      const ai = await aiRes.json();
      if (!chart.success || !chart.data?.horoscope) {
        setError("Generate your kundli to unlock daily horoscope guidance.");
        setLoading(false);
        return;
      }
      const h = chart.data.horoscope;
      setMoonSign(h.moonSign);
      const maha = chart.data.dasha?.currentMaha;
      const antar = chart.data.dasha?.currentAntar;
      setDasha(maha ? `${maha}${antar ? ` / ${antar}` : ""}` : null);
      const seed =
        (h.moonSign?.length || 0) +
        (chart.data.dasha?.currentMaha?.length || 0) +
        new Date().getDate();
      setScores({
        love: 55 + (seed % 35),
        career: 50 + ((seed * 3) % 40),
        health: 60 + ((seed * 5) % 30),
        spirit: 58 + ((seed * 7) % 32),
      });
      setSummary(
        ai.success
          ? ai.data.answer
          : `Moon in ${h.moonSign}. Review kundli and AI Insights for deeper guidance.`,
      );
      setLoading(false);
    }
    void load().catch(() => {
      setError("Failed to load horoscope");
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Daily horoscope"
        description="Guidance grounded in your stored Vedic chart"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
            </Button>
          </div>
        }
      />
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <GlassCard glow className="overflow-hidden p-0">
            <div className="border-border/40 from-card via-card to-muted/25 relative border-b bg-gradient-to-r px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_14%,transparent),transparent_55%)]" />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AiGuruAvatar size="sm" />
                    <AiGuruLabel />
                  </div>
                  <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
                    {moonSign || "…"} · Moon day
                  </h2>
                  {dasha ? (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Current dasha · <span className="text-foreground font-medium">{dasha}</span>
                    </p>
                  ) : null}
                </div>
                <Badge className="bg-primary/12 text-foreground hover:bg-primary/12 border-0">
                  {AI_GURU_NAME}
                </Badge>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              {loading || !summary ? (
                <div className="space-y-3" role="status" aria-label="Preparing reading">
                  <PanelSkeleton lines={4} className="border-0 p-0 shadow-none" />
                </div>
              ) : (
                <GuruMarkdown content={summary} tone="assistant" />
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              Day tone meters
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  ["Love", scores.love],
                  ["Career", scores.career],
                  ["Health", scores.health],
                  ["Spirit", scores.spirit],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
