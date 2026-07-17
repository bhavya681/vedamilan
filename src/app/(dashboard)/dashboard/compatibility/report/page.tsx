"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type Report = {
  _id?: string;
  totalGuna?: number;
  maxGuna?: number;
  overallScore?: number;
  manglikCompatibility?: string;
  gunaBreakdown?: Array<{ koota: string; score: number; max: number; note: string }>;
  strengths?: string[];
  challenges?: string[];
  userAId?: string;
  userBId?: string;
  calculatedAt?: string;
};

export default function CompatibilityReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    void fetch("/api/compatibility")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          setError(json.error?.message || "Failed to load report");
          return;
        }
        const reports: Report[] = json.data.reports || [];
        const found = id ? reports.find((r) => String(r._id) === id) : reports[0];
        if (!found) {
          setError("No compatibility report yet. Run guna milan first.");
          return;
        }
        setReport(found);
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load report");
      });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility Report"
        description="Shareable relationship dossier from deterministic Ashta Koota"
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={routes.compatibility}>All reports</Link>
            </Button>
            {report?.userBId ? (
              <Button asChild variant="outline">
                <Link href={`${routes.matchProfile}?id=${report.userBId}`}>View match</Link>
              </Button>
            ) : null}
          </>
        }
      />
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      {error ? (
        <EmptyState
          title="No report yet"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.compatibility}>Run compatibility</Link>
            </Button>
          }
        />
      ) : null}
      {report ? (
        <>
          <GlassCard glow>
            <h2 className="font-display text-2xl sm:text-3xl">
              {report.userAId?.slice(0, 8)}… × {report.userBId?.slice(0, 8)}…
            </h2>
            <p className="text-muted-foreground mt-2">
              Total Guna {report.totalGuna}/{report.maxGuna} · Overall {report.overallScore}% ·
              Manglik {report.manglikCompatibility}
            </p>
            <p className="mt-6 text-sm leading-relaxed">
              Scores come from the Ashta Koota rule engine. AI may explain this dossier but never
              recalculates guna or manglik status.
            </p>
            {(report.strengths || []).length ? (
              <div className="mt-6">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(report.strengths || []).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(report.challenges || []).length ? (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Pacing notes
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(report.challenges || []).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button asChild className="mt-6" variant="secondary">
              <Link href={routes.aiInsights}>Ask AI to explain</Link>
            </Button>
          </GlassCard>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(report.gunaBreakdown || []).map((g) => (
              <GlassCard key={g.koota}>
                <p className="text-muted-foreground text-[10px] uppercase">{g.koota}</p>
                <p className="font-display text-rose mt-1 text-2xl">
                  {g.score}
                  <span className="text-muted-foreground text-sm">/{g.max}</span>
                </p>
                <p className="text-muted-foreground mt-2 text-xs">{g.note}</p>
              </GlassCard>
            ))}
          </div>
          <Badge variant="outline">
            Calculated{" "}
            {report.calculatedAt ? new Date(report.calculatedAt).toLocaleString() : "recently"}
          </Badge>
        </>
      ) : null}
    </div>
  );
}
