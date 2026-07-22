"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, SearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { MatchCard, GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  totalGuna: number;
  manglik: string;
  headline: string;
  photo: string | null;
  reasons: string[];
  gunaBreakdown: Array<{ koota: string; score: number; max: number }>;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<"birth" | "kundli" | "profile" | null>(null);
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recRes, profileRes, chartRes] = await Promise.all([
        fetch("/api/recommendations"),
        fetch("/api/profile"),
        fetch("/api/horoscope"),
      ]);
      const recJson = await recRes.json();
      const profileJson = await profileRes.json();
      const chartJson = await chartRes.json();
      setLoading(false);

      if (!recJson.success) {
        setError(recJson.error?.message || "Could not load matches");
        setMatches([]);
        return;
      }

      const data = (recJson.data?.data || []) as MatchItem[];
      setMatches(data);

      const hasBirth = Boolean(profileJson.success && profileJson.data?.birthDetails?.birthDate);
      const hasChart = Boolean(chartJson.success && chartJson.data?.horoscope);
      const completion = profileJson.data?.profile?.completion?.score ?? 0;
      if (!hasBirth) setSetupHint("birth");
      else if (!hasChart) setSetupHint("kundli");
      else if (completion < 40) setSetupHint("profile");
      else setSetupHint(null);
    } catch {
      setLoading(false);
      setError("Could not load matches");
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    void load();
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Recommended for you"
        description="People aligned with your preferences and Vedic compatibility."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={routes.search}>
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.compatibility}>Check compatibility</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {loading ? (
        <p className="text-muted-foreground text-sm">Finding recommended matches…</p>
      ) : matches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35 }}
            >
              <GlassCard className="space-y-3 p-4">
                <MatchCard
                  name={match.name}
                  age={match.age ?? 0}
                  city={match.city || "—"}
                  profession={match.profession || "—"}
                  score={match.compatibilityScore}
                  aiScore={match.compatibilityScore}
                  headline={match.headline}
                  photo={match.photo || undefined}
                  href={`${routes.matchProfile}?id=${match.userId}`}
                  shortlisting={shortlisting === match.userId}
                  onShortlist={() => void shortlist(match.userId)}
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{match.compatibilityScore}% Match</Badge>
                  {match.totalGuna != null ? (
                    <Badge variant="outline">{match.totalGuna}/36 Guna</Badge>
                  ) : null}
                </div>
                {match.reasons?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide uppercase">Why this match?</p>
                    <ul className="text-muted-foreground list-inside list-disc text-sm">
                      {match.reasons.slice(0, 3).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : match.headline ? (
                  <p className="text-muted-foreground text-sm">{match.headline}</p>
                ) : null}
                <Button asChild variant="link" className="h-auto px-0 text-sm">
                  <Link href={`${routes.compatibility}?candidate=${match.userId}`}>
                    View detailed compatibility
                  </Link>
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title={
            setupHint === "birth"
              ? "We need a few more details to find meaningful matches"
              : setupHint === "kundli"
                ? "Generate your Kundli to unlock Vedic matching"
                : "No matches yet"
          }
          description={
            setupHint === "birth"
              ? "Add birth details so we can calculate compatibility."
              : setupHint === "kundli"
                ? "Your chart powers Ashta Koota and relationship scoring."
                : "Check back as more members join, or broaden your search."
          }
          action={
            <Button asChild>
              <Link
                href={
                  setupHint === "birth"
                    ? routes.birthDetails
                    : setupHint === "kundli"
                      ? routes.kundli
                      : setupHint === "profile"
                        ? routes.onboarding
                        : routes.search
                }
              >
                {setupHint === "birth"
                  ? "Add birth details"
                  : setupHint === "kundli"
                    ? "Generate Kundli"
                    : setupHint === "profile"
                      ? "Complete profile"
                      : "Open Search"}
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
