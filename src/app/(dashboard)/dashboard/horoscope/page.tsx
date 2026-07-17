"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { routes } from "@/lib/constants/routes";

export default function HoroscopePage() {
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [scores, setScores] = useState({ love: 0, career: 0, health: 0, spirit: 0 });
  const [error, setError] = useState<string | null>(null);

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
        return;
      }
      const h = chart.data.horoscope;
      setMoonSign(h.moonSign);
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
    }
    void load().catch(() => setError("Failed to load horoscope"));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Daily horoscope"
        description="Guidance grounded in your stored Vedic chart"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Kundli</Link>
          </Button>
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
        <GlassCard glow>
          <h2 className="font-display text-3xl">{moonSign || "…"} · Today</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed whitespace-pre-wrap">
            {summary || "Loading…"}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                  <span>{value}%</span>
                </div>
                <Progress value={value} />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
