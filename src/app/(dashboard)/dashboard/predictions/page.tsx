"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AI_GURU_NAME, AiGuruAvatar, AiGuruLabel } from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Period = "today" | "week" | "month";

export default function PredictionsPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [dasha, setDasha] = useState<string | null>(null);
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [chartRes, gocharRes] = await Promise.all([
          fetch("/api/horoscope").then((r) => r.json()),
          fetch("/api/gochar").then((r) => r.json()),
        ]);
        if (!chartRes.success || !chartRes.data?.horoscope) {
          if (!cancelled) {
            setError("Generate your kundli to unlock period guidance.");
            setLoading(false);
          }
          return;
        }
        const h = chartRes.data.horoscope;
        const maha = chartRes.data.dasha?.currentMaha;
        const antar = chartRes.data.dasha?.currentAntar;
        if (!cancelled) {
          setMoonSign(h.moonSign || null);
          setDasha(maha ? `${maha}${antar ? ` / ${antar}` : ""}` : null);
          setHighlights(gocharRes.success ? gocharRes.data?.highlights || [] : []);
        }

        const prompt =
          period === "today"
            ? "Give a gentle daily focus based on my stored chart, current dasha, and live gochar highlights. Do not invent planet positions."
            : period === "week"
              ? "Summarize the week ahead using my current mahadasha/antardasha and the live gochar highlights provided by tools. Focus on themes, not absolute predictions."
              : "Summarize the month ahead using my current dasha period and major transit themes from gochar tools. Stay interpretive and calm.";

        const aiRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "HOROSCOPE", message: prompt }),
        });
        const ai = await aiRes.json();
        if (!cancelled) {
          setNarrative(
            ai.success
              ? ai.data.answer
              : `Moon in ${h.moonSign}. Review Kundli, Gochar, and AI Guru for deeper guidance.`,
          );
        }
      } catch {
        if (!cancelled) setError("Failed to load predictions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Personalized · chart + dasha + gochar"
        title="Predictions"
        description="Period guidance grounded in deterministic astrology data. AI explains — it does not calculate."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.gochar}>Live Gochar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>AI Guru</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["today", "Today"],
            ["week", "This week"],
            ["month", "This month"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              period === key
                ? "border-gold/40 bg-primary/12 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Calculated from your Kundli</Badge>
              {moonSign ? <Badge variant="outline">Moon · {moonSign}</Badge> : null}
              {dasha ? <Badge variant="outline">Dasha · {dasha}</Badge> : null}
            </div>
            {highlights.length ? (
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Live Gochar highlights
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {highlights.map((h) => (
                    <li key={h}>· {h}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Live transit highlights appear when Gochar can be calculated for your chart.
              </p>
            )}
          </GlassCard>

          <GlassCard glow className="overflow-hidden p-0">
            <div className="border-border/40 from-card via-card to-muted/25 relative border-b bg-gradient-to-r px-5 py-5 sm:px-6">
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AiGuruAvatar size="sm" />
                    <AiGuruLabel />
                  </div>
                  <h2 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">
                    AI Guru Interpretation ·{" "}
                    {period === "today" ? "Today" : period === "week" ? "This week" : "This month"}
                  </h2>
                </div>
                <Badge className="bg-primary/12 text-foreground hover:bg-primary/12 border-0">
                  {AI_GURU_NAME}
                </Badge>
              </div>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              {loading || !narrative ? (
                <PanelSkeleton lines={4} className="border-0 p-0 shadow-none" />
              ) : (
                <GuruMarkdown content={narrative} tone="assistant" />
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
