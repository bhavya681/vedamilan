"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompatibilityAiChat } from "@/features/compatibility/compatibility-ai-chat";
import { CompatibilityPairMood } from "@/features/compatibility/compatibility-pair-mood";
import {
  SoftEmoji,
  YoniEnergyCard,
  kootaEmoji,
  moodFromScore,
} from "@/features/compatibility/compatibility-visuals";
import {
  MarriageWindowsStrip,
  TimingPredictionPanel,
  type TimingPredictionView,
} from "@/features/compatibility/timing-prediction-panel";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type GunaItem = {
  koota: string;
  score: number;
  max: number;
  note: string;
  emoji?: string | null;
  visual?: string | null;
};

type Module = {
  id: string;
  title: string;
  weight: number;
  observation: string;
  reasoning: string;
  positives: string[];
  challenges: string[];
  manifestation: string;
  severity: string;
  score: number;
  confidence: string;
};

type VenusInteraction = {
  direction: string;
  venusSign: string;
  occupantPlanet: string | null;
  theme: string;
  marriageStyle: string;
  strengths: string[];
  challenges: string[];
  score: number;
  confidence: string;
  reason: string;
};

type Report = {
  _id?: string;
  totalGuna?: number;
  maxGuna?: number;
  overallScore?: number;
  deepOverallScore?: number;
  decisionSummary?: string;
  decisionReason?: string;
  manglikCompatibility?: string;
  gunaBreakdown?: GunaItem[];
  strengths?: string[];
  challenges?: string[];
  userAId?: string;
  userBId?: string;
  calculatedAt?: string;
  shukraMilan?: {
    averageScore?: number;
    percent?: number;
    observation?: string;
    reasoning?: string;
    interactions?: VenusInteraction[];
    positives?: string[];
    challenges?: string[];
  };
  deepAnalysis?: {
    chartValidation?: Record<string, string>;
    modules?: Module[];
    conflicts?: Array<{
      topic: string;
      reason: string;
      cause: string;
      example: string;
      solution: string;
    }>;
    remedies?: string[];
  };
  categoryScores?: Record<string, number>;
  marriageWindows?: Array<{ label: string; window: string; reason: string; score: number }>;
  timingPrediction?: TimingPredictionView | null;
};

type RecMatch = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  photo: string | null;
  compatibilityScore: number;
};

type PairInfo = {
  youName: string;
  youPhoto: string | null;
  themName: string;
  themPhoto: string | null;
  themId: string;
};

const SIMPLE_BREAKDOWN: Array<{ key: string; label: string }> = [
  { key: "emotional", label: "Emotional" },
  { key: "communication", label: "Communication" },
  { key: "family", label: "Shared values" },
  { key: "physical", label: "Lifestyle" },
  { key: "longevity", label: "Long-term" },
];

