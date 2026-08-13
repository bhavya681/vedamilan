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

export default function AstrologyRemediesPage() {
  const [data, setData] = useState<{ themes: RemedyTheme[]; disclaimer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/lal-kitab")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json?.error?.message || "Generate your kundli to open remedies.");
          return;
        }
        const d = json.data as {
          remedies?: RemedyTheme[];
          disclaimer?: string;
        };
        setData({
          themes: d.remedies || [],
          disclaimer: d.disclaimer || "Traditional guidance — not medical or legal advice.",
        });
      })
      .catch(() => setError("Failed to load remedies"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Personalized guidance"
        title="Remedies & Sadhana"
        description="Traditional practices mapped from your chart — mantras, charity, discipline, and devotional themes. Never fear-based; always respectful."
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

      {loading ? <PanelSkeleton lines={6} /> : null}
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

      {data ? (
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

          {data.themes.length === 0 ? (
            <EmptyState
              title="No priority upayas"
              description="No challenging placements required priority remedy cards. Review yogas for supportive practices."
            />
          ) : (
            <div className="space-y-3">
              {data.themes.map((theme) => (
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
          <p className="text-muted-foreground text-xs leading-relaxed">{data.disclaimer}</p>
        </>
      ) : null}
    </div>
  );
}
