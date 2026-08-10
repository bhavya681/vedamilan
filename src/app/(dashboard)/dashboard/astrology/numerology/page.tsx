"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader, EmptyState, ErrorState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Surface } from "@/components/ui/premium-cards";
import { PanelSkeleton, SkeletonScope } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import {
  calculateBhagyank,
  calculateMulank,
  calculationTrace,
  getCombinationOrGeneric,
  getNumberProfile,
  listNumberProfiles,
  type NumberId,
  type NumberProfile,
} from "@/domain/numerology";
import { KnowledgeLabelBadge } from "@/features/numerology/components/knowledge-label-badge";
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
  mulank?: number;
  bhagyank?: number;
  mulankPlanet?: string;
  bhagyankPlanet?: string;
  calculationTrace?: {
    mulank: { result: number; steps: string };
    bhagyank: { result: number; steps: string };
  };
  kundli?: {
    hasChart: boolean;
    lagnaSign?: string | null;
    moonSign?: string | null;
    sunSign?: string | null;
    mulankPlanetPlacement?: KundliPlanetPlacement | null;
    bhagyankPlanetPlacement?: KundliPlanetPlacement | null;
  };
  numberCards?: Array<{
    number: number;
    planet: string;
    keyword: string;
    coreEnergy: string;
  }>;
  combination?: {
    mulank: number;
    bhagyank: number;
    defined: boolean;
    interaction?: string;
    complement?: string;
    tension?: string;
    strengths?: string;
    practicalAdvice?: string;
  };
};

function NumberCard({ profile, onClick }: { profile: NumberProfile; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border/50 bg-card hover:border-gold/30 hover:bg-muted/30 group focus:ring-gold/40 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:p-5"
      aria-label={`Number ${profile.number} — ${profile.planet}. ${profile.keyword}.`}
    >
      <NumberPlanetIcon number={profile.number} planet={profile.planet} size="md" />
      <div className="text-muted-foreground text-xs tracking-wide uppercase">{profile.planet}</div>
      <div className="font-display text-xl">{profile.keyword}</div>
      <p className="text-muted-foreground text-[11px] leading-relaxed">{profile.coreEnergy}</p>
    </button>
  );
}

function NumberGrid({ onNumberClick }: { onNumberClick: (profile: NumberProfile) => void }) {
  const profiles = listNumberProfiles();
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 md:gap-4">
      {profiles.map((p) => (
        <NumberCard key={p.number} profile={p} onClick={() => onNumberClick(p)} />
      ))}
    </div>
  );
}

