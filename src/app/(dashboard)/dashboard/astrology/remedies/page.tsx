"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type RemedyTheme = {
  planetaryFactor: string;
  observedTheme: string;
  possibleRemedy: string;
  reason: string;
  durationPractice: string;
};

type KarmicTheme = {
  planet: string;
  pastLifeIndication: string;
  doThis: string[];
  avoidThis: string[];
  traditionalSource: string;
};

type PastLifeDeeds = {
  themes: KarmicTheme[];
  overallGuidance: string;
  disclaimer: string;
};

export default function AstrologyRemediesPage() {
  const [remedies, setRemedies] = useState<{ themes: RemedyTheme[]; disclaimer: string } | null>(
    null,
  );
  const [karmic, setKarmic] = useState<PastLifeDeeds | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/lal-kitab").then((r) => r.json()),
      fetch("/api/astrology/past-life-deeds").then((r) => r.json()),
    ])
      .then(([remediesJson, karmicJson]) => {
        if (!mounted) return;
        if (!remediesJson.success) {
          setError(remediesJson?.error?.message || "Generate your kundli to open remedies.");
        } else {
          const d = remediesJson.data as {
            remedies?: RemedyTheme[];
            disclaimer?: string;
          };
          setRemedies({
            themes: d.remedies || [],
            disclaimer: d.disclaimer || "Traditional guidance — not medical or legal advice.",
          });
        }
        if (!karmicJson.success) {
          // karmic is optional — don't block the whole page
          setKarmic(null);
        } else {
          setKarmic(karmicJson.data);
        }
      })
      .catch(() => {
        if (mounted) setError("Failed to load remedies");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Personalized guidance"
        title="Remedies & Sadhana"
        description="Traditional practices mapped from your chart — mantras, charity, discipline, devotional themes, and karmic guidance. Never fear-based; always respectful."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.astrologyYogas}>Yogas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.aiInsights}>Ask AI Guru</Link>
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
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {remedies ? (
        <>
          <section className="border-border/50 from-muted/35 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-5 sm:p-6">
            <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase">
              Sadhana guidance
            </p>
            <p className="font-display mt-2 text-xl leading-snug sm:text-2xl">
              Practices aligned with your planetary picture
            </p>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
              These recommendations are derived from your stored chart. They are traditional
              suggestions, not guarantees. For personalized practice, guidance from a qualified
              practitioner may be appropriate.
            </p>
          </section>

          {remedies.themes.length === 0 ? (
            <EmptyState
              title="No priority upayas"
              description="No challenging placements required priority remedy cards. Review yogas for supportive practices."
            />
          ) : (
            <div className="space-y-3">
              {remedies.themes.map((theme) => (
                <GlassCard key={theme.planetaryFactor} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{theme.planetaryFactor}</Badge>
                    <Badge variant="outline">Not medical advice</Badge>
                    <h2 className="font-display w-full text-lg sm:w-auto">{theme.observedTheme}</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Possible remedy
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{theme.possibleRemedy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Reason
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{theme.reason}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Duration / practice · {theme.durationPractice}
                  </p>
                </GlassCard>
              ))}
            </div>
          )}

          {karmic && karmic.themes.length > 0 ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl">Past Life Deeds</h2>
                <Badge variant="outline">Traditional interpretation</Badge>
              </div>
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                {karmic.overallGuidance}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {karmic.themes.map((theme) => (
                  <GlassCard key={theme.planet} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base sm:text-lg">{theme.planet}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        Karmic
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Past-life indication
                      </p>
                      <p className="mt-1 text-xs leading-relaxed break-words">
                        {theme.pastLifeIndication}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Do this
                      </p>
                      <ul className="mt-1 space-y-1">
                        {theme.doThis.map((item) => (
                          <li key={item} className="text-xs leading-relaxed">
                            · {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                        Avoid this
                      </p>
                      <ul className="mt-1 space-y-1">
                        {theme.avoidThis.map((item) => (
                          <li key={item} className="text-destructive/80 text-xs leading-relaxed">
                            · {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-muted-foreground text-[10px] leading-relaxed break-words">
                      Source: {theme.traditionalSource}
                    </p>
                  </GlassCard>
                ))}
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed">{karmic.disclaimer}</p>
            </section>
          ) : null}

          <p className="text-muted-foreground text-xs leading-relaxed">{remedies.disclaimer}</p>
        </>
      ) : null}
    </div>
  );
}
