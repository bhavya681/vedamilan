"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Pattern = {
  id: string;
  kind: string;
  planets: string[];
  signs: string[];
  houses: number[];
  evidence: string;
};

type Theme = {
  theme: string;
  title: string;
  patterns: Pattern[];
  planets: string[];
  why: string;
  manifestation: string;
  activation: { status: "activated" | "not-activated" | "unknown"; reason: string };
};

type BnnLab = {
  methodology: string;
  lagnaSign: string;
  patterns: Pattern[];
  themes: Theme[];
  strongest: string[];
  dasha: { currentMaha: string | null; currentAntar: string | null };
  transitNote: string | null;
  emptyNote: string | null;
};

function statusTone(status: Theme["activation"]["status"]) {
  if (status === "activated") return "border-emerald-500/40 bg-emerald-500/10";
  if (status === "not-activated") return "border-border/60";
  return "border-amber-500/40 bg-amber-500/10";
}

export default function AstrologyBnnPage() {
  const [data, setData] = useState<BnnLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/astrology/bnn")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load BNN analysis");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load BNN analysis"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Bhrigu Nandi Nadi"
        title="BNN"
        description="Nadi-based planetary pattern analysis from stored D1 positions. Conjunctions, depositors, exchanges, and two-step chains only — no invented event dates."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyJaimini}>Jaimini</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyDasha}>Dashas</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={8} /> : null}
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] uppercase">Strongest themes</p>
              <p className="font-display text-lg">
                {data.strongest.length ? data.strongest.join(" · ") : "None matched"}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] uppercase">Current dasha</p>
              <p className="font-display text-lg">
                {data.dasha.currentMaha ?? "—"}
                {data.dasha.currentAntar ? ` / ${data.dasha.currentAntar}` : ""}
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] uppercase">Patterns found</p>
              <p className="font-display text-lg">{data.patterns.length}</p>
            </GlassCard>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">{data.methodology}</p>
          {data.transitNote ? (
            <p className="text-muted-foreground text-xs">{data.transitNote}</p>
          ) : null}
          {data.emptyNote ? <GlassCard className="p-4 text-sm">{data.emptyNote}</GlassCard> : null}

          <h2 className="font-display text-xl">Your strongest planetary themes</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.themes.map((theme) => (
              <GlassCard key={theme.theme} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg">{theme.title}</h3>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", statusTone(theme.activation.status))}
                  >
                    {theme.activation.status === "activated"
                      ? "Currently activated"
                      : theme.activation.status === "not-activated"
                        ? "Not currently activated"
                        : "Activation unknown"}
                  </Badge>
                </div>
                <p className="text-xs font-medium">
                  {theme.patterns[0]?.planets.join(" → ") || theme.planets.join(" · ")}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {theme.manifestation}
                </p>
                <p className="text-[11px]">{theme.activation.reason}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs"
                  onClick={() => setOpenWhy(openWhy === theme.theme ? null : theme.theme)}
                >
                  {openWhy === theme.theme ? "Hide why this appears" : "Why this appears"}
                </Button>
                {openWhy === theme.theme ? (
                  <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-[11px]">
                    {theme.patterns.map((p) => (
                      <li key={p.id}>
                        {p.kind}: {p.evidence}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </GlassCard>
            ))}
          </div>

          <GlassCard className="space-y-2 p-4 sm:p-5">
            <h2 className="font-display text-lg">How to read activation</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Activation uses the stored Vimshottari Maha/Antar and current Jupiter/Saturn gochar
              against natal BNN patterns. It never creates a second prediction engine and never
              states that an event will occur on a date.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={routes.astrologyGochar}>Gochar</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.calendar}>Calendar</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
