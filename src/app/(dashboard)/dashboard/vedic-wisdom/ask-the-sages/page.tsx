"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { listWisdomGuides } from "@/domain/wisdom/guides";
import { LIFE_NEEDS, type LifeNeedId } from "@/domain/wisdom/sage-alignment";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const DEFAULT_IDS = ["krishna", "vidura", "chanakya"];

const NEED_QUESTION: Record<LifeNeedId, string> = {
  relationship: "How should I choose between love and family expectations?",
  career: "How do I take the next step in my work without losing integrity?",
  inner: "How do I settle this unrest without running from it?",
  duty: "What is truly my duty here, and what is only pressure?",
  inquiry: "What is worth examining in myself before I act?",
  astrology: "How should I sit with this period of my life without treating it as fate?",
};

export default function AskTheSagesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Preparing the sabha…</p>}>
      <AskTheSagesForm />
    </Suspense>
  );
}

function AskTheSagesForm() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>(DEFAULT_IDS);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [need, setNeed] = useState<LifeNeedId>("relationship");
  const [alignmentNote, setAlignmentNote] = useState<string | null>(null);
  const [message, setMessage] = useState(NEED_QUESTION.relationship);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const allGuides = useMemo(() => listWisdomGuides(), []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/wisdom")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const alignment = json.data.alignment as {
          need: LifeNeedId;
          context: { moonSign: string | null; gana: string | null; currentMaha: string | null };
          suggestions: Array<{ guide: { id: string } }>;
        };
        const fromQuery = (searchParams.get("ids") || "")
          .split(",")
          .map((id) => id.trim())
          .filter((id) => allGuides.some((guide) => guide.id === id));
        const ids = (
          fromQuery.length >= 2 ? fromQuery : alignment.suggestions.map((row) => row.guide.id)
        ).slice(0, 3);
        if (ids.length >= 2) setSelected(ids);
        setSuggested(alignment.suggestions.map((row) => row.guide.id).slice(0, 6));
        setNeed(alignment.need);
        if (!fromQuery.length) setMessage(NEED_QUESTION[alignment.need]);
        const note = [
          alignment.context.moonSign ? `Moon ${alignment.context.moonSign}` : null,
          alignment.context.gana,
          alignment.context.currentMaha ? `${alignment.context.currentMaha} Mahadasha` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        setAlignmentNote(note || "Suggested from your present need");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [allGuides, searchParams]);

  const picker = useMemo(() => {
    const preferred = suggested
      .map((id) => allGuides.find((guide) => guide.id === id))
      .filter((guide): guide is (typeof allGuides)[number] => Boolean(guide));
    const rest = allGuides.filter((guide) => !preferred.some((row) => row.id === guide.id));
    return [...preferred, ...rest].slice(0, 16);
  }, [allGuides, suggested]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (selected.length < 2 || !message.trim() || busy) return;
    setBusy(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "council",
          message: message.trim(),
          guideIds: selected,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setAnswer(json.data.answer);
    } catch {
      setAnswer("Could not complete this council reflection. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <ContentReveal className="space-y-8">
        <PageHeader
          title="Ask the Sages"
          description="Compare thoughtful perspectives inspired by different wisdom traditions — clearly labeled as AI interpretation."
          actions={
            <Button asChild variant="outline">
              <Link href={routes.vedicWisdom}>Wisdom library</Link>
            </Button>
          }
        />

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-muted-foreground text-sm">Choose 2–3 guides</p>
              {alignmentNote ? (
                <p className="text-gold/80 text-xs">
                  Suggested for {LIFE_NEEDS.find((item) => item.id === need)?.label.toLowerCase()} ·{" "}
                  {alignmentNote}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {picker.map((g) => {
                const on = selected.includes(g.id);
                const aligned = suggested.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggle(g.id)}
                    className={cn(
                      "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      on
                        ? "border-foreground/30 bg-foreground text-background"
                        : aligned
                          ? "border-gold/40 bg-gold/10 hover:border-gold/50"
                          : "border-border/60 hover:border-foreground/25",
                    )}
                  >
                    {g.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="council-q" className="text-sm font-medium">
              Your question
            </label>
            <textarea
              id="council-q"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-border bg-card focus-visible:ring-ring min-h-28 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
            />
          </div>

          <Button type="submit" disabled={busy || selected.length < 2} className="min-h-11">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gathering perspectives…
              </>
            ) : (
              "Compare perspectives"
            )}
          </Button>
        </form>

        {answer ? (
          <section className="sage-discourse border-gold/20 relative overflow-hidden rounded-3xl border px-5 py-6 sm:px-7">
            <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative space-y-3">
              <p className="text-gold/80 text-[10px] font-medium tracking-[0.18em] uppercase">
                Council reflection · AI interpretation
              </p>
              <div className="sage-manuscript">
                <GuruMarkdown content={answer} />
              </div>
            </div>
          </section>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {WISDOM_AI_DISCLAIMER} Historical teaching, traditional interpretation, and AI-generated
          modern reflection are distinguished in the response when possible. Never treat invented
          lines as quotations.
        </p>
      </ContentReveal>
    </div>
  );
}