function InterpretationSection({
  label,
  blocks,
}: {
  label: string;
  blocks: Array<{ label: string; body: string }>;
}) {
  if (!blocks?.length) return null;
  return (
    <div className="border-border/50 border-b py-4">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <ul className="mt-2 space-y-3">
        {blocks.map((block, i) => (
          <li key={`${label}-${i}`} className="flex flex-col gap-1.5">
            <KnowledgeLabelBadge label={block.label as never} />
            <p className="text-sm leading-relaxed">{block.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberDetailView({ profile }: { profile: NumberProfile }) {
  const t = useT();
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <NumberPlanetIcon number={profile.number} planet={profile.planet} size="lg" />
        <div>
          <h3 className="font-display text-2xl">
            {profile.number} — {profile.planet}
          </h3>
          <p className="text-muted-foreground text-sm">{profile.keyword}</p>
        </div>
      </div>
      <InterpretationSection
        label={t("numerology.mulank.interpretation.coreTendencies")}
        blocks={profile.coreTendencies}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.strengths")}
        blocks={profile.strengths}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.growthAreas")}
        blocks={profile.growthAreas}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.career")}
        blocks={profile.career}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.relationships")}
        blocks={profile.relationships}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.communication")}
        blocks={profile.communication}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.learning")}
        blocks={profile.learning}
      />
      <InterpretationSection
        label={t("numerology.mulank.interpretation.remedies")}
        blocks={profile.remedies}
      />
    </div>
  );
}

function KundliContextCard({
  planet,
  placement,
}: {
  planet: string;
  placement: KundliPlanetPlacement | null;
}) {
  const t = useT();
  if (!placement) {
    return (
      <div className="border-border/50 rounded-xl border p-3 text-center">
        <p className="text-muted-foreground text-sm">{planet} not found in chart</p>
      </div>
    );
  }
  return (
    <div className="border-border/50 grid grid-cols-2 gap-2 rounded-xl border p-3 text-sm">
      <div>
        <dt className="text-muted-foreground text-[10px] uppercase">
          {t("numerology.kundliConnection.sign")}
        </dt>
        <dd className="font-medium">{placement.sign}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-[10px] uppercase">
          {t("numerology.kundliConnection.house")}
        </dt>
        <dd className="font-medium">H{placement.house}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-[10px] uppercase">
          {t("numerology.kundliConnection.nakshatra")}
        </dt>
        <dd className="font-medium">{placement.nakshatra}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-[10px] uppercase">
          {t("numerology.kundliConnection.dignity")}
        </dt>
        <dd className="font-medium">{placement.dignity || "—"}</dd>
      </div>
      {placement.isRetrograde && (
        <div className="col-span-2">
          <Badge variant="outline" className="text-xs">
            {t("numerology.kundliConnection.retrograde")} ℞
          </Badge>
        </div>
      )}
    </div>
  );
}

function NumerologyCalculator({
  initialDob,
  onCalculated,
}: {
  initialDob?: { day: number; month: number; year: number; display: string } | null;
  onCalculated: (result: {
    mulank: number;
    bhagyank: number;
    trace: ReturnType<typeof calculationTrace>;
  }) => void;
}) {
  const t = useT();
  const [day, setDay] = useState(initialDob?.day ?? new Date().getUTCDate());
  const [month, setMonth] = useState(initialDob?.month ?? new Date().getUTCMonth() + 1);
  const [year, setYear] = useState(initialDob?.year ?? new Date().getUTCFullYear());
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    try {
      const trace = calculationTrace(day, month, year);
      const mulank = calculateMulank(day);
      const bhagyank = calculateBhagyank(day, month, year);
      onCalculated({ mulank, bhagyank, trace });
      setError(null);
    } catch (e) {
      setError(String((e as Error).message));
    }
  }

  return (
    <Surface className="space-y-4">
      <div>
        <p className="font-display text-xl">{t("numerology.calculator.title")}</p>
        <p className="text-muted-foreground text-sm">{t("numerology.calculator.subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-muted-foreground text-xs" htmlFor="num-day">
            {t("numerology.calculator.day")}
          </label>
          <input
            id="num-day"
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-muted-foreground text-xs" htmlFor="num-month">
            {t("numerology.calculator.month")}
          </label>
          <input
            id="num-month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-muted-foreground text-xs" htmlFor="num-year">
            {t("numerology.calculator.year")}
          </label>
          <input
            id="num-year"
            type="number"
            min={1900}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button onClick={calculate} size="sm">
        {t("numerology.calculator.calculate")}
      </Button>
    </Surface>
  );
}

function MasterNumbersSection() {
  return (
    <Surface className="space-y-3">
      <h3 className="font-display text-xl">
        <Star className="mr-2 mb-1 inline h-4 w-4" />
        Master Numbers
      </h3>
      <div className="border-border/50 border-saffron/50 border-l-[3px] pl-4">
        <p className="text-sm font-medium">Number 11</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          An advanced interpretation available in some traditions — intuition amplified, a bridge
          between the material and spiritual.
        </p>
      </div>
      <div className="border-border/50 border-saffron/50 border-l-[3px] pl-4">
        <p className="text-sm font-medium">Number 22</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          An advanced interpretation available in some traditions — the master builder, turning
          visionary ideas into lasting form.
        </p>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        In this system, 11 reduces to Mulank 2 and 22 reduces to Mulank 4 (via digit sum). The
        current VedaMilan system can provide additional interpretation only where its knowledge base
        supports it.
      </p>
    </Surface>
  );
}

function AIGuideSection({ mulank, bhagyank }: { mulank?: number; bhagyank?: number }) {
  const t = useT();
  const prompts = [
    t("numerology.aiGuide.suggestedPrompts.mulank"),
    t("numerology.aiGuide.suggestedPrompts.bhagyank"),
    t("numerology.aiGuide.suggestedPrompts.interaction"),
    t("numerology.aiGuide.suggestedPrompts.planet"),
    t("numerology.aiGuide.suggestedPrompts.kundli"),
    t("numerology.aiGuide.suggestedPrompts.teach"),
  ];

  return (
    <Surface className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="text-gold h-4 w-4" />
        <h3 className="font-display text-xl">{t("numerology.aiGuide.title")}</h3>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("numerology.aiGuide.subtitle")}
      </p>
      {mulank && bhagyank ? (
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Link
              key={p}
              href={`${routes.aiInsights}?q=${encodeURIComponent(p)}`}
              className="border-border/60 hover:border-gold/40 hover:bg-gold/5 rounded-full border px-3 py-1.5 text-xs transition-colors"
            >
              {p}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Save your birth date to get number-specific suggested questions.
        </p>
      )}
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        {t("numerology.aiGuide.disclaimer")}
      </p>
    </Surface>
  );
}

function LearningSection() {
  const t = useT();
  const modules = [
    { id: "what", title: t("numerology.learningPath.modules.what"), order: 1 },
    { id: "mulank", title: t("numerology.learningPath.modules.mulank"), order: 2 },
    { id: "bhagyank", title: t("numerology.learningPath.modules.bhagyank"), order: 3 },
    { id: "numbers", title: t("numerology.learningPath.modules.numbers"), order: 4 },
    { id: "planets", title: t("numerology.learningPath.modules.planets"), order: 5 },
    { id: "astrology", title: t("numerology.learningPath.modules.astrology"), order: 6 },
    { id: "combinations", title: t("numerology.learningPath.modules.combinations"), order: 7 },
    { id: "masters", title: t("numerology.learningPath.modules.masters"), order: 8 },
    { id: "practical", title: t("numerology.learningPath.modules.practical"), order: 9 },
  ];

  return (
    <Surface className="space-y-4">
      <div>
        <h3 className="font-display text-xl">{t("numerology.learningPath.title")}</h3>
        <p className="text-muted-foreground text-sm">{t("numerology.learningPath.subtitle")}</p>
      </div>
      <ol className="border-border/50 space-y-3 border-l pl-5">
        {modules.map((m) => (
          <li key={m.id} className="relative">
            <span className="border-gold/30 bg-gold/10 text-gold absolute -left-[1.4rem] mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold">
              {m.order}
            </span>
            <p className="text-sm font-medium">{m.title}</p>
          </li>
        ))}
      </ol>
      <Button asChild variant="secondary" size="sm">
        <Link href="#learning">{t("numerology.learningPath.start")}</Link>
      </Button>
    </Surface>
  );
}

export default function NumerologyPage() {
  const t = useT();
  const [apiData, setApiData] = useState<NumerologyApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<NumberProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [calcResult, setCalcResult] = useState<
    { mulank: number; bhagyank: number; trace: ReturnType<typeof calculationTrace> } | undefined
  >();

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

  function openNumberDetail(profile: NumberProfile) {
    setSelectedProfile(profile);
    setDetailOpen(true);
  }

  function closeNumberDetail() {
    setDetailOpen(false);
    setSelectedProfile(null);
  }

  const initialDob = useMemo(() => {
    if (!apiData?.hasDob || !apiData.day || !apiData.month || !apiData.year) return null;
    return {
      day: apiData.day,
      month: apiData.month,
      year: apiData.year,
      display: apiData.dateDisplay || "",
    };
  }, [apiData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-10 w-48 rounded-full" />
        <SkeletonScope label="Loading numerology">
          <PanelSkeleton lines={3} />
          <PanelSkeleton lines={4} className="mt-4" />
          <PanelSkeleton lines={4} className="mt-4" />
        </SkeletonScope>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Astrology"
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

  const hasDob = apiData?.hasDob ?? false;
  const mulank = calcResult?.mulank ?? apiData?.mulank;
  const bhagyank = calcResult?.bhagyank ?? apiData?.bhagyank;
  const mulankProfile = mulank ? getNumberProfile(mulank as NumberId) : null;
  const bhagyankProfile = bhagyank ? getNumberProfile(bhagyank as NumberId) : null;
  const trace =
    calcResult?.trace ??
    (initialDob ? calculationTrace(initialDob.day, initialDob.month, initialDob.year) : undefined);

  return (
    <div className="relative min-w-0 space-y-8 pb-8 sm:space-y-10 sm:pb-10">
      <PageHeader
        eyebrow="Astrology"
        title={t("numerology.pageTitle")}
        description={t("numerology.pageDescription")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.birthDetails}>Birth details</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.kundli}>{t("numerology.kundliConnection.openKundli")}</Link>
            </Button>
          </div>
        }
      />

      {!hasDob ? (
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

      {hasDob && mulank && bhagyank ? (
        <>
          {/* === Primary cards: Mulank + Bhagyank === */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl">{t("numerology.yourNumbers")}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Surface className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <NumberPlanetIcon
                    number={mulank}
                    planet={mulankProfile?.planet || ""}
                    size="lg"
                  />
                  <Badge variant="secondary">{t("numerology.labels.traditional")}</Badge>
                </div>
                <h3 className="font-display text-2xl">
                  {t("numerology.mulank.nameFull")} — {mulank}
                </h3>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {mulankProfile?.planet} · {mulankProfile?.keyword}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {mulankProfile?.coreTendencies.find((b) => b.label === "contemporary")?.body ||
                    mulankProfile?.coreEnergy}
                </p>
                <a
                  href="#mulank-detail"
                  className="text-gold decoration-gold/40 text-sm font-medium underline underline-offset-2"
                >
                  {t("numerology.mulank.name")} — full profile
                </a>
              </Surface>

              <Surface className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <NumberPlanetIcon
                    number={bhagyank}
                    planet={bhagyankProfile?.planet || ""}
                    size="lg"
                  />
                  <Badge variant="secondary">{t("numerology.labels.traditional")}</Badge>
                </div>
                <h3 className="font-display text-2xl">
                  {t("numerology.bhagyank.nameFull")} — {bhagyank}
                </h3>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {bhagyankProfile?.planet} · {bhagyankProfile?.keyword}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {bhagyankProfile?.coreTendencies.find((b) => b.label === "contemporary")?.body ||
                    bhagyankProfile?.coreEnergy}
                </p>
                <a
                  href="#bhagyank-detail"
                  className="text-gold decoration-gold/40 text-sm font-medium underline underline-offset-2"
                >
                  {t("numerology.bhagyank.name")} — full profile
                </a>
              </Surface>
            </div>
          </section>

          {/* === DOB + Calculation explanation === */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-xl">{t("numerology.dobSection.title")}</h2>
              <p className="text-muted-foreground text-sm">
                {t("numerology.dobSection.label")}:{" "}
                <span className="font-medium">
                  {apiData?.dateDisplay || trace?.dateDisplay || "—"}
                </span>
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="calculation" className="border-0">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-muted-foreground text-sm">
                    {t("numerology.howCalculated.title")}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <p>
                      <span className="font-medium">{t("numerology.mulank.name")}:</span>{" "}
                      {trace?.mulank.steps}
                    </p>
                    <p>
                      <span className="font-medium">{t("numerology.bhagyank.name")}:</span>{" "}
                      {trace?.bhagyank.steps}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("numerology.howCalculated.note")}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* === Mulank full detail === */}
          {mulankProfile ? (
            <section id="mulank-detail" className="space-y-4">
              <KnowledgeLabelBadge label="traditional" />
              <Surface className="space-y-1">
                <h2 className="font-display text-2xl">
                  {t("numerology.mulank.nameFull")} — {mulank}
                </h2>
              </Surface>
              <NumberDetailView profile={mulankProfile} />
            </section>
          ) : null}

          {/* === Bhagyank full detail === */}
          {bhagyankProfile ? (
            <section id="bhagyank-detail" className="space-y-4">
              <KnowledgeLabelBadge label="traditional" />
              <Surface className="space-y-1">
                <h2 className="font-display text-2xl">
                  {t("numerology.bhagyank.nameFull")} — {bhagyank}
                </h2>
              </Surface>
              <NumberDetailView profile={bhagyankProfile} />
            </section>
          ) : null}

          {/* === Number pair / combination === */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl">
                <Star className="text-gold mr-2 mb-1 h-4 w-4" />
                {t("numerology.combination.title")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("numerology.combination.subtitle")}
              </p>
            </div>
            <Surface className="space-y-4">
              <div className="flex items-center gap-4">
                <NumberPlanetIcon number={mulank} planet={mulankProfile?.planet || ""} size="lg" />
                <div className="text-2xl">+</div>
                <NumberPlanetIcon
                  number={bhagyank}
                  planet={bhagyankProfile?.planet || ""}
                  size="lg"
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm leading-relaxed">
                  {apiData?.combination?.interaction ||
                    getCombinationOrGeneric(mulank as NumberId, bhagyank as NumberId)?.interaction}
                </p>
                {!apiData?.combination?.defined ? (
                  <div className="border-border/50 rounded-xl border p-3">
                    <p className="text-muted-foreground text-sm">
                      {t("numerology.combination.undefined")}
                    </p>
                  </div>
                ) : null}
              </div>
            </Surface>
          </section>

          {/* === Numerology × Kundli === */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl">{t("numerology.kundliConnection.title")}</h2>
              <p className="text-muted-foreground text-sm">
                {t("numerology.kundliConnection.subtitle")}
              </p>
            </div>
            <Surface className="space-y-4">
              {apiData?.kundli?.hasChart ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs tracking-wide uppercase">
                        {t("numerology.kundliConnection.mulankPlanet")}
                      </p>
                      <p className="font-medium">
                        {apiData.kundli.mulankPlanetPlacement?.planet ||
                          apiData.mulankPlanet ||
                          "—"}
                      </p>
                      {apiData.kundli.mulankPlanetPlacement ? (
                        <KundliContextCard
                          planet={apiData.kundli.mulankPlanetPlacement.planet}
                          placement={apiData.kundli.mulankPlanetPlacement}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Planet not found in your chart
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs tracking-wide uppercase">
                        {t("numerology.kundliConnection.bhagyankPlanet")}
                      </p>
                      <p className="font-medium">
                        {apiData.kundli.bhagyankPlanetPlacement?.planet ||
                          apiData.bhagyankPlanet ||
                          "—"}
                      </p>
                      {apiData.kundli.bhagyankPlanetPlacement ? (
                        <KundliContextCard
                          planet={apiData.kundli.bhagyankPlanetPlacement.planet}
                          placement={apiData.kundli.bhagyankPlanetPlacement}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Planet not found in your chart
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {t("numerology.kundliConnection.disclaimer")}
                  </p>
                </>
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
            </Surface>
          </section>

          {/* === Activate Your Number === */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl">{t("numerology.activate.title")}</h2>
              <p className="text-muted-foreground text-sm">{t("numerology.activate.subtitle")}</p>
            </div>
            <Surface className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <KnowledgeLabelBadge label="contemporary" />
                <p className="text-sm font-medium">
                  {t("numerology.activate.mulankGuidance", { number: mulank })}
                </p>
                {mulankProfile ? (
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {mulankProfile.remedies.map((r, i) => (
                      <li key={`mulank-remedy-${i}`}>· {r.body}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="space-y-2">
                <KnowledgeLabelBadge label="contemporary" />
                <p className="text-sm font-medium">
                  {t("numerology.activate.bhagyankGuidance", { number: bhagyank })}
                </p>
                {bhagyankProfile ? (
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {bhagyankProfile.strengths.map((s, i) => (
                      <li key={`bhagyank-strength-${i}`}>· {s.body}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Surface>
          </section>

          {/* === Explore Numbers === */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl">{t("numerology.numberCards.title")}</h2>
              <p className="text-muted-foreground text-sm">
                {t("numerology.numberCards.subtitle")}
              </p>
            </div>
            <NumberGrid onNumberClick={openNumberDetail} />
          </section>

          {/* === Number Detail Drawer === */}
          <Sheet
            open={detailOpen}
            onOpenChange={(open) => {
              if (!open) closeNumberDetail();
            }}
          >
            <SheetContent
              side="bottom"
              className="border-border/50 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden rounded-t-3xl p-0 md:m-6 md:ml-auto md:h-auto md:max-w-lg md:rounded-2xl"
            >
              {selectedProfile ? (
                <NumberDetailView profile={selectedProfile} />
              ) : (
                <SheetHeader>
                  <SheetTitle>{t("numerology.numberCards.title")}</SheetTitle>
                </SheetHeader>
              )}
            </SheetContent>
          </Sheet>

          {/* === Master Numbers === */}
          <MasterNumbersSection />

          {/* === Number Calculator === */}
          <section className="space-y-4">
            <h2 className="font-display text-xl">{t("numerology.calculator.title")}</h2>
            <NumerologyCalculator
              initialDob={initialDob}
              onCalculated={(result) => setCalcResult(result)}
            />
          </section>
        </>
      ) : null}

      {/* === Learning Mode === */}
      <LearningSection />

      {/* === AI Numerology Guide === */}
      <AIGuideSection mulank={mulank} bhagyank={bhagyank} />

      {/* === Knowledge notice === */}
      <Surface className="space-y-2">
        <p className="font-display text-sm">{t("numerology.knowledgeNotice.title")}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("numerology.knowledgeNotice.body")}
        </p>
      </Surface>
    </div>
  );
}
