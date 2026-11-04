"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  GitBranch,
  GitCompare,
  Heart,
  Hourglass,
  LayoutGrid,
  MapPin,
  Orbit,
  Scale,
  UserRound,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Section = {
  id: string;
  title: string;
  points: string[];
  calculation: string[];
};

type WindowRow = {
  label: string;
  range: string;
  role: string;
  dashaRange?: string;
  ageYears?: number | null;
  likelihood?: string;
  note?: string;
};

type DeshKaal = {
  placeLabel: string;
  ageYears: number | null;
  maritalStatus: string | null;
  region: string;
  typicalMin: number;
  typicalMax: number;
  placeNote: string;
  timeNote: string;
  vesselNote: string;
  verdict: string;
  verdictTitle: string;
  verdictReason: string;
};

type Lab = {
  sections: Section[];
  agreements: string[];
  differences: string[];
  synthesis: string;
  windows?: WindowRow[];
  deshKaal?: DeshKaal;
};

const LIKELIHOOD_LABEL: Record<string, string> = {
  likely: "Practical now",
  possible: "Possible",
  later: "Later",
  "not-yet": "Not yet",
  "already-settled": "Already married",
};

const SECTION_ICON: Record<string, LucideIcon> = {
  parashari: Scale,
  jaimini: Waypoints,
  darakaraka: Heart,
  navamsa: LayoutGrid,
  transit: Orbit,
  bnn: GitBranch,
};

const LIKELIHOOD_TONE: Record<string, string> = {
  likely: "border-emerald-500/40 bg-emerald-500/10",
  possible: "border-gold/40 bg-gold/10",
  later: "border-border/60 bg-muted/20",
  "not-yet": "border-amber-500/40 bg-amber-500/10",
  "already-settled": "border-sky-500/40 bg-sky-500/10",
};

function Pillar({
  sanskrit,
  english,
  Icon,
  body,
}: {
  sanskrit: string;
  english: string;
  Icon: LucideIcon;
  body: string;
}) {
  return (
    <div className="border-border/50 bg-muted/10 rounded-xl border p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="bg-gold/10 text-gold grid h-8 w-8 place-items-center rounded-lg">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-sm leading-none">{sanskrit}</p>
          <p className="text-muted-foreground text-[10px] uppercase">{english}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
    </div>
  );
}

