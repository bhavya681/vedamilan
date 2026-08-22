"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader, EmptyState, ErrorState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/premium-cards";
import { PanelSkeleton, SkeletonScope } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import {
  buildLoshuGrid,
  calculateBhagyank,
  calculateMulank,
  calculatePersonalYear,
  calculationTrace,
  compoundBhagyank,
  getCombinationOrGeneric,
  getNumberProfile,
  isMasterNumber,
  listNumberProfiles,
  luckyForNumber,
  PERSONAL_YEAR_THEME,
  planetForNumber,
  type NumberId,
  type NumberProfile,
} from "@/domain/numerology";
import { KnowledgeLabelBadge } from "@/features/numerology/components/knowledge-label-badge";
import { LoshuGridView } from "@/features/numerology/components/loshu-grid";
import { NumberDetailSheet } from "@/features/numerology/components/number-detail-sheet";
import { NumberPlanetIcon } from "@/features/numerology/components/number-planet-icon";

type KundliPlanetPlacement = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  dignity: string | null;
  isRetrograde: boolean;
};

type NumerologyApiData = {
  hasDob: boolean;
  dateDisplay?: string;
  day?: number;
  month?: number;
  year?: number;
  mulankPlanet?: string;
  bhagyankPlanet?: string;
  kundli?: {
    hasChart: boolean;
    lagnaSign?: string | null;
    moonSign?: string | null;
    sunSign?: string | null;
    mulankPlanetPlacement?: KundliPlanetPlacement | null;
    bhagyankPlanetPlacement?: KundliPlanetPlacement | null;
  };
  nameNumber?: {
    name: string;
    compound: number;
    number: number;
    planet: string;
    steps: string;
  } | null;
};

type DateParts = { day: number; month: number; year: number };

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function NumberHero({
  label,
  number,
  compound,
  profile,
}: {
  label: string;
  number: NumberId;
  compound: number;
  profile: NumberProfile;
}) {
  return (
    <GlassCard className="flex h-full min-w-0 flex-col space-y-3 sm:space-y-4">
      <div className="flex items-start justify-between gap-3">
        <NumberPlanetIcon number={number} planet={profile.planet} size="xl" active />
        <Badge variant="outline">{profile.planet}</Badge>
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </p>
        <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">{profile.keyword}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{profile.coreEnergy}</p>
      </div>
      {compound !== number ? (
        <p className="text-muted-foreground text-xs">
          Compound {compound} → {number}
        </p>
      ) : null}
    </GlassCard>
  );
}

