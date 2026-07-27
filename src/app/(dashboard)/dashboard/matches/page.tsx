"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, HeartHandshake, Stars, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { useT } from "@/components/i18n/i18n-provider";
import { MatchCard } from "@/components/ui/premium-cards";
import { ContentReveal, MatchesPageSkeleton } from "@/components/ui/page-skeletons";
import { ScoreExplainCallout } from "@/features/matchmaking/components/score-explain";
import { routes } from "@/lib/constants/routes";

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna?: number;
  manglik: string;
  headline: string | null;
  cardSummary?: string;
  photo: string | null;
  reasons: string[];
  gunaBreakdown: Array<{ koota: string; score: number; max: number }>;
  recommendationTier?: "BEST" | "STRONG" | "GOOD" | "EXPLORE";
  rank?: number;
};

type InterestPerson = {
  otherUserId: string;
  name: string;
  photo?: string | null;
  city?: string | null;
  profession?: string | null;
  age?: number | null;
  mutual?: boolean;
};

function whyMatch(match: MatchItem) {
  return (
    match.reasons?.[0] ||
    match.cardSummary ||
    match.headline ||
    "Recommended from your kundli compatibility"
  );
}

export default function MatchesPage() {
  const t = useT();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [hasSelfChart, setHasSelfChart] = useState(true);
  const [interestedInYou, setInterestedInYou] = useState<InterestPerson[]>([]);
  const [mutual, setMutual] = useState<InterestPerson[]>([]);
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<"birth" | "kundli" | "profile" | "gender" | null>(
    null,
  );
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const [interestBusy, setInterestBusy] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recRes, profileRes, chartRes, interestRes] = await Promise.all([
        fetch("/api/recommendations"),
        fetch("/api/profile"),
        fetch("/api/horoscope"),
        fetch("/api/interests"),
      ]);
      const recJson = await recRes.json();
      const profileJson = await profileRes.json();
      const chartJson = await chartRes.json();
      const interestJson = await interestRes.json();
      setLoading(false);

      if (!recJson.success) {
        setError(recJson.error?.message || "Could not load matches");
        setMatches([]);
        return;
      }

      const data = ((recJson.data?.data || []) as MatchItem[])
        .slice()
        .sort((a, b) => {
          if (b.compatibilityScore !== a.compatibilityScore) {
            return b.compatibilityScore - a.compatibilityScore;
          }
          if (b.totalGuna !== a.totalGuna) return b.totalGuna - a.totalGuna;
          return (a.rank ?? 0) - (b.rank ?? 0);
        })
        .map((m, i) => ({ ...m, rank: m.rank ?? i + 1 }));
      // Kundli-sorted: highest overall compatibility first
      setMatches(data);
      setHasSelfChart(recJson.data?.hasSelfChart !== false && Boolean(chartJson.data?.horoscope));

      if (interestJson.success) {
        const received = (interestJson.data.received || []) as InterestPerson[];
        const mutualList = (interestJson.data.mutual || []) as InterestPerson[];
        const sent = (interestJson.data.sent || []) as InterestPerson[];
        setInterestedInYou(received.filter((r) => !r.mutual));
        setMutual(mutualList);
        setSentInterestIds(new Set(sent.map((s) => s.otherUserId)));
      }

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

  const best = useMemo(
    () =>
      matches
        .filter(
          (m) => (m.recommendationTier || (m.compatibilityScore >= 80 ? "BEST" : "")) === "BEST",
        )
        .slice(0, 9),
    [matches],
  );
  const strong = useMemo(
    () =>
      matches
        .filter((m) => {
          const tier = m.recommendationTier || (m.compatibilityScore >= 68 ? "STRONG" : "");
          return tier === "STRONG";
        })
        .slice(0, 9),
    [matches],
  );
  const more = useMemo(() => {
    const topIds = new Set([...best, ...strong].map((m) => m.userId));
    return matches.filter((m) => !topIds.has(m.userId)).slice(0, 12);
  }, [matches, best, strong]);

  async function shortlist(userId: string) {
    setShortlisting(userId);
    await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    setShortlisting(null);
  }

  async function expressInterest(userId: string) {
    setInterestBusy(userId);
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: userId }),
    });
    const json = await res.json();
    if (json.success) {
      setSentInterestIds((prev) => new Set(prev).add(userId));
      if (json.data?.state === "MUTUAL_INTEREST") {
        await load();
      }
    }
    setInterestBusy(null);
  }

  function renderGrid(items: MatchItem[]) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((match, index) => (
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
              headline={whyMatch(match)}
              photo={match.photo || undefined}
              href={`${routes.matchProfile}?id=${match.userId}`}
              shortlisting={shortlisting === match.userId}
              onShortlist={() => void shortlist(match.userId)}
              interested={sentInterestIds.has(match.userId)}
              interestBusy={interestBusy === match.userId}
              onInterest={() => void expressInterest(match.userId)}
            />
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-xs">
              <span className="text-foreground/80 font-medium">
                #{match.rank ?? index + 1} by match score
              </span>
              <span>{match.compatibilityScore}% match score</span>
              <span>
                Guna {match.totalGuna}/{match.maxGuna || 36}
              </span>
            </div>
            <Button asChild variant="link" className="h-auto px-0 text-sm">
              <Link href={`${routes.compatibility}?candidate=${match.userId}`}>
                See compatibility score
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("pages.matchesTitle")}
        description="Ranked by match score — how relevant each profile is for you in discovery. Open Compatibility for a deep chart compare."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.connections}>
                <Users className="mr-1.5 h-4 w-4" />
                {t("navigation.connections")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.search}>
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Link>
            </Button>
          </div>
        }
      />

      <ScoreExplainCallout kind="match" className="max-w-2xl" />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {loading ? (
        <MatchesPageSkeleton />
      ) : !hasSelfChart || setupHint === "kundli" || setupHint === "birth" ? (
        <EmptyState
          title="Generate your Kundli to unlock ranked matches"
          description="We compare Moon, Nakshatra, Ashta Koota, and Shukra factors so the most compatible people appear first."
          action={
            <Button asChild>
              <Link href={setupHint === "birth" ? routes.birthDetails : routes.kundli}>
                {setupHint === "birth" ? "Add birth details" : "Generate Kundli"}
              </Link>
            </Button>
          }
        />
      ) : matches.length > 0 ? (
        <ContentReveal className="space-y-10">
          {mutual.length || interestedInYou.length ? (
            <section className="space-y-4">
              {mutual.length ? (
                <div className="border-border/60 space-y-3 border-y py-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="text-primary h-4 w-4" />
                    <h2 className="font-display text-xl">Mutual Interest</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mutual.map((p) => (
                      <Button key={p.otherUserId} asChild size="sm" variant="secondary">
                        <Link href={`${routes.matchProfile}?id=${p.otherUserId}`}>
                          {p.name} · Connect
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
              {interestedInYou.length ? (
                <div className="space-y-2">
                  <h2 className="font-display text-xl">People interested in you</h2>
                  <div className="flex flex-wrap gap-2">
                    {interestedInYou.slice(0, 8).map((p) => (
                      <Button key={p.otherUserId} asChild size="sm" variant="outline">
                        <Link href={`${routes.matchProfile}?id=${p.otherUserId}`}>{p.name}</Link>
                      </Button>
                    ))}
                    <Button asChild size="sm" variant="link">
                      <Link href={routes.connections}>See all</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {best.length ? (
            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stars className="text-gold h-5 w-5" />
                  <h2 className="font-display text-2xl">Best kundli matches</h2>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  Highest chart compatibility with your Moon, Nakshatra, and Ashta Koota (80%+).
                </p>
              </div>
              {renderGrid(best)}
            </section>
          ) : null}

          {strong.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">Strong Vedic alignment</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Solid multi-factor scores from your birth charts (68–79%).
                </p>
              </div>
              {renderGrid(strong)}
            </section>
          ) : null}

          {more.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">More suggestions</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Still ranked by your kundli — explore when you want a wider view.
                </p>
              </div>
              {renderGrid(more)}
            </section>
          ) : null}

          {!best.length && !strong.length && more.length === 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl">Recommended for you</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ranked by Vedic compatibility from your kundli.
                </p>
              </div>
              {renderGrid(matches.slice(0, 12))}
            </section>
          ) : null}
        </ContentReveal>
      ) : (
        <EmptyState
          title={
            setupHint === "gender"
              ? "Set your gender to see suited matches"
              : setupHint === "profile"
                ? "Help us understand you"
                : "Waiting for charted matches"
          }
          description={
            setupHint === "gender"
              ? "We only suggest opposite-gender profiles for matrimonial matching."
              : "Members with kundlis appear here, ranked by compatibility with your chart."
          }
          action={
            <Button asChild>
              <Link
                href={
                  setupHint === "gender" || setupHint === "profile"
                    ? routes.onboarding
                    : routes.search
                }
              >
                {setupHint === "gender"
                  ? "Set gender"
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
