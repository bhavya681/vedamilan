"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function CompatibilityPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [candidateUserId, setCandidateUserId] = useState("");
  const [active, setActive] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("deep");

  async function load() {
    const res = await fetch("/api/compatibility");
    const json = await res.json();
    if (json.success) setReports(json.data.reports || []);
    else setError(json.error?.message || "Failed to load");
  }

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("candidate");
    if (candidate) setCandidateUserId(candidate);
    void load().catch(() => setError("Failed to load compatibility"));
  }, []);

  async function runCompare(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Compatibility requires both kundli charts");
      return;
    }
    setActive(json.data.report);
    setView("deep");
    await load();
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

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility"
        description="Deep modular analysis with Shukra Milan (Venus) + classical Ashta Koota — rule engine scores, AI explains."
        actions={
          <Button asChild variant="secondary">
            <Link
              href={
                active?._id
                  ? `${routes.compatibilityReport}?id=${active._id}`
                  : routes.compatibilityReport
              }
            >
              Open report view
            </Link>
          </Button>
        }
      />

      <GlassCard className="max-w-xl space-y-3">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={runCompare}>
          <Input
            value={candidateUserId}
            onChange={(e) => setCandidateUserId(e.target.value)}
            placeholder="Candidate user id"
            required
          />
          <Button type="submit" disabled={loading} className="sm:min-w-[11rem]">
            {loading ? "Analyzing…" : "Run deep milan"}
          </Button>
        </form>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Calculates Ashta Koota, Shukra Milan (Venus-sign matching), personality, Moon, 7th, D9,
          family, intimacy, and longevity modules. Both profiles need kundli charts.
        </p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </GlassCard>

      {active ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard>
              <p className="text-muted-foreground text-xs uppercase">Deep overall</p>
              <p className="font-display text-gold mt-2 text-4xl">
                {active.deepOverallScore ?? active.overallScore}%
              </p>
              {active.decisionSummary ? (
                <Badge className="bg-primary/15 text-foreground hover:bg-primary/15 mt-3">
                  {active.decisionSummary}
                </Badge>
              ) : null}
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs uppercase">Shukra Milan</p>
              <p className="font-display mt-2 text-4xl">
                {active.shukraMilan?.averageScore ?? "—"}
                <span className="text-muted-foreground text-base">/10</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {active.shukraMilan?.percent ?? "—"}% Venus layer
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs uppercase">Ashta Koota</p>
              <p className="font-display mt-2 text-4xl">
                {active.totalGuna}/{active.maxGuna}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">Classical gunas</p>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs uppercase">Manglik</p>
              <p className="mt-2 text-sm leading-relaxed">{active.manglikCompatibility}</p>
            </GlassCard>
          </div>

          {active.decisionReason ? (
            <GlassCard>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">Decision note</p>
              <p className="mt-2 text-sm leading-relaxed">{active.decisionReason}</p>
            </GlassCard>
          ) : null}

          <Tabs value={view} onValueChange={setView}>
            <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {(
                [
                  ["deep", "Deep modules"],
                  ["shukra", "Shukra Milan"],
                  ["guna", "Ashta Koota"],
                  ["scores", "Scoreboard"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-gold/15 rounded-full px-3 py-1.5 text-xs"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="deep" className="mt-0 space-y-3">
              {(active.deepAnalysis?.modules || []).map((m) => (
                <GlassCard key={m.id} className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg">{m.title}</h3>
                      <p className="text-muted-foreground text-[11px]">
                        Weight {m.weight}% · Confidence {m.confidence} · Severity {m.severity}
                      </p>
                    </div>
                    <p className="font-display text-2xl">{m.score}%</p>
                  </div>
                  <Progress value={m.score} className="h-1.5" />
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        Observation
                      </p>
                      <p className="mt-1 leading-relaxed">{m.observation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        Reasoning
                      </p>
                      <p className="mt-1 leading-relaxed">{m.reasoning}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <ul className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        Positives
                      </p>
                      {m.positives.map((p) => (
                        <li key={p} className="text-foreground/90">
                          • {p}
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        Challenges
                      </p>
                      {m.challenges.map((p) => (
                        <li key={p} className="text-foreground/90">
                          • {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    <span className="text-foreground font-medium">Manifestation: </span>
                    {m.manifestation}
                  </p>
                </GlassCard>
              ))}

              {(active.deepAnalysis?.conflicts || []).length ? (
                <GlassCard className="space-y-3">
                  <h3 className="font-display text-xl">Conflict analysis</h3>
                  {active.deepAnalysis?.conflicts?.map((c) => (
                    <div key={c.topic} className="border-border/40 rounded-xl border p-3 text-sm">
                      <p className="font-medium">{c.topic}</p>
                      <p className="text-muted-foreground mt-1">{c.reason}</p>
                      <p className="mt-2 text-xs">
                        <span className="font-medium">Cause: </span>
                        {c.cause}
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="font-medium">Example: </span>
                        {c.example}
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="font-medium">Solution: </span>
                        {c.solution}
                      </p>
                    </div>
                  ))}
                </GlassCard>
              ) : null}

              {(active.deepAnalysis?.remedies || []).length ? (
                <GlassCard>
                  <h3 className="font-display text-xl">Practical remedies</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {active.deepAnalysis?.remedies?.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </GlassCard>
              ) : null}
            </TabsContent>

            <TabsContent value="shukra" className="mt-0 space-y-4">
              <GlassCard>
                <h3 className="font-display text-xl">Venus Sign Matching</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {active.shukraMilan?.reasoning}
                </p>
              </GlassCard>
              <div className="grid gap-3 md:grid-cols-2">
                {(active.shukraMilan?.interactions || []).map((i) => (
                  <GlassCard key={`${i.direction}-${i.venusSign}`} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{i.direction}</Badge>
                      <p className="font-display text-2xl">
                        {i.score}
                        <span className="text-muted-foreground text-sm">/10</span>
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      Venus in {i.venusSign}
                      {i.occupantPlanet ? ` → partner ${i.occupantPlanet}` : " → no major occupant"}
                    </p>
                    <p className="text-gold text-sm">{i.theme}</p>
                    <p className="text-muted-foreground text-xs">{i.marriageStyle}</p>
                    <p className="text-muted-foreground text-xs">{i.reason}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <ul>
                        {i.strengths.map((s) => (
                          <li key={s}>+ {s}</li>
                        ))}
                      </ul>
                      <ul>
                        {i.challenges.map((s) => (
                          <li key={s}>− {s}</li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guna" className="mt-0">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(active.gunaBreakdown || []).map((g) => (
                  <GlassCard key={g.koota}>
                    <p className="text-muted-foreground text-[10px] uppercase">{g.koota}</p>
                    <p className="font-display text-rose mt-1 text-2xl">
                      {g.score}
                      <span className="text-muted-foreground text-sm">/{g.max}</span>
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">{g.note}</p>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scores" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryEntries.map(([key, value]) => (
                  <GlassCard key={key}>
                    <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="font-display mt-1 text-3xl">{value}%</p>
                    <Progress value={value} className="mt-2 h-1.5" />
                  </GlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      <GlassCard>
        <p className="font-display text-xl">Recent reports</p>
        <div className="mt-4 space-y-2">
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports yet.</p>
          ) : (
            reports.map((r) => (
              <button
                key={String(r._id)}
                type="button"
                className={cn(
                  "hover:bg-muted/40 border-border/40 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
                  active?._id === r._id && "border-gold/40 bg-gold/5",
                )}
                onClick={() => {
                  setActive(r);
                  setView("deep");
                }}
              >
                <span className="min-w-0 truncate">
                  {r.userAId?.slice(0, 6)}… × {r.userBId?.slice(0, 6)}…
                  {r.decisionSummary ? (
                    <span className="text-muted-foreground"> · {r.decisionSummary}</span>
                  ) : null}
                </span>
                <span className="font-display shrink-0 text-lg">
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
