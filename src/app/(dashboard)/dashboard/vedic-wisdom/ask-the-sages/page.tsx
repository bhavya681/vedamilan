"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { WISDOM_GUIDES, listRelationshipGuides } from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const DEFAULT_IDS = ["krishna", "vidura", "chanakya"];

export default function AskTheSagesPage() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_IDS);
  const [message, setMessage] = useState(
    "How should I choose between love and family expectations?",
  );
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const relationship = listRelationshipGuides();

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
            <p className="text-muted-foreground text-sm">Choose 2–3 guides</p>
            <div className="flex flex-wrap gap-2">
              {(relationship.length ? relationship : WISDOM_GUIDES).slice(0, 12).map((g) => {
                const on = selected.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggle(g.id)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      on
                        ? "border-foreground/30 bg-foreground text-background"
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
              className="border-border bg-card focus-visible:ring-ring w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
            />
          </div>

          <Button type="submit" disabled={busy || selected.length < 2}>
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
