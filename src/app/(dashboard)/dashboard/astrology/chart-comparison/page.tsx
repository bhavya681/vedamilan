"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/constants/routes";

type ChartComparisonPlanet = {
  planet: string;
  userSign: string;
  partnerSign: string;
  userHouse: number;
  partnerHouse: number;
  userNakshatra: string;
  partnerNakshatra: string;
  sameSign: boolean;
  sameHouse: boolean;
};

type ChartComparison = {
  userAscendant: string;
  partnerAscendant: string;
  userMoon: string;
  partnerMoon: string;
  userSun: string;
  partnerSun: string;
  userNakshatra: string;
  partnerNakshatra: string;
  planets: ChartComparisonPlanet[];
  dashaUser: { currentMaha: string | null; currentAntar: string | null };
  dashaPartner: { currentMaha: string | null; currentAntar: string | null };
  spiritualThemes: { user: string[]; partner: string[] };
  careerThemes: { user: string[]; partner: string[] };
  communicationThemes: { user: string[]; partner: string[] };
  emotionalThemes: { user: string[]; partner: string[] };
  jaiminiSignals?: string[];
  bnnOverlap?: string[];
};

export default function AstrologyChartComparisonPage() {
  const [data, setData] = useState<ChartComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState("");
  const [searched, setSearched] = useState(false);

  const handleCompare = async () => {
    if (!partnerId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/astrology/chart-comparison?partnerUserId=${encodeURIComponent(partnerId.trim())}`,
      );
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to compare charts");
        setData(null);
      } else {
        setData(json.data);
        setError(null);
      }
    } catch {
      setError("Failed to compare charts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Structural chart analysis"
        title="Chart Comparison"
        description="Compare two charts structurally — ascendant, Moon, Sun, planetary placements, dasha, and thematic emphasis. Not the same as matrimonial compatibility."
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

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1 space-y-2">
            <Label>Partner User ID</Label>
            <Input
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="Enter partner user ID"
            />
          </div>
          <Button
            onClick={handleCompare}
            disabled={loading || !partnerId.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? "Comparing..." : "Compare Charts"}
          </Button>
        </div>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading && searched ? <PanelSkeleton lines={6} /> : null}

      {!loading && data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Ascendant", user: data.userAscendant, partner: data.partnerAscendant },
              { label: "Moon", user: data.userMoon, partner: data.partnerMoon },
              { label: "Sun", user: data.userSun, partner: data.partnerSun },
              { label: "Nakshatra", user: data.userNakshatra, partner: data.partnerNakshatra },
            ].map((item) => (
              <GlassCard key={item.label} className="space-y-2">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {item.label}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">You</span>
                    <span className="text-sm font-medium">{item.user}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">Partner</span>
                    <span className="text-sm font-medium">{item.partner}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Planetary placements</h2>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Planet
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Your sign
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Partner sign
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Your house
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Partner house
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Your nakshatra
                    </th>
                    <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                      Partner nakshatra
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p) => (
                    <tr key={p.planet} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.planet}</td>
                      <td className="py-2">
                        {p.userSign}
                        {p.sameSign ? (
                          <Badge variant="secondary" className="ml-1 text-[10px]">
                            Same
                          </Badge>
                        ) : null}
                      </td>
                      <td className="py-2">{p.partnerSign}</td>
                      <td className="py-2">{p.userHouse}</td>
                      <td className="py-2">{p.partnerHouse}</td>
                      <td className="py-2 text-xs">{p.userNakshatra}</td>
                      <td className="py-2 text-xs">{p.partnerNakshatra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">Spiritual themes</h2>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  You: {data.spiritualThemes.user.join(", ") || "—"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Partner: {data.spiritualThemes.partner.join(", ") || "—"}
                </p>
              </div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">Career themes</h2>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  You: {data.careerThemes.user.join(", ") || "—"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Partner: {data.careerThemes.partner.join(", ") || "—"}
                </p>
              </div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">Communication themes</h2>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  You: {data.communicationThemes.user.join(", ") || "—"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Partner: {data.communicationThemes.partner.join(", ") || "—"}
                </p>
              </div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">Emotional themes</h2>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  You: {data.emotionalThemes.user.join(", ") || "—"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Partner: {data.emotionalThemes.partner.join(", ") || "—"}
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">Jaimini compatibility signals</h2>
              <p className="text-muted-foreground text-[10px]">
                Additional layer — does not replace Ashta Koota.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs">
                {(data.jaiminiSignals ?? []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="space-y-2">
              <h2 className="font-display text-lg">BNN pattern overlap</h2>
              <ul className="list-disc space-y-1 pl-4 text-xs">
                {(data.bnnOverlap ?? []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </GlassCard>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            This comparison is structural only. For relationship suitability, open Compatibility for
            Ashta Koota and Shukra Milan analysis.
          </p>
        </div>
      ) : !searched ? (
        <EmptyState
          title="Compare charts"
          description="Enter a partner user ID to compare ascendant, Moon, Sun, planetary placements, and thematic emphasis."
          action={
            <Button onClick={handleCompare} disabled={!partnerId.trim()}>
              Compare now
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
