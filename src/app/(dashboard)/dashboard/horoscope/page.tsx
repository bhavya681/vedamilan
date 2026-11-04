"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MoonStar,
  Orbit,
  Sparkles,
  Sunrise,
  Sunset,
  type LucideIcon,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AI_GURU_NAME, AiGuruAvatar, AiGuruLabel } from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { DashaPeriodBadges } from "@/features/horoscope/components/dasha-period-display";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type PanchangaSnapshot = {
  tithi: { number: number; name: string; progress: number; paksha?: string };
  nakshatra: { name: string; lord: string };
  yoga: { name: string; nature?: string };
  karana: { name: string };
  sunrise: { time: string };
  sunset: { time: string };
  rahuKalam: { start: string; end: string };
};

function AlmanacRow({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="border-border/50 bg-muted/15 rounded-xl border p-3">
      <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <p className="font-display mt-1 text-base leading-snug">{value}</p>
      {note ? <p className="text-muted-foreground mt-0.5 text-[11px]">{note}</p> : null}
    </div>
  );
}

export default function HoroscopePage() {
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [maha, setMaha] = useState<string | null>(null);
  const [antar, setAntar] = useState<string | null>(null);
  const [panchanga, setPanchanga] = useState<PanchangaSnapshot | null>(null);
  const [gocharHighlights, setGocharHighlights] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [chartRes, gocharRes, panchangaRes, aiRes] = await Promise.all([
        fetch("/api/horoscope").then((r) => r.json()),
        fetch("/api/gochar")
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/panchanga")
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "HOROSCOPE",
            message:
              "Give a concise daily reading based on my stored chart, current Mahadasha and Antardasha, today's panchanga, and live gochar. Prioritise one practical theme. Do not invent meters, planet positions, or event dates.",
          }),
        }),
      ]);
      const chart = chartRes;
      const ai = await aiRes.json();
      if (!chart.success || !chart.data?.horoscope) {
        setError("Generate your kundli to unlock daily horoscope guidance.");
        setLoading(false);
        return;
      }
      const h = chart.data.horoscope;
      setMoonSign(h.moonSign);
      setMaha(chart.data.dasha?.currentMaha ?? null);
      setAntar(chart.data.dasha?.currentAntar ?? null);
      setGocharHighlights(gocharRes?.success ? gocharRes.data?.highlights || [] : []);
      setPanchanga(panchangaRes?.success ? panchangaRes.data : null);
      setSummary(
        ai.success
          ? ai.data.answer
          : `Moon in ${h.moonSign}. Review kundli and AI Insights for deeper guidance.`,
      );
      setLoading(false);
    }
    void load().catch(() => {
      setError("Failed to load horoscope");
      setLoading(false);
    });
  }, []);

  const tithiPct = Math.round((panchanga?.tithi.progress || 0) * 100);
  const tithiLabel = panchanga
    ? `${panchanga.tithi.paksha || ""} ${panchanga.tithi.name}`.trim()
    : null;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Daily · chart + panchanga + gochar"
        title="Daily horoscope"
        description="A grounded daily read from your natal Moon, current Vimshottari period, today's panchanga, and live Gochar. Weekly and monthly planning lives under Period predictions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.predictions}>Week & month</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyPanchanga}>Panchanga</Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <GlassCard glow className="overflow-hidden p-0">
            <div className="border-border/40 from-card via-card to-muted/25 relative border-b bg-gradient-to-r px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_14%,transparent),transparent_55%)]" />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AiGuruAvatar size="sm" />
                    <AiGuruLabel />
                  </div>
                  <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
                    {moonSign ? `Moon in ${moonSign}` : "…"}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DashaPeriodBadges maha={maha} antar={antar} />
                    {tithiLabel ? <Badge variant="outline">{tithiLabel}</Badge> : null}
                  </div>
                </div>
                <Badge className="bg-primary/12 text-foreground hover:bg-primary/12 border-0">
                  Daily
                </Badge>
              </div>
            </div>

            <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)]">
              <div className="min-w-0">
                <p className="text-muted-foreground mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  {AI_GURU_NAME} interpretation
                </p>
                {loading || !summary ? (
                  <div className="space-y-3" role="status" aria-label="Preparing reading">
                    <PanelSkeleton lines={5} className="border-0 p-0 shadow-none" />
                  </div>
                ) : (
                  <GuruMarkdown content={summary} tone="assistant" />
                )}
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={routes.aiInsights}>Ask a follow-up</Link>
                </Button>
              </div>

              <div className="min-w-0 space-y-3">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Today&apos;s panchanga
                </p>
                {panchanga ? (
                  <div className="grid grid-cols-2 gap-2">
                    <AlmanacRow
                      icon={MoonStar}
                      label="Tithi"
                      value={tithiLabel || "—"}
                      note={`${tithiPct}% elapsed`}
                    />
                    <AlmanacRow
                      icon={Sparkles}
                      label="Nakshatra"
                      value={panchanga.nakshatra.name}
                      note={`Lord ${panchanga.nakshatra.lord}`}
                    />
                    <AlmanacRow
                      icon={CalendarDays}
                      label="Yoga"
                      value={panchanga.yoga.name}
                      note={panchanga.yoga.nature ? `${panchanga.yoga.nature} yoga` : undefined}
                    />
                    <AlmanacRow
                      icon={Clock}
                      label="Rahu Kalam"
                      value={`${panchanga.rahuKalam.start} – ${panchanga.rahuKalam.end}`}
                      note="Avoid new starts"
                    />
                    <AlmanacRow icon={Sunrise} label="Sunrise" value={panchanga.sunrise.time} />
                    <AlmanacRow icon={Sunset} label="Sunset" value={panchanga.sunset.time} />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Panchanga appears when your place and date resolve.
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  <Orbit className="h-3.5 w-3.5" />
                  Live gochar
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Current transits against your natal chart — context, not a forecast by itself.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.gochar}>Open Gochar</Link>
              </Button>
            </div>
            {gocharHighlights.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {gocharHighlights.map((h) => (
                  <li
                    key={h}
                    className="border-border/50 bg-muted/15 rounded-xl border px-3 py-2 text-sm"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Live transit highlights appear when Gochar can be calculated.
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
