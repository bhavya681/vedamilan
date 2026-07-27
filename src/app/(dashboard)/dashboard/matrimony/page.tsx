"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Stars } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/ui/premium-cards";
import { ContentReveal, DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { moodFromScore } from "@/features/compatibility/compatibility-visuals";
import { CrossModeCta } from "@/features/workspace/cross-mode-cta";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";

type Bundle = {
  userName: string;
  moonSign: string | null;
  currentMaha: string | null;
  matches: Array<{
    userId: string;
    name: string;
    age: number | null;
    city: string | null;
    profession: string | null;
    compatibilityScore: number;
    headline: string | null;
    cardSummary?: string;
    reasons?: string[];
    photo: string | null;
  }>;
  insight: string | null;
  unread: number;
};

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MatrimonyHomePage() {
  const t = useT();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { setMode } = useWorkspaceMode();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMode("matrimony", { navigate: false });
  }, [setMode]);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [me, profile, matches, ai, notes, chartRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/recommendations").then((r) => r.json()),
          fetch("/api/ai/insights").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
          fetch("/api/horoscope").then((r) => r.json()),
        ]);

        const profileData = profile.success ? profile.data : null;
        const profileDoc = profileData?.profile;
        const readiness = evaluateOnboardingReadiness({
          gender: profileDoc?.gender,
          city: profileDoc?.city,
          profession: profileDoc?.profession,
          education: profileDoc?.education,
          dateOfBirth: profileDoc?.dateOfBirth,
          photos: profileDoc?.photos,
          completionScore: profileDoc?.completion?.score ?? 0,
          hasBirthDetails: Boolean(profileData?.birthDetails?.birthDate),
          hasChart: Boolean(chartRes.success && chartRes.data?.horoscope),
        });

        if (!readiness.ready) {
          router.replace(routes.onboarding);
          return;
        }

        const matchItems = matches.success ? matches.data.data || [] : [];
        const insight =
          ai.success && ai.data.insights?.[0]?.body
            ? ai.data.insights[0].body
            : "Open Insights for a plain-language reading of your chart.";

        setBundle({
          userName: me.user?.name || profileData?.user?.name || "friend",
          moonSign: chartRes.data?.horoscope?.moonSign || null,
          currentMaha: chartRes.data?.dasha?.currentMaha || null,
          matches: matchItems.slice(0, 3),
          insight: insight ? String(insight).slice(0, 320) : null,
          unread: notes.success ? notes.data.unread || 0 : 0,
        });
      } catch {
        setError("Failed to load matrimony home");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";

  if (loading && !bundle) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <ContentReveal className="space-y-8 sm:space-y-10">
        <PageHeader
          title={`${greeting}, ${firstName}`}
          description="Your journey continues — people who may align with your values and life path."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href={routes.matches}>
                  View matches
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={routes.compatibility}>Explore compatibility</Link>
              </Button>
            </div>
          }
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {bundle ? (
          <>
            <section className="border-border/60 grid gap-5 border-y py-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wide uppercase">
                  <Stars className="h-3.5 w-3.5" /> Moon
                </p>
                <p className="font-display mt-2 text-3xl">{bundle.moonSign || "—"}</p>
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.kundli}>Open Kundli</Link>
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Mahadasha</p>
                <p className="font-display mt-2 text-3xl">{bundle.currentMaha || "—"}</p>
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.dasha}>Timing windows</Link>
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Activity</p>
                <p className="font-display mt-2 text-3xl">{bundle.unread}</p>
                <Button asChild variant="link" className="mt-1 h-auto px-0 text-sm">
                  <Link href={routes.notifications}>Notifications</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl">Recommended for you</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Preferences and activity first — astrology enhances ranking, it does not replace
                    it.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                  <Link href={routes.matches}>See all</Link>
                </Button>
              </div>
              {bundle.matches.length ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {bundle.matches.map((m, index) => {
                    const mood = moodFromScore(m.compatibilityScore);
                    const reasons = (m.reasons || []).filter(Boolean).slice(0, 3);
                    return (
                      <motion.div
                        key={m.userId}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.04 * index }}
                        className="space-y-3"
                      >
                        <MatchCard
                          name={m.name}
                          age={m.age ?? 0}
                          city={m.city || "—"}
                          profession={m.profession || "—"}
                          score={m.compatibilityScore}
                          headline={
                            m.reasons?.[0] ||
                            m.cardSummary ||
                            m.headline ||
                            "A thoughtful connection"
                          }
                          photo={m.photo || undefined}
                          href={`${routes.matchProfile}?id=${m.userId}`}
                        />
                        {reasons.length ? (
                          <ul className="text-muted-foreground space-y-1 px-0.5 text-xs leading-relaxed">
                            <li className="text-foreground/80 font-medium">Why you may align</li>
                            {reasons.map((r) => (
                              <li key={r}>· {r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground px-0.5 text-xs">{t(mood.titleKey)}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No recommendations yet"
                  description="Complete your preferences and birth details so we can surface people whose values and life paths may align with yours."
                  action={
                    <Button asChild>
                      <Link href={routes.search}>Explore Search</Link>
                    </Button>
                  }
                />
              )}
            </section>

            {bundle.insight ? (
              <section className="border-border/60 space-y-3 border-t pt-8">
                <h2 className="font-display text-xl">A closer look at your compatibility</h2>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{bundle.insight}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.aiInsights}>Explore further</Link>
                </Button>
              </section>
            ) : null}

            <CrossModeCta />
          </>
        ) : null}
      </ContentReveal>
    </div>
  );
}
