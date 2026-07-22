"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Stars } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/ui/premium-cards";
import { SoftEmoji, moodFromScore } from "@/features/compatibility/compatibility-visuals";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

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

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [loading, setLoading] = useState(true);

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
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const firstName = bundle?.userName?.split(" ")[0] ?? "friend";

  if (loading && !bundle) {
    return (
      <div className="space-y-6 py-8">
        <p className="text-muted-foreground text-sm">Preparing your home…</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 sm:space-y-10">
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-40 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_12%,transparent),transparent_70%)]" />

      <PageHeader
        title={`${greeting}, ${firstName}`}
        description="Personalized connections based on your profile and Vedic chart."
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
          <motion.section
            className="border-border/70 from-card via-card to-gold/5 shadow-soft grid gap-4 rounded-2xl border bg-gradient-to-br p-5 sm:grid-cols-3 sm:p-6"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
          </motion.section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">People to consider</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Opposite-gender matches ranked by multi-factor Vedic compatibility.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.matches}>See all</Link>
              </Button>
            </div>
            {bundle.matches.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {bundle.matches.map((m, index) => {
                  const mood = moodFromScore(m.compatibilityScore);
                  return (
                    <motion.div
                      key={m.userId}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.05 * index }}
                      className="space-y-2"
                    >
                      <MatchCard
                        name={m.name}
                        age={m.age ?? 0}
                        city={m.city || "—"}
                        profession={m.profession || "—"}
                        score={m.compatibilityScore}
                        headline={
                          m.reasons?.[0] || m.cardSummary || m.headline || "Explore this connection"
                        }
                        photo={m.photo || undefined}
                        href={`${routes.matchProfile}?id=${m.userId}`}
                      />
                      <p className="text-muted-foreground flex items-center gap-1.5 px-1 text-xs">
                        <SoftEmoji emoji={mood.emoji} size="sm" pulse={false} />
                        {mood.title}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Finding meaningful connections"
                description="Your chart is ready — check back as more aligned members appear."
                action={
                  <Button asChild>
                    <Link href={routes.search}>Explore Search</Link>
                  </Button>
                }
              />
            )}
          </section>

          {bundle.insight ? (
            <section
              className={cn(
                "border-border/70 bg-card shadow-soft relative overflow-hidden rounded-2xl border p-5 sm:p-6",
              )}
            >
              <div className="pointer-events-none absolute -top-4 -right-4 opacity-[0.12]">
                <SoftEmoji emoji="✨" size="xl" />
              </div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Compatibility insight
              </p>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{bundle.insight}</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={routes.aiInsights}>Ask AI Guru</Link>
              </Button>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
