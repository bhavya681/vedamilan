"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SearchX } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { MatchCard, GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { AI_GURU_NAME, AiGuruAvatar, AiGuruLabel } from "@/features/ai/components/ai-guru-identity";
import { routes } from "@/lib/constants/routes";

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  headline: string;
  photo: string | null;
  reasons: string[];
};

export default function RecommendationsPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [recRes, aiRes] = await Promise.all([
      fetch("/api/recommendations"),
      fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "RECOMMENDATION",
          message: "Explain my top recommended matches and what to do next.",
        }),
      }),
    ]);
    const recJson = await recRes.json();
    const aiJson = await aiRes.json();
    setLoading(false);
    if (!recJson.success) {
      setError(recJson.error?.message || "Failed to load recommendations");
      return;
    }
    setMatches(recJson.data.data || []);
    if (aiJson.success) setNarrative(aiJson.data.answer);
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setLoading(false);
      setError("Failed to load recommendations");
    });
  }, [load]);

  async function shortlist(userId: string) {
    setShortlisting(userId);
    await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    setShortlisting(null);
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Recommendations"
        description="Prioritized next actions"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading recommendations…</p> : null}

      {narrative ? (
        <GlassCard>
          <div className="flex items-start gap-3">
            <AiGuruAvatar size="md" />
            <div className="min-w-0 flex-1">
              <AiGuruLabel />
              <p className="font-display mt-1 text-xl">{AI_GURU_NAME} guidance</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                {narrative}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!loading && matches.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="No recommendations yet"
          description="Complete profile and kundli, then refresh match ranking."
          action={
            <Button asChild>
              <Link href={routes.matches}>Open match feed</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.slice(0, 6).map((m) => (
            <MatchCard
              key={m.userId}
              name={m.name}
              age={m.age ?? 0}
              city={m.city || "—"}
              profession={m.profession || "—"}
              score={m.compatibilityScore}
              aiScore={m.compatibilityScore}
              headline={m.headline || m.reasons?.[0] || "Recommended match"}
              photo={m.photo || undefined}
              href={`${routes.matchProfile}?id=${m.userId}`}
              shortlisting={shortlisting === m.userId}
              onShortlist={() => void shortlist(m.userId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
