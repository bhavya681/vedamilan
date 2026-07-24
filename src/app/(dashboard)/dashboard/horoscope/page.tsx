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

export default function HoroscopePage() {
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [dasha, setDasha] = useState<string | null>(null);
  const [gocharHighlights, setGocharHighlights] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [chartRes, gocharRes, aiRes] = await Promise.all([
        fetch("/api/horoscope"),
        fetch("/api/gochar"),
        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "HOROSCOPE",
            message:
              "Give a gentle daily focus based on my stored chart, current dasha, and live gochar. Do not invent meters or planet positions.",
          }),
        }),
      ]);
      const chart = await chartRes.json();
      const gochar = await gocharRes.json();
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
      setGocharHighlights(gochar.success ? gochar.data?.highlights || [] : []);
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
        description="Guidance grounded in your stored Vedic chart and live Gochar — no invented day meters."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.predictions}>Period predictions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.gochar}>Live Gochar</Link>
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
              <p className="text-muted-foreground mb-3 text-xs">
                AI Guru Interpretation · explains calculated chart data
              </p>
              {loading || !summary ? (
                <div className="space-y-3" role="status" aria-label="Preparing reading">
                  <PanelSkeleton lines={4} className="border-0 p-0 shadow-none" />
                </div>
              ) : (
                <GuruMarkdown content={summary} tone="assistant" />
              )}
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              Calculated from your Kundli · Live Gochar
            </p>
            {gocharHighlights.length ? (
              <ul className="space-y-1.5 text-sm">
                {gocharHighlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Live transit highlights appear when Gochar can be calculated.{" "}
                <Link
                  href={routes.gochar}
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  Open Gochar
                </Link>
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
