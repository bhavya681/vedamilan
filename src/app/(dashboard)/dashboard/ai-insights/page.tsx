"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type Insight = {
  id: string;
  title: string;
  tags: string[];
  body: string;
  confidence: number;
};

const AGENTS = [
  { value: "HOROSCOPE", label: "Horoscope" },
  { value: "COMPATIBILITY", label: "Compatibility" },
  { value: "MARRIAGE_TIMING", label: "Marriage timing" },
  { value: "RELATIONSHIP_COACH", label: "Relationship coach" },
  { value: "PROFILE_ANALYSIS", label: "Profile analysis" },
  { value: "RECOMMENDATION", label: "Recommendations" },
  { value: "SUPPORT", label: "Support" },
] as const;

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<(typeof AGENTS)[number]["value"]>("RELATIONSHIP_COACH");
  const [message, setMessage] = useState("What should I focus on this week?");
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/ai/insights")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load insights");
          return;
        }
        setInsights(json.data.insights || []);
        setDisclaimer(json.data.disclaimer || "");
      })
      .catch(() => setError("Failed to load insights"));
  }, []);

  async function askAgent(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent, message }),
    });
    const json = await res.json();
    setBusy(false);
    if (!json.success) {
      setError(json.error?.message || "AI request failed");
      return;
    }
    setAnswer(json.data.answer);
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="AI Insights"
        description="Explainable relationship intelligence"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <GlassCard className="space-y-3">
        <form className="space-y-3" onSubmit={askAgent}>
          <label className="text-sm font-medium">Agent</label>
          <select
            className="border-input bg-background w-full rounded-xl border px-3 py-2"
            value={agent}
            onChange={(e) => setAgent(e.target.value as typeof agent)}
          >
            {AGENTS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <textarea
            className="border-input bg-background min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Thinking…" : "Ask AI"}
          </Button>
        </form>
        {answer ? (
          <div className="border-border/50 mt-2 rounded-2xl border p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>
        ) : null}
      </GlassCard>

      <div className="space-y-4">
        {insights.map((i) => (
          <GlassCard key={i.id} className="glow-border">
            <div className="flex flex-wrap gap-2">
              {i.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
            <h2 className="font-display mt-3 text-2xl">{i.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {i.body}
            </p>
            <p className="text-ai mt-4 text-xs">Confidence {i.confidence}%</p>
          </GlassCard>
        ))}
      </div>

      {disclaimer ? <p className="text-muted-foreground text-xs">{disclaimer}</p> : null}
    </div>
  );
}
