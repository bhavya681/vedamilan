"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Compass,
  HeartHandshake,
  Lock,
  MessageCircle,
  Route,
  Share2,
  Sparkles,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SoftPill } from "@/features/profile/components/professional-profile";
import { useT } from "@/components/i18n/i18n-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type SpacePayload = {
  partner: {
    userId: string;
    name: string;
    city?: string | null;
    profession?: string | null;
    photo?: string | null;
  };
  me: { userId: string; name: string; photo?: string | null };
  lifePathCategories: Array<{ key: string; label: string; options: string[] }>;
  myLifePath: Record<string, string | null>;
  lifePathAlignment: {
    labelCopy: string;
    summary: string;
    rows: Array<{
      key: string;
      label: string;
      you: string | null;
      partner: string | null;
      status: "ALIGN" | "DIFFER" | "MISSING";
    }>;
    whereYouAlign: string[];
    whereYouDiffer: string[];
    worthDiscussing: string[];
  };
  discovery: {
    vedic: {
      overallScore: number | null;
      decisionSummary: string | null;
      totalGuna: number | null;
      maxGuna: number;
      strengths: string[];
      challenges: string[];
    } | null;
    whereYouAlign: string[];
    whereYouDiffer: string[];
    worthDiscussing: string[];
  };
  journey: {
    stages: Array<{
      id: string;
      title: string;
      description: string;
      prompts: string[];
      explored: boolean;
    }>;
    exploredCount: number;
    totalStages: number;
  };
  whatIfScenarios: Array<{ id: string; title: string; prompt: string }>;
  privateNotes: Array<{ id: string; body: string; updatedAt?: string }>;
  sharedInsights: Array<{ id: string; title: string; body: string; category: string }>;
  sharedQuestions: Array<{
    id: string;
    question: string;
    answers: Array<{
      userId: string;
      body: string | null;
      revealed: boolean;
      isMine: boolean;
      hidden?: boolean;
    }>;
  }>;
  questionBank: string[];
  milestones: Array<{ id: string; label: string; milestoneType: string; occurredOn?: string }>;
  milestoneTypes: Array<{ id: string; label: string }>;
  disclaimer: string;
};

type WhatIfResult = {
  title: string;
  prompt: string;
  alignmentLabelCopy: string;
  sources: string[];
  alignmentPoints: string[];
  frictionPoints: string[];
  discussionQuestions: string[];
  reflection: string;
};

