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
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type GunaItem = { koota: string; score: number; max: number; note: string };

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
  { key: "family", label: "Family Values" },
  { key: "physical", label: "Lifestyle" },
  { key: "longevity", label: "Long-Term Stability" },
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
  const [view, setView] = useState("ai");
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
      setError("Choose someone to check compatibility with.");
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
      setError(json.error?.message || "Compatibility requires both kundli charts");
      return;
    }
    setActive(json.data.report);
    setView("ai");
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

  return (
    <div className="relative space-y-4 sm:space-y-5 md:space-y-6">
      <PageHeader
        className="mb-2 sm:mb-4"
        eyebrow="Compatibility"
        title="Who do you want to check?"
        description="Start with a person. See a clear score first — ask AI or open detailed Vedic analysis when you need it."
        actions={
          active?._id ? (
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={`${routes.compatibilityReport}?id=${active._id}`}>Open full report</Link>
            </Button>
          ) : null
        }
      />

      {!active ? (
        <GlassCard className="space-y-4 p-4 sm:p-6">
          <p className="font-medium">Select from your matches</p>
          {candidates.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.slice(0, 8).map((c) => (
                <button
                  key={c.userId}
                  type="button"
                  className={cn(
                    "border-border/50 hover:bg-muted/40 flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm",
                    candidateUserId === c.userId && "border-primary/40 bg-primary/5",
                  )}
                  onClick={() => setCandidateUserId(c.userId)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.photo ? (
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
              title="No recommended matches yet"
              description="Explore Matches first, or enter a member id below."
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
            {loading ? "Checking your compatibility…" : "Check Compatibility"}
          </Button>

          <button
            type="button"
            className="text-primary ml-3 text-sm font-medium hover:underline"
            onClick={() => setShowAdvancedId((v) => !v)}
          >
            {showAdvancedId ? "Hide advanced" : " Enter member id (advanced)"}
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
                placeholder="Candidate user id"
                className="w-full sm:flex-1"
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                Run
              </Button>
            </form>
          ) : null}

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </GlassCard>
      ) : null}

      {loading && !active ? (
        <GlassCard className="p-4 sm:p-6">
          <p className="font-display text-lg sm:text-xl">Checking your compatibility…</p>
          <p className="text-muted-foreground mt-2 text-sm">Calculated from both Vedic charts.</p>
        </GlassCard>
      ) : null}

      {active ? (
        <>
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

          {active.decisionReason ? (
            <GlassCard className="p-4 sm:p-6">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Why this score
              </p>
              <p className="mt-2 text-sm leading-relaxed">{active.decisionReason}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setActive(null)}
                >
                  Check someone else
                </Button>
                {/* <Button type="button" className="w-full sm:w-auto" onClick={() => setView("ai")}>
                  Ask AI about this match
                </Button> */}
              </div>
            </GlassCard>
          ) : (
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
                Ask AI about this match
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-3">
            {SIMPLE_BREAKDOWN.map(({ key, label }) => {
              const value = active.categoryScores?.[key];
              return (
                <GlassCard key={key} className="p-3 sm:p-4">
                  <p className="text-muted-foreground text-[9px] tracking-wide uppercase sm:text-[10px]">
                    {label}
                  </p>
                  <p className="font-display mt-1 text-2xl sm:text-3xl">
                    {value != null ? `${value}%` : "—"}
                  </p>
                  {value != null ? <Progress value={value} className="mt-2 h-1.5" /> : null}
                </GlassCard>
              );
            })}
            <GlassCard className="col-span-2 p-3 sm:col-span-1 sm:p-4 md:col-span-3 lg:col-span-1">
              <p className="text-muted-foreground text-[9px] tracking-wide uppercase sm:text-[10px]">
                Vedic Compatibility
              </p>
              <p className="font-display mt-1 text-2xl sm:text-3xl">
                {active.totalGuna}/{active.maxGuna ?? 36}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Guna Milan</p>
            </GlassCard>
          </div>

          {active.strengths?.length || active.challenges?.length ? (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <GlassCard className="p-4 sm:p-6">
                <p className="font-display text-base sm:text-lg">Top strengths</p>
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                  {(active.strengths || []).slice(0, 5).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard className="p-4 sm:p-6">
                <p className="font-display text-base sm:text-lg">Potential challenges</p>
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                  {(active.challenges || []).slice(0, 5).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ) : null}

          <Tabs value={view} onValueChange={setView} className="w-full">
            <div className="scrollbar-hidden -mx-1 mb-3 overflow-x-auto px-1 sm:mb-4">
              <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-1 bg-transparent p-0 sm:min-w-0 sm:flex-wrap">
                {(
                  [
                    ["ai", "AI Chat"],
                    ["deep", "Deep modules"],
                    ["shukra", "Shukra Milan"],
                    ["guna", "Ashta Koota"],
                    ["scores", "Scoreboard"],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-gold/15 shrink-0 rounded-full px-3 py-1.5 text-[11px] sm:text-xs"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="ai" className="mt-0 w-full">
              {partnerId ? (
                <CompatibilityAiChat candidateUserId={partnerId} partnerName={pair?.themName} />
              ) : (
                <GlassCard className="p-4 sm:p-6">
                  <p className="text-muted-foreground text-sm">
                    Select a partner to start the compatibility conversation.
                  </p>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="deep" className="mt-0 space-y-3">
              {(active.deepAnalysis?.modules || []).map((m) => (
                <GlassCard key={m.id} className="space-y-3 p-4 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-lg">{m.title}</h3>
                      <p className="text-muted-foreground text-[11px]">
                        Weight {m.weight}% · Confidence {m.confidence}
                      </p>
                    </div>
                    <p className="font-display text-xl sm:text-2xl">{m.score}%</p>
                  </div>
                  <Progress value={m.score} className="h-1.5" />
                  <p className="text-sm leading-relaxed">{m.observation}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{m.reasoning}</p>
                </GlassCard>
              ))}
              {!active.deepAnalysis?.modules?.length ? (
                <p className="text-muted-foreground text-sm">No deep modules on this report.</p>
              ) : null}
            </TabsContent>

            <TabsContent value="shukra" className="mt-0 space-y-3 sm:space-y-4">
              <GlassCard className="p-4 sm:p-6">
                <h3 className="font-display text-lg sm:text-xl">Venus Sign Matching</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {active.shukraMilan?.reasoning}
                </p>
              </GlassCard>
              <div className="grid gap-3 sm:grid-cols-2">
                {(active.shukraMilan?.interactions || []).map((i) => (
                  <GlassCard key={`${i.direction}-${i.venusSign}`} className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{i.direction}</Badge>
                      <p className="font-display text-xl sm:text-2xl">
                        {i.score}
                        <span className="text-muted-foreground text-sm">/10</span>
                      </p>
                    </div>
                    <p className="text-sm font-medium">Venus in {i.venusSign}</p>
                    <p className="text-muted-foreground text-xs">{i.reason}</p>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guna" className="mt-0">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
                {(active.gunaBreakdown || []).map((g) => (
                  <GlassCard key={g.koota} className="p-3 sm:p-4">
                    <p className="text-muted-foreground text-[9px] uppercase sm:text-[10px]">
                      {g.koota}
                    </p>
                    <p className="font-display text-rose mt-1 text-xl sm:text-2xl">
                      {g.score}
                      <span className="text-muted-foreground text-sm">/{g.max}</span>
                    </p>
                    <p className="text-muted-foreground mt-2 line-clamp-3 text-[11px] sm:text-xs">
                      {g.note}
                    </p>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scores" className="mt-0">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
                {categoryEntries.map(([key, value]) => (
                  <GlassCard key={key} className="p-3 sm:p-4">
                    <p className="text-muted-foreground text-[9px] tracking-wide uppercase sm:text-[10px]">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="font-display mt-1 text-2xl sm:text-3xl">{value}%</p>
                    <Progress value={value} className="mt-2 h-1.5" />
                  </GlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      <GlassCard className="p-4 sm:p-6">
        <p className="font-display text-lg sm:text-xl">Recent reports</p>
        <div className="mt-3 space-y-2 sm:mt-4">
          {reports.length === 0 ? (
            <EmptyState
              title="No compatibility reports yet"
              description="Pick someone from your matches to run your first check."
              action={
                <Button asChild className="w-full sm:w-auto">
                  <Link href={routes.matches}>Explore Matches</Link>
                </Button>
              }
            />
          ) : (
            reports.map((r) => (
              <button
                key={String(r._id)}
                type="button"
                className={cn(
                  "hover:bg-muted/40 border-border/40 flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm",
                  active?._id === r._id && "border-gold/40 bg-gold/5",
                )}
                onClick={() => {
                  setActive(r);
                  setView("ai");
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
                <span className="font-display shrink-0 text-base sm:text-lg">
                  {r.deepOverallScore ?? r.overallScore}%
                </span>
              </button>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