export default function CompatibilityPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [candidates, setCandidates] = useState<RecMatch[]>([]);
  const [candidateUserId, setCandidateUserId] = useState("");
  const [active, setActive] = useState<Report | null>(null);
  const [pair, setPair] = useState<PairInfo | null>(null);
  const [selfUserId, setSelfUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("why");
  const [showAdvancedId, setShowAdvancedId] = useState(false);

  async function loadReports() {
    const res = await fetch("/api/compatibility");
    const json = await res.json();
    if (json.success) setReports(json.data.reports || []);
    else setError(json.error?.message || "Failed to load");
  }

  async function loadPair(themId: string) {
    const [meRes, themRes] = await Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch(`/api/matches/${themId}`).then((r) => r.json()),
    ]);
    const me = meRes.success ? meRes.data : null;
    const selfId = me?.user?.id || null;
    setSelfUserId(selfId);
    const photos = me?.profile?.photos || [];
    const primary =
      photos.find((p: { isPrimary?: boolean }) => p.isPrimary)?.secureUrl ||
      photos[0]?.secureUrl ||
      null;
    const them = themRes.success ? themRes.data?.profile : null;
    const fromList = candidates.find((c) => c.userId === themId);
    const themPhotos = them?.photos || [];
    const themPhoto =
      themPhotos.find((p: { isPrimary?: boolean; secureUrl?: string }) => p.isPrimary)?.secureUrl ||
      themPhotos[0]?.secureUrl ||
      them?.photo ||
      fromList?.photo ||
      null;
    setPair({
      youName: me?.user?.name || "You",
      youPhoto: primary,
      themName: them?.name || fromList?.name || "Partner",
      themPhoto,
      themId,
    });
  }

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("candidate");
    if (candidate) setCandidateUserId(candidate);
    void loadReports().catch(() => setError("Failed to load compatibility"));
    void fetch("/api/recommendations")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCandidates(json.data?.data || []);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!active) {
      setPair(null);
      return;
    }
    const themId =
      candidateUserId ||
      (selfUserId && active.userAId === selfUserId ? active.userBId : active.userAId) ||
      active.userBId ||
      active.userAId ||
      "";
    if (themId) void loadPair(themId).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?._id, candidateUserId, selfUserId]);

  async function runCompare(id?: string) {
    const target = (id || candidateUserId).trim();
    if (!target) {
      setError("Choose someone to explore compatibility with.");
      return;
    }
    setCandidateUserId(target);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId: target }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Compatibility needs both Vedic charts");
      return;
    }
    setActive(json.data.report);
    setView("why");
    await loadReports();
  }

  const categoryEntries = active?.categoryScores
    ? Object.entries(active.categoryScores).filter(([k]) =>
        [
          "emotional",
          "physical",
          "mental",
          "family",
          "communication",
          "shukraMilan",
          "ashtaKoota",
          "longevity",
          "spiritual",
          "trust",
        ].includes(k),
      )
    : [];

  const overall = active?.deepOverallScore ?? active?.overallScore ?? 0;
  const partnerId = pair?.themId || candidateUserId;
  const whyPoints = [
    ...(active?.strengths || []).slice(0, 3),
    ...(active?.decisionReason ? [active.decisionReason] : []),
  ].slice(0, 5);

  return (
    <div className="relative space-y-6 sm:space-y-8">
      <PageHeader
        title={active ? "Explore this connection" : "Explore compatibility"}
        description={
          active
            ? "Emotion first, then meaning, then the deeper Vedic evidence."
            : "Choose someone meaningful. See how you may align before diving into charts."
        }
        actions={
          active?._id ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`${routes.compatibilityReport}?id=${active._id}`}>Full report</Link>
            </Button>
          ) : null
        }
      />

      {!active ? (
        <div className="border-border/70 bg-card shadow-soft space-y-5 rounded-2xl border p-4 sm:p-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl">Who would you like to understand?</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Start with someone from your matches.
            </p>
          </div>
          {candidates.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.slice(0, 8).map((c) => (
                <button
                  key={c.userId}
                  type="button"
                  className={cn(
                    "border-border/60 hover:bg-muted/40 flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm",
                    candidateUserId === c.userId && "border-primary/40 bg-primary/5",
                  )}
                  onClick={() => setCandidateUserId(c.userId)}
                >
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photo}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {c.name}
                      {c.age ? `, ${c.age}` : ""}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {c.city || "—"} · {c.compatibilityScore}% preview
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your compatibility journey starts here"
              description="Explore Matches first to find people worth understanding more deeply."
              action={
                <Button asChild className="w-full sm:w-auto">
                  <Link href={routes.matches}>Explore Matches</Link>
                </Button>
              }
            />
          )}

          <Button
            type="button"
            disabled={loading || !candidateUserId}
            onClick={() => void runCompare()}
            className="w-full sm:w-auto"
          >
            {loading ? "Preparing your compatibility insight…" : "Understand this connection"}
          </Button>

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground ml-2 text-sm hover:underline"
            onClick={() => setShowAdvancedId((v) => !v)}
          >
            {showAdvancedId ? "Hide profile id" : "Enter a profile id"}
          </button>

          {showAdvancedId ? (
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(e) => {
                e.preventDefault();
                void runCompare();
              }}
            >
              <Input
                value={candidateUserId}
                onChange={(e) => setCandidateUserId(e.target.value)}
                placeholder="Profile id"
                className="w-full sm:flex-1"
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                Continue
              </Button>
            </form>
          ) : null}

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
      ) : null}

      {loading && !active ? (
        <div className="border-border/70 bg-card shadow-soft rounded-2xl border p-6">
          <p className="font-display text-xl">Aligning your charts…</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Calculating planetary positions and relationship patterns.
          </p>
        </div>
      ) : null}

      {active ? (
        <>
          {/* Emotion */}
          <CompatibilityPairMood
            you={{ name: pair?.youName || "You", photo: pair?.youPhoto, label: "You" }}
            them={{
              name: pair?.themName || "Partner",
              photo: pair?.themPhoto,
              label: "Partner",
            }}
            score={overall}
            decisionSummary={active.decisionSummary}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setActive(null)}
            >
              Check someone else
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={() => setView("ai")}>
              Ask AI Guru
            </Button>
          </div>

          {/* Meaning */}
          {whyPoints.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl">Why this connection stands out</h2>
              <ul className="border-border/70 bg-card divide-border/60 shadow-soft divide-y rounded-2xl border">
                {whyPoints.map((point) => (
                  <li key={point} className="px-4 py-3.5 text-sm leading-relaxed sm:px-5">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Yoni animal energy */}
          {(() => {
            const yoni = active.gunaBreakdown?.find((g) => g.koota === "Yoni");
            if (!yoni) return null;
            return (
              <YoniEnergyCard
                visual={yoni.visual}
                emoji={yoni.emoji}
                note={yoni.note}
                score={yoni.score}
                max={yoni.max}
              />
            );
          })()}

          {/* Evidence — compact dimensions */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-2xl">Compatibility dimensions</h2>
              <p className="text-muted-foreground text-sm">
                Guna Milan {active.totalGuna}/{active.maxGuna ?? 36}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {SIMPLE_BREAKDOWN.map(({ key, label }) => {
                const value = active.categoryScores?.[key];
                const mood = value != null ? moodFromScore(value) : null;
                return (
                  <div
                    key={key}
                    className="border-border/60 bg-card rounded-xl border px-3 py-3 sm:px-4"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-muted-foreground text-xs">{label}</p>
                      {mood ? <SoftEmoji emoji={mood.emoji} size="sm" pulse={false} /> : null}
                    </div>
                    <p className="font-display mt-1 text-2xl">
                      {value != null ? `${value}%` : "—"}
                    </p>
                    {value != null ? <Progress value={value} className="mt-2 h-1" /> : null}
                  </div>
                );
              })}
              <div className="border-border/60 bg-card col-span-2 rounded-xl border px-3 py-3 sm:col-span-1 sm:px-4 md:col-span-3 lg:col-span-1">
                <p className="text-muted-foreground text-xs">Vedic</p>
                <p className="font-display mt-1 text-2xl">
                  {active.totalGuna}/{active.maxGuna ?? 36}
                </p>
              </div>
            </div>
          </section>

          {(active.challenges?.length ?? 0) > 0 ? (
            <section className="space-y-2">
              <h2 className="font-display text-xl">Areas to explore honestly</h2>
              <ul className="text-muted-foreground space-y-1 text-sm">
                {(active.challenges || []).slice(0, 4).map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {active.timingPrediction?.bestMarriageWindows?.length ? (
            <MarriageWindowsStrip
              windows={active.timingPrediction.bestMarriageWindows}
              onOpenTiming={() => setView("timing")}
            />
          ) : null}

          {active.timingPrediction ? (
            <button
              type="button"
              onClick={() => setView("timing")}
              className="border-border/70 bg-card hover:bg-muted/30 shadow-soft flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors sm:px-5"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Mahadasha · Gochar timing
                </p>
                <p className="font-display text-lg sm:text-xl">
                  {active.timingPrediction.marryNowTitle}
                </p>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {active.timingPrediction.marryNowReason}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <SoftEmoji
                  emoji={
                    active.timingPrediction.marryNowVerdict === "FAVORABLE"
                      ? "✨"
                      : active.timingPrediction.marryNowVerdict === "SUPPORTIVE"
                        ? "🌞"
                        : active.timingPrediction.marryNowVerdict === "CAUTIOUS"
                          ? "🕯️"
                          : active.timingPrediction.marryNowVerdict === "UNFAVORABLE"
                            ? "🌧️"
                            : "🌿"
                  }
                  size="lg"
                />
                <p className="font-display text-xl">
                  {active.timingPrediction.marryNowScore ?? "—"}
                </p>
              </div>
            </button>
          ) : null}

          {/* Deep analysis */}
          <Tabs value={view} onValueChange={setView} className="w-full">
            <div className="scrollbar-hidden -mx-1 mb-4 overflow-x-auto px-1">
              <TabsList className="bg-muted/50 inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-1 rounded-xl p-1 sm:min-w-0">
                {(
                  [
                    ["why", "Overview"],
                    ["timing", "Timing"],
                    ["ai", "AI Guru"],
                    ["deep", "Deep modules"],
                    ["shukra", "Shukra Milan"],
                    ["guna", "Ashta Koota"],
                    ["scores", "All scores"],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-card data-[state=active]:shadow-soft shrink-0 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="why" className="mt-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                The score above is a multi-module bond (personality, Moon, Shukra, 7th, D9, Ashta
                Koota, and more) — never a single koota. Open Timing for Mahadasha + Gochar marriage
                windows, or AI Guru for a guided reading.
              </p>
            </TabsContent>

            <TabsContent value="timing" className="mt-0">
              <TimingPredictionPanel timing={active.timingPrediction} pairMode />
            </TabsContent>

            <TabsContent value="ai" className="mt-0 w-full">
              {partnerId ? (
                <CompatibilityAiChat candidateUserId={partnerId} partnerName={pair?.themName} />
              ) : (
                <GlassCard>
                  <p className="text-muted-foreground text-sm">
                    Select a partner to start the conversation.
                  </p>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="deep" className="mt-0 space-y-3">
              {(active.deepAnalysis?.modules || []).map((m) => (
                <div
                  key={m.id}
                  className="border-border/70 bg-card shadow-soft space-y-3 rounded-2xl border p-4 sm:p-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg">{m.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        Weight {m.weight}% · Confidence {m.confidence}
                      </p>
                    </div>
                    <p className="font-display text-2xl">{m.score}%</p>
                  </div>
                  <Progress value={m.score} className="h-1.5" />
                  <p className="text-sm leading-relaxed">{m.observation}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{m.reasoning}</p>
                </div>
              ))}
              {!active.deepAnalysis?.modules?.length ? (
                <p className="text-muted-foreground text-sm">No deep modules on this report.</p>
              ) : null}
            </TabsContent>

            <TabsContent value="shukra" className="mt-0 space-y-4">
              <div className="border-border/70 bg-card shadow-soft rounded-2xl border p-4 sm:p-6">
                <h3 className="font-display text-xl">Venus Sign Matching</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {active.shukraMilan?.reasoning}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(active.shukraMilan?.interactions || []).map((i) => (
                  <div
                    key={`${i.direction}-${i.venusSign}`}
                    className="border-border/60 bg-card space-y-2 rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{i.direction}</Badge>
                      <p className="font-display text-xl">
                        {i.score}
                        <span className="text-muted-foreground text-sm">/10</span>
                      </p>
                    </div>
                    <p className="text-sm font-medium">Venus in {i.venusSign}</p>
                    <p className="text-muted-foreground text-xs">{i.reason}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guna" className="mt-0 space-y-4">
              {(() => {
                const yoni = active.gunaBreakdown?.find((g) => g.koota === "Yoni");
                return yoni ? (
                  <YoniEnergyCard
                    visual={yoni.visual}
                    emoji={yoni.emoji}
                    note={yoni.note}
                    score={yoni.score}
                    max={yoni.max}
                  />
                ) : null;
              })()}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(active.gunaBreakdown || []).map((g) => (
                  <div
                    key={g.koota}
                    className="border-border/60 bg-card group rounded-xl border p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-muted-foreground text-xs">{g.koota}</p>
                      <SoftEmoji emoji={kootaEmoji(g.koota, g.emoji)} size="sm" />
                    </div>
                    <p className="font-display mt-1 text-2xl">
                      {g.score}
                      <span className="text-muted-foreground text-sm">/{g.max}</span>
                    </p>
                    {g.visual && g.koota !== "Yoni" ? (
                      <p className="text-foreground/80 mt-1.5 text-[11px] font-medium">
                        {g.visual}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground mt-2 line-clamp-3 text-xs">{g.note}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scores" className="mt-0">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {categoryEntries.map(([key, value]) => (
                  <div key={key} className="border-border/60 bg-card rounded-xl border p-4">
                    <p className="text-muted-foreground text-xs capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="font-display mt-1 text-2xl">{value}%</p>
                    <Progress value={value} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-xl sm:text-2xl">Recent reports</h2>
        <div className="border-border/70 bg-card divide-border/60 shadow-soft divide-y overflow-hidden rounded-2xl border">
          {reports.length === 0 ? (
            <div className="px-4 py-10">
              <EmptyState
                title="No reports yet"
                description="Pick someone from your matches to run your first compatibility check."
                action={
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={routes.matches}>Explore Matches</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            reports.map((r) => (
              <button
                key={String(r._id)}
                type="button"
                className={cn(
                  "hover:bg-muted/30 flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm",
                  active?._id === r._id && "bg-primary/5",
                )}
                onClick={() => {
                  setActive(r);
                  setView("why");
                  const them =
                    selfUserId && r.userAId === selfUserId ? r.userBId : r.userAId || r.userBId;
                  if (them) setCandidateUserId(them);
                }}
              >
                <span className="min-w-0 flex-1 truncate">
                  {r.decisionSummary || "Compatibility report"}
                  {r.calculatedAt ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {new Date(r.calculatedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </span>
                <span className="font-display shrink-0 text-lg">
                  {r.deepOverallScore ?? r.overallScore}%
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