export default function AstrologyMarriageIntelligencePage() {
  const [data, setData] = useState<Lab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCalc, setOpenCalc] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/astrology/marriage-intelligence")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load Marriage Intelligence");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load Marriage Intelligence"))
      .finally(() => setLoading(false));
  }, []);

  const windows = data?.windows?.length ? data.windows : [];
  const dkp = data?.deshKaal;
  const evidence = data?.sections.filter((section) => section.id !== "synthesis") ?? [];

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Marriage Intelligence · multi-system read"
        title="Marriage Intelligence"
        description="Desh, Kaala, and Patra first — place, age, and marital situation decide whether a dasha season is practical. Parashari, Jaimini, D9, gochar, and BNN are read as independent layers. No wedding day is invented."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.compatibility}>Compatibility</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyJaimini}>Jaimini</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyBnn}>BNN</Link>
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
          {dkp ? (
            <GlassCard className="border-gold/25 from-gold/[0.06] space-y-4 bg-gradient-to-br to-transparent p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="border-gold/25 bg-gold/10 text-gold grid h-10 w-10 shrink-0 place-items-center rounded-xl border">
                    <CalendarRange className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl">Desh · Kaala · Patra</h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      The practical frame for marriage — before any dasha is treated as a season.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {dkp.verdictTitle}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed">{dkp.verdictReason}</p>

              <div className="grid gap-3 sm:grid-cols-3">
                <Pillar
                  sanskrit="Desha"
                  english="Place"
                  Icon={MapPin}
                  body={dkp.placeNote.replace(/^Desha?\s*[—–-]\s*/i, "")}
                />
                <Pillar
                  sanskrit="Kaala"
                  english="Time"
                  Icon={Hourglass}
                  body={dkp.timeNote.replace(/^Kaala?\s*[—–-]\s*/i, "")}
                />
                <Pillar
                  sanskrit="Patra"
                  english="Vessel"
                  Icon={UserRound}
                  body={dkp.vesselNote.replace(/^Patra\s*[—–-]\s*/i, "")}
                />
              </div>

              <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <span>{dkp.placeLabel}</span>
                {dkp.ageYears != null ? <span>About age {dkp.ageYears}</span> : null}
                <span>
                  Typical first-marriage band {dkp.typicalMin}–{dkp.typicalMax} ({dkp.region})
                </span>
                {dkp.maritalStatus ? <span>Status: {dkp.maritalStatus}</span> : null}
              </div>
            </GlassCard>
          ) : null}

          {windows.length ? (
            <GlassCard className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="bg-gold/10 text-gold border-gold/30 grid h-10 w-10 shrink-0 place-items-center rounded-xl border">
                    <Hourglass className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl">Practical marriage seasons</h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Vimshottari partnership periods clipped to ages that are practical in this
                      country. These are seasons — not a wedding day.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {windows.length} season{windows.length === 1 ? "" : "s"}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={routes.astrologyDasha}>Open dashas</Link>
                  </Button>
                </div>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2">
                {windows.map((w) => (
                  <li
                    key={`${w.label}-${w.range}`}
                    className={cn(
                      "rounded-xl border p-3",
                      w.likelihood
                        ? LIKELIHOOD_TONE[w.likelihood] || "border-border/60 bg-muted/10"
                        : "border-border/60 bg-muted/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <Heart className="text-rose h-3.5 w-3.5 shrink-0" />
                        {w.label}
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-background/40 shrink-0 text-[9px] tracking-wide uppercase"
                      >
                        {w.likelihood
                          ? LIKELIHOOD_LABEL[w.likelihood] || w.likelihood
                          : w.role.replace(/ Mahadasha| Antardasha/g, "")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium tabular-nums">{w.range}</p>
                    {w.dashaRange && w.dashaRange !== w.range ? (
                      <p className="text-muted-foreground text-[11px]">Full dasha {w.dashaRange}</p>
                    ) : null}
                    {w.ageYears != null ? (
                      <p className="text-muted-foreground text-[11px]">About age {w.ageYears}</p>
                    ) : null}
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {w.note || w.role}
                    </p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ) : null}

          <GlassCard className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="border-gold/25 bg-gold/8 text-gold grid h-10 w-10 shrink-0 place-items-center rounded-xl border">
                <GitCompare className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-xl">Cross-system read</h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Where the layers agree, and where they describe partnership from different angles.
                </p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Agreements
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                  {data.agreements.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-border/50 bg-muted/10 rounded-xl border p-3">
                <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  <GitCompare className="h-3.5 w-3.5" />
                  Differences
                </p>
                {data.differences.length ? (
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                    {data.differences.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="bg-gold/70 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground mt-2 text-xs">
                    No material contradiction between the layers on this chart.
                  </p>
                )}
              </div>
            </div>
            <p className="border-gold/20 bg-gold/[0.04] rounded-xl border p-3 text-xs leading-relaxed">
              {data.synthesis}
            </p>
          </GlassCard>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">Chart evidence</h2>
                <p className="text-muted-foreground text-xs">
                  The calculated layers behind the read. Open any card for its exact basis.
                </p>
              </div>
              <Badge variant="outline">{evidence.length} layers</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {evidence.map((section) => {
                const Icon = SECTION_ICON[section.id] ?? BookOpen;
                return (
                  <GlassCard key={section.id} className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="border-border/60 bg-muted/20 text-muted-foreground grid h-9 w-9 shrink-0 place-items-center rounded-lg border">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-lg leading-tight">{section.title}</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs leading-relaxed">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="bg-gold/70 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    {section.calculation.length ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto justify-start px-0 text-xs"
                          onClick={() => setOpenCalc(openCalc === section.id ? null : section.id)}
                        >
                          {openCalc === section.id ? "Hide calculation" : "Show calculation"}
                        </Button>
                        {openCalc === section.id ? (
                          <ul className="text-muted-foreground border-border/50 bg-muted/10 list-disc space-y-0.5 rounded-lg border p-2.5 pl-6 text-[11px]">
                            {section.calculation.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : null}
                  </GlassCard>
                );
              })}
            </div>
          </section>

          <GlassCard className="space-y-2">
            <p className="text-gold/85 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase">
              <BookOpen className="h-3.5 w-3.5" />
              Professional note
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Marriage seasons are read from Vimshottari periods and cross-checked against the D1,
              D9, Jaimini, gochar, and BNN layers. Country and age determine whether a season is
              practical. If a layer is unavailable, it is not invented to fill the gap.
            </p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