function ProfileAspects({ profile }: { profile: NumberProfile }) {
  const t = useT();
  const sections = [
    { label: t("numerology.mulank.interpretation.coreTendencies"), blocks: profile.coreTendencies },
    { label: t("numerology.mulank.interpretation.strengths"), blocks: profile.strengths },
    { label: t("numerology.mulank.interpretation.growthAreas"), blocks: profile.growthAreas },
    { label: t("numerology.mulank.interpretation.career"), blocks: profile.career },
    { label: t("numerology.mulank.interpretation.relationships"), blocks: profile.relationships },
    { label: t("numerology.mulank.interpretation.remedies"), blocks: profile.remedies },
  ];
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.label} className="border-border/50 space-y-2 border-b pb-4 last:border-0">
          <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {section.label}
          </p>
          <ul className="space-y-2">
            {section.blocks.map((block, i) => (
              <li key={`${section.label}-${i}`} className="space-y-1">
                <KnowledgeLabelBadge label={block.label} />
                <p className="text-sm leading-relaxed">{block.body}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function NumerologyPage() {
  const t = useT();
  const [apiData, setApiData] = useState<NumerologyApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState<DateParts | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<NumberProfile | null>(null);
  const [calendarYear, setCalendarYear] = useState(2026);

  useEffect(() => {
    setCalendarYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    void fetch("/api/numerology")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load numerology");
          return;
        }
        setApiData(json.data as NumerologyApiData);
      })
      .catch(() => setError("Failed to load numerology"))
      .finally(() => setLoading(false));
  }, []);

  const savedParts = useMemo<DateParts | null>(() => {
    if (!apiData?.hasDob || !apiData.day || !apiData.month || !apiData.year) return null;
    return { day: apiData.day, month: apiData.month, year: apiData.year };
  }, [apiData]);
  const parts = override ?? savedParts;
  const viewingSaved = Boolean(
    savedParts &&
    parts &&
    parts.day === savedParts.day &&
    parts.month === savedParts.month &&
    parts.year === savedParts.year,
  );

  const reading = useMemo(() => {
    if (!parts) return null;
    const mulank = calculateMulank(parts.day) as NumberId;
    const bhagyank = calculateBhagyank(parts.day, parts.month, parts.year) as NumberId;
    const mulankMaster = calculateMulank(parts.day, { preserveMasters: true });
    const bhagyankMaster = calculateBhagyank(parts.day, parts.month, parts.year, {
      preserveMasters: true,
    });
    const personalYear = calculatePersonalYear(parts.day, parts.month, calendarYear) as NumberId;
    const trace = calculationTrace(parts.day, parts.month, parts.year);
    return {
      mulank,
      bhagyank,
      mulankMaster,
      bhagyankMaster,
      personalYear,
      trace,
      compoundMulank: parts.day,
      compoundBhagyank: compoundBhagyank(parts.day, parts.month, parts.year),
      loshu: buildLoshuGrid(parts.day, parts.month, parts.year),
      combination: getCombinationOrGeneric(mulank, bhagyank),
      mulankProfile: getNumberProfile(mulank),
      bhagyankProfile: getNumberProfile(bhagyank),
      lucky: luckyForNumber(mulank),
    };
  }, [parts, calendarYear]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonScope label="Loading numerology">
          <PanelSkeleton lines={3} />
          <PanelSkeleton lines={6} className="mt-4" />
        </SkeletonScope>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Vedic numerology"
          title={t("numerology.pageTitle")}
          description={t("numerology.pageDescription")}
        />
        <ErrorState
          title={t("numerology.status.error")}
          action={
            <Button onClick={() => window.location.reload()}>{t("numerology.status.retry")}</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Mulank · Bhagyank · Lo Shu"
        title={t("numerology.pageTitle")}
        description={t("numerology.pageDescription")}
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button asChild variant="secondary" className="min-h-11">
              <Link href={routes.birthDetails}>Birth details</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={routes.kundli}>{t("numerology.kundliConnection.openKundli")}</Link>
            </Button>
          </div>
        }
      />

      <CalculatorBar
        initial={savedParts}
        override={override}
        onCalculate={setOverride}
        onReset={() => setOverride(null)}
      />

      {!reading ? (
        <EmptyState
          title={t("numerology.status.noDobShort")}
          description={t("numerology.status.noDob")}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth date</Link>
            </Button>
          }
        />
      ) : null}

      {reading && reading.mulankProfile && reading.bhagyankProfile ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <NumberHero
              label={t("numerology.driver")}
              number={reading.mulank}
              compound={reading.compoundMulank}
              profile={reading.mulankProfile}
            />
            <NumberHero
              label={t("numerology.conductor")}
              number={reading.bhagyank}
              compound={reading.compoundBhagyank}
              profile={reading.bhagyankProfile}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard className="space-y-2">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.personalYear.title")}
              </p>
              <div className="flex items-center gap-3">
                <NumberPlanetIcon
                  number={reading.personalYear}
                  planet={planetForNumber(reading.personalYear)}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-display text-2xl">{calendarYear}</p>
                  <p className="text-muted-foreground text-xs">
                    {planetForNumber(reading.personalYear)} ·{" "}
                    {PERSONAL_YEAR_THEME[reading.personalYear]}
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.dobSection.title")}
              </p>
              <p className="font-display text-xl sm:text-2xl">{reading.trace.dateDisplay}</p>
              {override ? (
                <Badge variant="outline">Trying another date</Badge>
              ) : (
                <Badge variant="outline">Saved birth date</Badge>
              )}
              <p className="text-muted-foreground text-xs break-words">
                {reading.trace.mulank.steps} · {reading.trace.bhagyank.steps}
              </p>
            </GlassCard>
          </div>

          {isMasterNumber(reading.bhagyankMaster) ? (
            <GlassCard className="border-gold/30 space-y-1">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.masterPath.title")}
              </p>
              <p className="text-sm leading-relaxed">
                {t("numerology.masterPath.body", {
                  master: reading.bhagyankMaster,
                  reduced: reading.bhagyank,
                })}
              </p>
            </GlassCard>
          ) : null}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.lucky.color")}
              </p>
              <p className="font-medium">{reading.lucky.colors.join(" · ")}</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.lucky.day")}
              </p>
              <p className="font-medium">{reading.lucky.day}</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.lucky.gem")}
              </p>
              <p className="font-medium">{reading.lucky.gem}</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {t("numerology.lucky.planet")}
              </p>
              <p className="font-medium">
                {reading.lucky.planet} · {reading.lucky.metal}
              </p>
            </GlassCard>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("numerology.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="numbers">{t("numerology.tabs.numbers")}</TabsTrigger>
              <TabsTrigger value="grid">{t("numerology.tabs.grid")}</TabsTrigger>
              <TabsTrigger value="kundli">{t("numerology.tabs.kundli")}</TabsTrigger>
              <TabsTrigger value="explore">{t("numerology.tabs.explore")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <GlassCard className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <NumberPlanetIcon
                    number={reading.mulank}
                    planet={reading.mulankProfile.planet}
                    size="lg"
                  />
                  <span className="text-muted-foreground text-xl">+</span>
                  <NumberPlanetIcon
                    number={reading.bhagyank}
                    planet={reading.bhagyankProfile.planet}
                    size="lg"
                  />
                  <div>
                    <h2 className="font-display text-xl">{t("numerology.combination.title")}</h2>
                    <p className="text-muted-foreground text-xs">
                      {t("numerology.combination.subtitle")}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{reading.combination.interaction}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reading.combination.complement ? (
                    <div className="rounded-xl border p-3">
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.combination.complement")}
                      </p>
                      <p className="mt-1 text-sm">{reading.combination.complement}</p>
                    </div>
                  ) : null}
                  {reading.combination.tension ? (
                    <div className="rounded-xl border p-3">
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.combination.tension")}
                      </p>
                      <p className="mt-1 text-sm">{reading.combination.tension}</p>
                    </div>
                  ) : null}
                  {reading.combination.strengths ? (
                    <div className="rounded-xl border p-3">
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.combination.strengths")}
                      </p>
                      <p className="mt-1 text-sm">{reading.combination.strengths}</p>
                    </div>
                  ) : null}
                  {reading.combination.practicalAdvice ? (
                    <div className="rounded-xl border p-3">
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.combination.advice")}
                      </p>
                      <p className="mt-1 text-sm">{reading.combination.practicalAdvice}</p>
                    </div>
                  ) : null}
                </div>
              </GlassCard>

              <GlassCard className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-display text-lg">{t("numerology.activate.title")}</h3>
                  <p className="text-sm font-medium">
                    {t("numerology.activate.mulankGuidance", { number: reading.mulank })}
                  </p>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {reading.mulankProfile.remedies.map((r, i) => (
                      <li key={`m-${i}`}>· {r.body}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs">
                    {t("numerology.activate.subtitle")}
                  </p>
                  <p className="text-sm font-medium">
                    {t("numerology.activate.bhagyankGuidance", { number: reading.bhagyank })}
                  </p>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {reading.bhagyankProfile.strengths.map((s, i) => (
                      <li key={`b-${i}`}>· {s.body}</li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="numbers">
              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard className="space-y-3">
                  <div className="flex items-start gap-3 sm:items-center">
                    <NumberPlanetIcon
                      number={reading.mulank}
                      planet={reading.mulankProfile.planet}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg sm:text-xl">
                        {t("numerology.mulank.nameFull")} — {reading.mulank}
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {reading.mulankProfile.planet} · {t("numerology.mulank.computedFrom")}
                      </p>
                    </div>
                  </div>
                  <ProfileAspects profile={reading.mulankProfile} />
                </GlassCard>
                <GlassCard className="space-y-3">
                  <div className="flex items-start gap-3 sm:items-center">
                    <NumberPlanetIcon
                      number={reading.bhagyank}
                      planet={reading.bhagyankProfile.planet}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg sm:text-xl">
                        {t("numerology.bhagyank.nameFull")} — {reading.bhagyank}
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {reading.bhagyankProfile.planet} · {t("numerology.bhagyank.computedFrom")}
                      </p>
                    </div>
                  </div>
                  <ProfileAspects profile={reading.bhagyankProfile} />
                </GlassCard>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="space-y-4">
              <GlassCard className="space-y-4">
                <div>
                  <h2 className="font-display text-xl">{t("numerology.grid.title")}</h2>
                  <p className="text-muted-foreground text-xs">{t("numerology.grid.subtitle")}</p>
                </div>
                <div className="grid gap-6 md:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                  <LoshuGridView grid={reading.loshu} />
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.grid.missing")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {reading.loshu.missing.length === 0 ? (
                          <Badge variant="outline">None</Badge>
                        ) : (
                          reading.loshu.missing.map((n) => (
                            <Badge key={n} variant="outline">
                              {n} · {planetForNumber(n)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {t("numerology.grid.repeated")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {reading.loshu.repeated.length === 0 ? (
                          <Badge variant="outline">None</Badge>
                        ) : (
                          reading.loshu.repeated.map((n) => (
                            <Badge key={n} className="border-emerald-500/40 bg-emerald-500/10">
                              {n} × {reading.loshu.counts[n]} · {planetForNumber(n)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    {apiData?.nameNumber ? (
                      <div className="rounded-xl border p-3">
                        <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                          {t("numerology.nameNumber.title")} · {t("numerology.nameNumber.method")}
                        </p>
                        <p className="font-display mt-1 text-xl">
                          {apiData.nameNumber.number} · {apiData.nameNumber.planet}
                        </p>
                        <p className="text-muted-foreground text-xs">{apiData.nameNumber.name}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {apiData.nameNumber.steps}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        {t("numerology.nameNumber.missing")}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="kundli">
              <GlassCard className="space-y-4">
                <div>
                  <h2 className="font-display text-xl">{t("numerology.kundliConnection.title")}</h2>
                  <p className="text-muted-foreground text-xs">
                    {t("numerology.kundliConnection.subtitle")}
                  </p>
                </div>
                {!viewingSaved ? (
                  <p className="text-muted-foreground text-sm">
                    Kundli placements stay tied to your saved birth chart. Reset the calculator to
                    see them beside these numbers.
                  </p>
                ) : apiData?.kundli?.hasChart ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <KundliSlot
                      title={t("numerology.kundliConnection.mulankPlanet")}
                      planet={apiData.mulankPlanet || reading.mulankProfile.planet}
                      placement={apiData.kundli.mulankPlanetPlacement || null}
                    />
                    <KundliSlot
                      title={t("numerology.kundliConnection.bhagyankPlanet")}
                      planet={apiData.bhagyankPlanet || reading.bhagyankProfile.planet}
                      placement={apiData.kundli.bhagyankPlanetPlacement || null}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      {t("numerology.kundliConnection.noChart")}
                    </p>
                    <Button asChild>
                      <Link href={routes.kundli}>Open kundli</Link>
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground text-xs">
                  {t("numerology.kundliConnection.disclaimer")}
                </p>
              </GlassCard>
            </TabsContent>

            <TabsContent value="explore" className="space-y-4">
              <div>
                <h2 className="font-display text-xl">{t("numerology.numberCards.title")}</h2>
                <p className="text-muted-foreground text-xs">
                  {t("numerology.numberCards.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                {listNumberProfiles().map((p) => (
                  <button
                    key={p.number}
                    type="button"
                    onClick={() => setSelectedProfile(p)}
                    className={cn(
                      "hover:border-gold/40 min-h-[5.5rem] rounded-xl border p-2.5 text-center transition-colors sm:min-h-0 sm:p-3",
                      (p.number === reading.mulank || p.number === reading.bhagyank) &&
                        "border-gold/50 bg-gold/10",
                    )}
                  >
                    <NumberPlanetIcon
                      number={p.number}
                      planet={p.planet}
                      size="md"
                      className="mx-auto"
                    />
                    <p className="mt-2 text-xs font-medium">{p.planet}</p>
                    <p className="text-muted-foreground text-[10px]">{p.keyword}</p>
                  </button>
                ))}
              </div>

              <GlassCard className="space-y-3">
                <h3 className="font-display text-xl">
                  <Star className="mr-2 mb-1 inline h-4 w-4" />
                  {t("numerology.masterNumbers.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("numerology.masterNumbers.note")}
                </p>
              </GlassCard>

              <GlassCard className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-gold h-4 w-4" />
                  <h3 className="font-display text-xl">{t("numerology.aiGuide.title")}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    t("numerology.aiGuide.suggestedPrompts.mulank"),
                    t("numerology.aiGuide.suggestedPrompts.bhagyank"),
                    t("numerology.aiGuide.suggestedPrompts.interaction"),
                    t("numerology.aiGuide.suggestedPrompts.planet"),
                  ].map((p) => (
                    <Link
                      key={p}
                      href={`${routes.aiInsights}?q=${encodeURIComponent(p)}`}
                      className="hover:border-gold/40 rounded-full border px-3 py-1.5 text-xs"
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {t("numerology.aiGuide.disclaimer")}
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      <GlassCard className="space-y-2">
        <p className="font-display text-sm">{t("numerology.knowledgeNotice.title")}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("numerology.knowledgeNotice.body")}
        </p>
      </GlassCard>

      <NumberDetailSheet
        profile={selectedProfile}
        open={Boolean(selectedProfile)}
        onOpenChange={(open) => {
          if (!open) setSelectedProfile(null);
        }}
      />
    </div>
  );
}

function KundliSlot({
  title,
  planet,
  placement,
}: {
  title: string;
  planet: string;
  placement: KundliPlanetPlacement | null;
}) {
  const t = useT();
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">{title}</p>
      <p className="font-medium">{planet}</p>
      {placement ? (
        <div className="grid grid-cols-2 gap-2 rounded-xl border p-3 text-sm">
          <Meta label={t("numerology.kundliConnection.sign")} value={placement.sign} />
          <Meta label={t("numerology.kundliConnection.house")} value={`H${placement.house}`} />
          <Meta label={t("numerology.kundliConnection.nakshatra")} value={placement.nakshatra} />
          <Meta label={t("numerology.kundliConnection.dignity")} value={placement.dignity || "—"} />
          {placement.isRetrograde ? (
            <Badge variant="outline" className="col-span-2 w-fit">
              {t("numerology.kundliConnection.retrograde")} ℞
            </Badge>
          ) : null}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Planet not found in your chart</p>
      )}
    </div>
  );
}

function CalculatorBar({
  initial,
  override,
  onCalculate,
  onReset,
}: {
  initial: DateParts | null;
  override: DateParts | null;
  onCalculate: (parts: DateParts) => void;
  onReset: () => void;
}) {
  const t = useT();
  const [day, setDay] = useState(initial?.day ?? 1);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const [year, setYear] = useState(initial?.year ?? 1990);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial || override) return;
    setDay(initial.day);
    setMonth(initial.month);
    setYear(initial.year);
  }, [initial, override]);

  return (
    <GlassCard className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-lg">{t("numerology.calculator.title")}</p>
          <p className="text-muted-foreground text-xs">{t("numerology.calculator.subtitle")}</p>
        </div>
        {override ? (
          <Button variant="outline" size="sm" onClick={onReset}>
            {t("numerology.calculator.useMyBirthDetails")}
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="num-day">{t("numerology.calculator.day")}</Label>
          <Input
            id="num-day"
            type="number"
            min={1}
            max={31}
            inputMode="numeric"
            className="min-h-11"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="num-month">{t("numerology.calculator.month")}</Label>
          <Input
            id="num-month"
            type="number"
            min={1}
            max={12}
            inputMode="numeric"
            className="min-h-11"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </div>
        <div className="col-span-2 space-y-1 md:col-span-1">
          <Label htmlFor="num-year">{t("numerology.calculator.year")}</Label>
          <Input
            id="num-year"
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            className="min-h-11"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <div className="col-span-2 flex items-end md:col-span-1">
          <Button
            className="min-h-11 w-full"
            onClick={() => {
              try {
                calculationTrace(day, month, year);
                onCalculate({ day, month, year });
                setCalcError(null);
              } catch (e) {
                setCalcError(String((e as Error).message));
              }
            }}
          >
            {t("numerology.calculator.calculate")}
          </Button>
        </div>
      </div>
      {calcError ? <p className="text-destructive text-sm">{calcError}</p> : null}
    </GlassCard>
  );
}
