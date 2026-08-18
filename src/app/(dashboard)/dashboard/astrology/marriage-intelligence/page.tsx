"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Hourglass, MapPin, UserRound } from "lucide-react";

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

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Multi-system partnership read"
        title="Marriage Intelligence"
        description="Desh, Kaala, and Patra first — country, age, and marital situation decide whether a dasha season is practical for marriage. Chart layers stay independent. No wedding day is invented."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.compatibility}>Compatibility</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyJaimini}>Jaimini</Link>
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
            <GlassCard className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">Desh, Kaala, Patra</h2>
                  <p className="text-muted-foreground text-xs">
                    Place, age, and the person — before any dasha is treated as a marriage season.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    dkp.verdict === "likely" && "border-gold/50 bg-gold/10",
                    dkp.verdict === "not-yet" && "border-border",
                  )}
                >
                  {dkp.verdictTitle}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{dkp.verdictReason}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      sanskrit: "Desha",
                      english: "Place",
                      Icon: MapPin,
                      body: dkp.placeNote.replace(/^Desha?\s*[—–-]\s*/i, ""),
                    },
                    {
                      sanskrit: "Kaala",
                      english: "Time",
                      Icon: Hourglass,
                      body: dkp.timeNote.replace(/^Kaala?\s*[—–-]\s*/i, ""),
                    },
                    {
                      sanskrit: "Patra",
                      english: "Vessel",
                      Icon: UserRound,
                      body: dkp.vesselNote.replace(/^Patra\s*[—–-]\s*/i, ""),
                    },
                  ] as const
                ).map((pillar) => (
                  <div key={pillar.sanskrit} className="rounded-xl border p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="bg-gold/10 text-gold flex h-8 w-8 items-center justify-center rounded-lg">
                        <pillar.Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-display text-sm leading-none">{pillar.sanskrit}</p>
                        <p className="text-muted-foreground text-[10px] uppercase">
                          {pillar.english}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{pillar.body}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-[11px]">
                {dkp.placeLabel}
                {dkp.ageYears != null ? ` · about ${dkp.ageYears}` : ""}
                {` · typical first-marriage band ${dkp.typicalMin}–${dkp.typicalMax} (${dkp.region})`}
              </p>
            </GlassCard>
          ) : null}

          {windows.length ? (
            <GlassCard className="border-gold/30 space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="bg-gold/10 text-gold border-gold/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
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
                <Button asChild size="sm" variant="outline">
                  <Link href={routes.astrologyDasha}>Open dashas</Link>
                </Button>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {windows.map((w) => (
                  <li
                    key={`${w.label}-${w.range}`}
                    className="border-gold/20 bg-gold/5 rounded-xl border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <Heart className="text-rose h-3.5 w-3.5 shrink-0" />
                        {w.label}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[9px] tracking-wide uppercase"
                      >
                        {w.likelihood
                          ? LIKELIHOOD_LABEL[w.likelihood] || w.likelihood
                          : w.role.replace(/ Mahadasha| Antardasha/g, "")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs tabular-nums">{w.range}</p>
                    {w.dashaRange && w.dashaRange !== w.range ? (
                      <p className="text-muted-foreground text-[11px]">Full dasha {w.dashaRange}</p>
                    ) : null}
                    {w.ageYears != null ? (
                      <p className="text-muted-foreground text-[11px]">About age {w.ageYears}</p>
                    ) : null}
                    {w.note ? (
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                        {w.note}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-0.5 text-[11px]">{w.role}</p>
                    )}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ) : null}

          <GlassCard className="space-y-2 p-4 sm:p-5">
            <h2 className="font-display text-xl">Where systems agree or differ</h2>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {data.agreements.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {data.differences.length ? (
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-4 text-xs">
                {data.differences.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-muted-foreground text-xs leading-relaxed">{data.synthesis}</p>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.sections.map((section) => (
              <GlassCard key={section.id} className="space-y-2 p-4 sm:p-5">
                <h2 className="font-display text-lg">{section.title}</h2>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed">
                  {section.points.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs"
                  onClick={() => setOpenCalc(openCalc === section.id ? null : section.id)}
                >
                  {openCalc === section.id ? "Hide calculation" : "Show calculation"}
                </Button>
                {openCalc === section.id ? (
                  <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-[11px]">
                    {section.calculation.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : null}
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
