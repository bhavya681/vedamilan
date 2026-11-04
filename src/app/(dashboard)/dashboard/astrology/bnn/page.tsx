"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Coins,
  GraduationCap,
  Heart,
  Plane,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashaPeriodBadges } from "@/features/horoscope/components/dasha-period-display";
import { planetSymbol } from "@/features/horoscope/components/planet-symbols";
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

const THEME_ICON: Record<string, LucideIcon> = {
  career: Briefcase,
  relationships: Heart,
  wealth: Coins,
  family: Users,
  health: Activity,
  learning: GraduationCap,
  travel: Plane,
  spirituality: Sparkles,
};

const STATUS_LABEL: Record<Theme["activation"]["status"], string> = {
  activated: "Active now",
  "not-activated": "Latent",
  unknown: "Activation unknown",
};

function statusTone(status: Theme["activation"]["status"]) {
  if (status === "activated") return "border-emerald-500/40 bg-emerald-500/10";
  if (status === "not-activated") return "border-border/60 bg-muted/20";
  return "border-amber-500/40 bg-amber-500/10";
}

function ThemeCard({
  theme,
  open,
  onToggle,
}: {
  theme: Theme;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = THEME_ICON[theme.theme] ?? Sparkles;
  const active = theme.activation.status === "activated";

  return (
    <GlassCard
      className={cn(
        "flex min-w-0 flex-col gap-3",
        active && "border-emerald-500/30",
        !active && "bg-muted/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
              active
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : "border-border/60 bg-muted/30 text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-tight">{theme.title}</h3>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {theme.patterns.length} pattern{theme.patterns.length === 1 ? "" : "s"} matched
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[9px] tracking-wide uppercase",
            statusTone(theme.activation.status),
          )}
        >
          {STATUS_LABEL[theme.activation.status]}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {theme.planets.map((planet) => (
          <span
            key={planet}
            className="border-border/60 bg-background/60 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
          >
            <span className="text-gold text-sm leading-none" aria-hidden>
              {planetSymbol(planet)}
            </span>
            {planet}
          </span>
        ))}
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">{theme.manifestation}</p>
      <p
        className={cn(
          "rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed",
          active
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-border/50 bg-background/40 text-muted-foreground",
        )}
      >
        {theme.activation.reason}
      </p>

      <Button
        variant="ghost"
        size="sm"
        className="h-auto justify-start px-0 text-xs"
        onClick={onToggle}
      >
        {open ? "Hide nadi evidence" : "Show nadi evidence"}
      </Button>
      {open ? (
        <ul className="text-muted-foreground space-y-1.5 text-[11px]">
          {theme.patterns.map((pattern) => (
            <li key={pattern.id} className="border-border/40 border-l-2 pl-2.5 leading-relaxed">
              <span className="text-foreground font-medium capitalize">{pattern.kind}</span> ·{" "}
              {pattern.evidence}
            </li>
          ))}
        </ul>
      ) : null}
    </GlassCard>
  );
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

  const activeThemes = data?.themes.filter((t) => t.activation.status === "activated") ?? [];
  const latentThemes = data?.themes.filter((t) => t.activation.status !== "activated") ?? [];

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="BNN · Nadi pattern analysis"
        title="Bhrigu Nandi Nadi"
        description="A professional Nadi reading of your D1 chart: conjunctions, depositors, exchanges, and two-step chains. Themes are shown only where a documented pattern exists — with activation read from dasha and gochar."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyJaimini}>Jaimini</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyDasha}>Dashas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyGochar}>Gochar</Link>
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <GlassCard className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Chart lagna
              </p>
              <p className="font-display text-2xl">{data.lagnaSign}</p>
              <p className="text-muted-foreground text-[11px]">D1 basis · whole-sign houses</p>
            </GlassCard>
            <GlassCard className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Strongest theme
              </p>
              <p className="font-display text-2xl">
                {data.strongest.length ? data.strongest.join(" · ") : "None matched"}
              </p>
              <p className="text-muted-foreground text-[11px]">From matched Nadi patterns</p>
            </GlassCard>
            <GlassCard className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Patterns found
              </p>
              <p className="font-display text-2xl">{data.patterns.length}</p>
              <p className="text-muted-foreground text-[11px]">No pattern, no interpretation</p>
            </GlassCard>
            <GlassCard className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Vimshottari period
              </p>
              {data.dasha.currentMaha || data.dasha.currentAntar ? (
                <DashaPeriodBadges maha={data.dasha.currentMaha} antar={data.dasha.currentAntar} />
              ) : (
                <p className="font-display text-2xl">—</p>
              )}
              <p className="text-muted-foreground text-[11px]">Activates matching themes</p>
            </GlassCard>
          </div>

          {data.transitNote ? (
            <p className="text-muted-foreground border-border/50 bg-muted/10 rounded-lg border px-3 py-2 text-xs">
              {data.transitNote}
            </p>
          ) : null}

          {data.emptyNote ? (
            <GlassCard className="border-gold/25 bg-gold/[0.04] text-sm">
              {data.emptyNote}
            </GlassCard>
          ) : null}

          {activeThemes.length ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">Active now</h2>
                  <p className="text-muted-foreground text-xs">
                    Current Maha/Antar or transit Jupiter/Saturn contacts these patterns.
                  </p>
                </div>
                <Badge variant="outline">{activeThemes.length} active</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeThemes.map((theme) => (
                  <ThemeCard
                    key={theme.theme}
                    theme={theme}
                    open={openWhy === theme.theme}
                    onToggle={() => setOpenWhy(openWhy === theme.theme ? null : theme.theme)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {latentThemes.length ? (
            <section className="space-y-3">
              <div>
                <h2 className="font-display text-xl">Background patterns</h2>
                <p className="text-muted-foreground text-xs">
                  Real chart patterns that are not currently activated. They remain part of your
                  temperament, not a pending event.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {latentThemes.map((theme) => (
                  <ThemeCard
                    key={theme.theme}
                    theme={theme}
                    open={openWhy === theme.theme}
                    onToggle={() => setOpenWhy(openWhy === theme.theme ? null : theme.theme)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <GlassCard className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-gold/10 text-gold border-gold/25 grid h-10 w-10 shrink-0 place-items-center rounded-xl border">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg">Method & limits</h2>
                <p className="text-muted-foreground text-xs leading-relaxed">{data.methodology}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Activation uses the stored Vimshottari Maha/Antar and current Jupiter/Saturn gochar
              against natal BNN patterns. This page never creates a second prediction engine and
              never states that an event will occur on a date.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={routes.astrologyGochar}>Open Gochar</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.calendar}>Open Calendar</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