function PersonChip({ name, photo }: { name: string; photo?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted relative h-9 w-9 overflow-hidden rounded-full">
        {photo ? (
          <Image src={photo} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="bg-brand-dual-soft absolute inset-0" />
        )}
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

export function YourConnectionSpace({ partnerUserId }: { partnerUserId: string }) {
  const t = useT();
  const [space, setSpace] = useState<SpacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [lifePathDraft, setLifePathDraft] = useState<Record<string, string>>({});
  const [whatIf, setWhatIf] = useState<WhatIfResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/relationship-journey?partnerUserId=${encodeURIComponent(partnerUserId)}`,
      );
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Could not open Your Connection");
        setSpace(null);
        return;
      }
      setSpace(json.data);
      const draft: Record<string, string> = {};
      for (const [k, v] of Object.entries(json.data.myLifePath || {})) {
        if (typeof v === "string") draft[k] = v;
      }
      setLifePathDraft(draft);
    } catch {
      setError("Could not open Your Connection");
    } finally {
      setLoading(false);
    }
  }, [partnerUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/relationship-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Action failed");
        return null;
      }
      return json.data;
    } catch {
      setError("Connection issue — try again");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveLifePath(e: FormEvent) {
    e.preventDefault();
    const data = await postAction({ action: "upsertLifePath", answers: lifePathDraft });
    if (data) await load();
  }

  async function addNote(e: FormEvent) {
    e.preventDefault();
    const data = await postAction({
      action: "createNote",
      partnerUserId,
      body: noteDraft,
    });
    if (data) {
      setNoteDraft("");
      await load();
    }
  }

  async function exploreScenario(scenarioId: string) {
    setActiveScenario(scenarioId);
    const data = await postAction({
      action: "exploreWhatIf",
      partnerUserId,
      scenarioId,
    });
    if (data) setWhatIf(data as WhatIfResult);
  }

  const overviewAlign = useMemo(() => space?.discovery.whereYouAlign || [], [space]);
  const overviewDiffer = useMemo(() => space?.discovery.whereYouDiffer || [], [space]);

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="skeleton-shimmer mx-auto h-4 w-48 rounded-full" />
        <div className="skeleton-shimmer mx-auto h-4 w-72 max-w-full rounded-full" />
      </div>
    );
  }

  if (error && !space) {
    return (
      <EmptyState
        title="Your Connection isn’t available yet"
        description={error}
        action={
          <Button asChild>
            <Link href={routes.connections}>Back to Connections</Link>
          </Button>
        }
      />
    );
  }

  if (!space) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("pages.yourConnectionTitle")}
        description={`${t("relationship.yourConnectionDescription")} — ${space.partner.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`${routes.chat}?with=${space.partner.userId}`}>
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Continue chat
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`${routes.matchProfile}?id=${space.partner.userId}`}>View profile</Link>
            </Button>
          </div>
        }
      />

      <GlassCard className="!p-4 sm:!p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <PersonChip name={space.me.name} photo={space.me.photo} />
            <HeartHandshake className="text-gold h-5 w-5" />
            <PersonChip name={space.partner.name} photo={space.partner.photo} />
          </div>
          <SoftPill tone="gold">{space.lifePathAlignment.labelCopy}</SoftPill>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">{space.lifePathAlignment.summary}</p>
      </GlassCard>

      {error ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="scrollbar-hidden border-border/50 bg-card/70 flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-2xl border p-1">
          {(
            [
              ["overview", t("relationship.ourCompatibility")],
              ["life-path", t("relationship.lifePath")],
              ["journey", t("relationship.getToKnow")],
              ["what-if", t("relationship.whatIf")],
              ["notes", t("relationship.privateNotes")],
              ["shared", t("relationship.shared")],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="shrink-0 rounded-xl px-3 py-2 text-xs sm:text-sm"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                Where you align
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {overviewAlign.length ? (
                  overviewAlign.map((item) => <li key={item}>• {item}</li>)
                ) : (
                  <li className="text-muted-foreground">Complete Life Path to see more.</li>
                )}
              </ul>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                Where you differ
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {overviewDiffer.length ? (
                  overviewDiffer.map((item) => <li key={item}>• {item}</li>)
                ) : (
                  <li className="text-muted-foreground">No strong differences flagged yet.</li>
                )}
              </ul>
            </GlassCard>
            <GlassCard>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                Worth discussing
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {(space.discovery.worthDiscussing || []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              {space.discovery.vedic ? (
                <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                  Vedic compatibility summary:{" "}
                  {space.discovery.vedic.decisionSummary || "Available"}
                  {space.discovery.vedic.overallScore != null
                    ? ` · ${space.discovery.vedic.overallScore}% deep score`
                    : ""}
                  {space.discovery.vedic.totalGuna != null
                    ? ` · Guna ${space.discovery.vedic.totalGuna}/${space.discovery.vedic.maxGuna}`
                    : ""}
                </p>
              ) : (
                <p className="text-muted-foreground mt-4 text-xs">
                  Run Compatibility once to include Vedic summary here.
                </p>
              )}
            </GlassCard>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy || !overviewAlign[0]}
              onClick={() =>
                void postAction({
                  action: "shareInsight",
                  partnerUserId,
                  title: "A strength we share",
                  body: overviewAlign[0] || "",
                  category: "ALIGN",
                  source: "LIFE_PATH",
                }).then((d) => d && load())
              }
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Share an alignment insight
            </Button>
            <p className="text-muted-foreground self-center text-xs">
              Nothing is shared unless you choose to share it.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="life-path" className="space-y-4">
          <GlassCard>
            <div className="flex items-start gap-3">
              <Route className="text-gold mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-display text-xl">Life Path Alignment</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Practical future expectations — separate from kundli scores. Update your answers
                  anytime.
                </p>
              </div>
            </div>
          </GlassCard>

          <form onSubmit={saveLifePath} className="grid gap-3 sm:grid-cols-2">
            {space.lifePathCategories.map((cat) => (
              <label key={cat.key} className="block text-sm">
                <span className="mb-1.5 block font-medium">{cat.label}</span>
                <select
                  className="border-input bg-background w-full rounded-xl border px-3 py-2"
                  value={lifePathDraft[cat.key] || ""}
                  onChange={(e) =>
                    setLifePathDraft((prev) => ({ ...prev, [cat.key]: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {cat.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                Save my Life Path
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {space.lifePathAlignment.rows.map((row) => (
              <div
                key={row.key}
                className={cn(
                  "border-border/60 grid gap-2 rounded-2xl border px-4 py-3 sm:grid-cols-[8rem_1fr_1fr_6rem]",
                  row.status === "ALIGN" && "bg-emerald/5",
                  row.status === "DIFFER" && "bg-gold/5",
                )}
              >
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-muted-foreground text-sm">You: {row.you || "—"}</p>
                <p className="text-muted-foreground text-sm">
                  {space.partner.name}: {row.partner || "—"}
                </p>
                <p className="text-xs font-semibold tracking-wide uppercase">
                  {row.status === "ALIGN" ? "Align" : row.status === "DIFFER" ? "Differ" : "Open"}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <GlassCard>
            <p className="text-sm">
              {space.journey.exploredCount} of {space.journey.totalStages} stages explored — skip
              freely, return anytime.
            </p>
          </GlassCard>
          {space.journey.stages.map((stage) => (
            <GlassCard key={stage.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg">{stage.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{stage.description}</p>
                </div>
                <SoftPill tone={stage.explored ? "success" : "default"}>
                  {stage.explored ? "Explored" : "Optional"}
                </SoftPill>
              </div>
              <ul className="space-y-2 text-sm">
                {stage.prompts.map((p) => (
                  <li
                    key={p}
                    className="border-border/50 rounded-xl border border-dashed px-3 py-2"
                  >
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy || stage.explored}
                onClick={() =>
                  void postAction({
                    action: "markJourneyStage",
                    partnerUserId,
                    stageId: stage.id,
                  }).then((d) => d && load())
                }
              >
                Mark as explored
              </Button>
            </GlassCard>
          ))}
        </TabsContent>

        <TabsContent value="what-if" className="space-y-4">
          <GlassCard>
            <div className="flex items-start gap-3">
              <Compass className="text-gold mt-0.5 h-5 w-5" />
              <div>
                <h3 className="font-display text-xl">Life Scenario Explorer</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Reflective What-Ifs from your Life Path and compatibility context — not
                  predictions or guarantees.
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
            <div className="space-y-2">
              {space.whatIfScenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void exploreScenario(s.id)}
                  className={cn(
                    "border-border/60 hover:border-gold/40 w-full rounded-2xl border px-4 py-3 text-left transition",
                    activeScenario === s.id && "border-gold/50 bg-gold/5",
                  )}
                >
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{s.prompt}</p>
                </button>
              ))}
            </div>

            <GlassCard className="min-h-[16rem] space-y-4">
              {whatIf ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-xl">{whatIf.title}</h3>
                    <SoftPill tone="gold">{whatIf.alignmentLabelCopy}</SoftPill>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Based on: {whatIf.sources.join(" · ")}
                  </p>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase">Alignment</p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {whatIf.alignmentPoints.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase">
                      Considerations
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {whatIf.frictionPoints.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase">
                      Questions worth discussing
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {whatIf.discussionQuestions.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{whatIf.reflection}</p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Choose a scenario to explore a calm, reflective reading.
                </p>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <GlassCard>
            <div className="flex items-start gap-3">
              <Lock className="text-gold mt-0.5 h-5 w-5" />
              <div>
                <h3 className="font-display text-xl">Private notes</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Only you can see these notes. They are never shared with {space.partner.name}, AI,
                  or recommendations.
                </p>
              </div>
            </div>
          </GlassCard>
          <form onSubmit={addNote} className="space-y-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="A private thought about this connection…"
              className="border-input bg-background w-full rounded-2xl border px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={busy || !noteDraft.trim()}>
              Save private note
            </Button>
          </form>
          <div className="space-y-2">
            {space.privateNotes.length ? (
              space.privateNotes.map((n) => (
                <div key={n.id} className="border-border/60 rounded-2xl border px-4 py-3 text-sm">
                  <p>{n.body}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        void fetch(`/api/relationship-journey?noteId=${encodeURIComponent(n.id)}`, {
                          method: "DELETE",
                        }).then(() => load())
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Keep a private thought about this connection.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <GlassCard className="space-y-3">
            <h3 className="font-display text-lg">Shared insights</h3>
            {space.sharedInsights.length ? (
              space.sharedInsights.map((i) => (
                <div key={i.id} className="border-border/50 rounded-xl border px-3 py-2 text-sm">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-muted-foreground mt-1">{i.body}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Share something meaningful when you’re ready.
              </p>
            )}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h3 className="font-display text-lg">Shared questions</h3>
            <div className="flex flex-wrap gap-2">
              {space.questionBank.map((q) => (
                <Button
                  key={q}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void postAction({
                      action: "createSharedQuestion",
                      partnerUserId,
                      question: q,
                    }).then((d) => d && load())
                  }
                >
                  Add: {q.slice(0, 42)}…
                </Button>
              ))}
            </div>
            {space.sharedQuestions.map((q) => (
              <div key={q.id} className="border-border/50 space-y-2 rounded-xl border px-3 py-3">
                <p className="text-sm font-medium">{q.question}</p>
                {q.answers.map((a) => (
                  <p key={`${q.id}-${a.userId}`} className="text-muted-foreground text-xs">
                    {a.isMine ? "You" : space.partner.name}:{" "}
                    {a.hidden ? "Answered (not revealed yet)" : a.body}
                  </p>
                ))}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="border-input bg-background flex-1 rounded-xl border px-3 py-2 text-sm"
                    placeholder="Your private answer…"
                    value={answerDrafts[q.id] || ""}
                    onChange={(e) =>
                      setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy || !(answerDrafts[q.id] || "").trim()}
                    onClick={() =>
                      void postAction({
                        action: "answerSharedQuestion",
                        partnerUserId,
                        questionId: q.id,
                        body: answerDrafts[q.id],
                        reveal: false,
                      }).then((d) => d && load())
                    }
                  >
                    Save private
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy || !(answerDrafts[q.id] || "").trim()}
                    onClick={() =>
                      void postAction({
                        action: "answerSharedQuestion",
                        partnerUserId,
                        questionId: q.id,
                        body: answerDrafts[q.id],
                        reveal: true,
                      }).then((d) => d && load())
                    }
                  >
                    Reveal to partner
                  </Button>
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h3 className="font-display text-lg">Milestones</h3>
            <p className="text-muted-foreground text-xs">
              Optional — only what you both choose to mark.
            </p>
            <div className="flex flex-wrap gap-2">
              {space.milestoneTypes.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void postAction({
                      action: "setMilestone",
                      partnerUserId,
                      milestoneType: m.id,
                    }).then((d) => d && load())
                  }
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  {m.label}
                </Button>
              ))}
            </div>
            <ul className="space-y-1 text-sm">
              {space.milestones.map((m) => (
                <li key={m.id}>• {m.label}</li>
              ))}
            </ul>
          </GlassCard>
        </TabsContent>
      </Tabs>

      <p className="text-muted-foreground text-[11px] leading-relaxed">{space.disclaimer}</p>
    </div>
  );
}
