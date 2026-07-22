"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { MatchCard, SkeletonCard } from "@/components/ui/premium-cards";
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
  headline: string | null;
  cardSummary?: string;
  photo: string | null;
  reasons: string[];
  gunaBreakdown: Array<{ koota: string; score: number; max: number }>;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<"birth" | "kundli" | "profile" | "gender" | null>(
    null,
  );
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

      const gender = profileJson.data?.profile?.gender as string | undefined;
      const hasGender = gender === "MALE" || gender === "FEMALE";
      const hasBirth = Boolean(profileJson.success && profileJson.data?.birthDetails?.birthDate);
      const hasChart = Boolean(chartJson.success && chartJson.data?.horoscope);
      const completion = profileJson.data?.profile?.completion?.score ?? 0;
      if (!hasGender) setSetupHint("gender");
      else if (!hasBirth) setSetupHint("birth");
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
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Potential connections"
        description="People who may align with your preferences and Vedic compatibility."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.search}>
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.compatibility}>Explore compatibility</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {loading ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">Finding meaningful connections…</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard className="aspect-[4/5] h-auto" />
            <SkeletonCard className="aspect-[4/5] h-auto" />
            <SkeletonCard className="aspect-[4/5] h-auto max-xl:hidden" />
          </div>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match, index) => {
            const reason =
              match.reasons?.[0] ||
              match.cardSummary ||
              match.headline ||
              "Explore this connection";
            return (
              <motion.div
                key={match.userId}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.35 }}
                className="space-y-2"
              >
                <MatchCard
                  name={match.name}
                  age={match.age ?? 0}
                  city={match.city || "—"}
                  profession={match.profession || "—"}
                  score={match.compatibilityScore}
                  headline={reason}
                  photo={match.photo || undefined}
                  href={`${routes.matchProfile}?id=${match.userId}`}
                  shortlisting={shortlisting === match.userId}
                  onShortlist={() => void shortlist(match.userId)}
                />
                <Button asChild variant="link" className="h-auto px-0 text-sm">
                  <Link href={`${routes.compatibility}?candidate=${match.userId}`}>
                    Explore compatibility
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            setupHint === "gender"
              ? "Set your gender to see suited matches"
              : setupHint === "birth"
                ? "Add your birth details to unlock deeper matches"
                : setupHint === "kundli"
                  ? "Generate your Kundli to unlock Vedic matching"
                  : "Your match journey is waiting"
          }
          description={
            setupHint === "gender"
              ? "We only suggest opposite-gender profiles for matrimonial matching."
              : setupHint === "birth"
                ? "Birth details help us calculate compatibility with care."
                : setupHint === "kundli"
                  ? "Your chart powers Ashta Koota and relationship scoring."
                  : "Check back as more members join, or broaden your search."
          }
          action={
            <Button asChild>
              <Link
                href={
                  setupHint === "gender" || setupHint === "profile"
                    ? routes.onboarding
                    : setupHint === "birth"
                      ? routes.birthDetails
                      : setupHint === "kundli"
                        ? routes.kundli
                        : routes.search
                }
              >
                {setupHint === "gender"
                  ? "Set gender"
                  : setupHint === "birth"
                    ? "Add birth details"
                    : setupHint === "kundli"
                      ? "Generate Kundli"
                      : setupHint === "profile"
                        ? "Help us understand you"
                        : "Open Search"}
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
