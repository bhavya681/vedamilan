"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type Section = {
  id: string;
  title: string;
  points: string[];
  calculation: string[];
};

type Lab = {
  sections: Section[];
  agreements: string[];
  differences: string[];
  synthesis: string;
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

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Multi-system partnership read"
        title="Marriage Intelligence"
        description="Parashari, Jaimini, Darakaraka, Navamsa, dasha, transit, and BNN — shown as independent layers. No single indicator decides marriage."
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
