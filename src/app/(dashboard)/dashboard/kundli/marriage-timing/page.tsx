"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Window = { label: string; window: string; reason: string; score: number };

export default function MarriageTimingPage() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [meta, setMeta] = useState<{ manglikStatus?: string; currentMaha?: string | null }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/marriage-timing")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWindows(json.data.windows || []);
          setMeta({
            manglikStatus: json.data.manglikStatus,
            currentMaha: json.data.currentMaha,
          });
        } else setError(json.error?.message || "Failed to load");
      })
      .catch(() => setError("Failed to load marriage timing"));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Marriage timing"
        title="Activation windows"
        description="Deterministic dasha confluence — not AI speculation"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Kundli workspace</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="text-muted-foreground text-xs uppercase">Current mahadasha</p>
          <p className="font-display mt-2 text-2xl">{meta.currentMaha || "—"}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-muted-foreground text-xs uppercase">Manglik status</p>
          <p className="font-display mt-2 text-2xl">{meta.manglikStatus || "—"}</p>
        </GlassCard>
      </div>
      <div className="space-y-3">
        {windows.map((w) => (
          <GlassCard
            key={w.window + w.label}
            glow={w.score > 90}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-rose text-[11px] tracking-[0.16em] uppercase">{w.label}</p>
              <p className="font-display text-xl sm:text-2xl">{w.window}</p>
              <p className="text-muted-foreground mt-1 text-sm">{w.reason}</p>
            </div>
            <p className="font-display text-brand-dual text-3xl sm:text-4xl">{w.score}</p>
          </GlassCard>
        ))}
        {!error && windows.length === 0 ? (
          <GlassCard>
            <p className="text-muted-foreground text-sm">
              Generate your kundli first to compute marriage timing windows.
            </p>
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
