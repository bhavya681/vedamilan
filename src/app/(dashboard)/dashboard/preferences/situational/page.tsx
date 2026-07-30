"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { SITUATIONAL_MIN_ANSWERS } from "@/domain/compatibility/situational-alignment";

type Question = {
  id: string;
  theme: string;
  graha: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
};

type ProfileState = {
  answers: Record<string, string>;
  complete: boolean;
  answeredCount: number;
  totalQuestions: number;
  completedAt: string | null;
};

export default function SituationalAlignmentPage() {
  const [catalog, setCatalog] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/situational-alignment")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load");
          return;
        }
        setCatalog(json.data.catalog || []);
        setProfile(json.data.profile || null);
        setAnswers(json.data.profile?.answers || {});
      })
      .catch(() => setError("Failed to load situational alignment"))
      .finally(() => setLoading(false));
  }, []);

  const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;

  async function onSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/situational-alignment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setError(json.error?.message || "Save failed");
      return;
    }
    setProfile(json.data.profile);
    setAnswers(json.data.profile?.answers || {});
    setMessage(
      json.data.profile?.complete
        ? "Saved — your situational profile is complete and can be used in matching."
        : `Saved — answer at least ${SITUATIONAL_MIN_ANSWERS} situations to complete.`,
    );
  }

  async function onClear() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/situational-alignment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setError(json.error?.message || "Could not clear");
      return;
    }
    setProfile(json.data.profile);
    setAnswers({});
    setMessage("Situational answers cleared — this section stays optional.");
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Optional"
        title="Situational alignment"
        description="Everyday situations — how you think and prefer to act. Complements kundli compatibility; never required."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={routes.preferences}>Partner preferences</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={routes.matches}>Matches</Link>
            </Button>
          </div>
        }
      />

      <GlassCard className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {answeredCount}/{catalog.length || profile?.totalQuestions || 8} answered
          </Badge>
          {profile?.complete ? (
            <Badge className="border-emerald/40 bg-emerald/12 border">Complete</Badge>
          ) : (
            <Badge variant="outline">Optional · {SITUATIONAL_MIN_ANSWERS}+ to complete</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Each question maps to a life theme (Moon, Venus, Saturn…). When both of you complete this,
          Compatibility soft-blends situational fit with Vedic analysis. On Matches you can filter
          to only people who finished this section.
        </p>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-emerald text-sm">{message}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}

      {!loading ? (
        <div className="space-y-4">
          {catalog.map((q, index) => (
            <GlassCard key={q.id} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-lg">
                  {index + 1}. {q.theme}
                </p>
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  {q.graha}
                </p>
              </div>
              <p className="text-foreground/90 text-sm leading-relaxed">{q.prompt}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-primary/45 bg-primary/8 text-foreground"
                          : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              disabled={saving || answeredCount === 0}
              onClick={() => void onSave()}
            >
              {saving ? "Saving…" : "Save situational answers"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving || answeredCount === 0}
              onClick={() => void onClear()}
            >
              Clear answers
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
