"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function CompatibilityPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [candidateUserId, setCandidateUserId] = useState("");
  const [active, setActive] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/compatibility");
    const json = await res.json();
    if (json.success) setReports(json.data.reports || []);
    else setError(json.error?.message || "Failed to load");
  }

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("candidate");
    if (candidate) setCandidateUserId(candidate);
    void load().catch(() => setError("Failed to load compatibility"));
  }, []);

  async function runCompare(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Compatibility requires both kundli charts");
      return;
    }
    setActive(json.data.report);
    await load();
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility"
        description="Ashta Koota scoring from deterministic rule engines"
        actions={
          <Button asChild variant="secondary">
            <Link
              href={
                active?._id
                  ? `${routes.compatibilityReport}?id=${active._id}`
                  : routes.compatibilityReport
              }
            >
              Open report view
            </Link>
          </Button>
        }
      />

      <GlassCard className="max-w-xl space-y-3">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={runCompare}>
          <Input
            value={candidateUserId}
            onChange={(e) => setCandidateUserId(e.target.value)}
            placeholder="Candidate user id"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Scoring…" : "Run guna milan"}
          </Button>
        </form>
        <p className="text-muted-foreground text-xs">
          Both profiles must have generated kundli charts. AI never calculates these scores.
        </p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </GlassCard>

      {active ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Total Guna</p>
            <p className="font-display mt-2 text-4xl">
              {active.totalGuna}/{active.maxGuna}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">Overall {active.overallScore}%</p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Manglik</p>
            <p className="mt-2 text-sm">{active.manglikCompatibility}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Strengths</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(active.strengths || []).slice(0, 4).map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {(active.gunaBreakdown || []).map((g) => (
                <div key={g.koota} className="border-border/50 rounded-xl border p-3">
                  <p className="text-muted-foreground text-[10px] uppercase">{g.koota}</p>
                  <p className="font-display text-rose text-2xl">
                    {g.score}
                    <span className="text-muted-foreground text-sm">/{g.max}</span>
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}

      <GlassCard>
        <p className="font-display text-xl">Recent reports</p>
        <div className="mt-4 space-y-2">
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports yet.</p>
          ) : (
            reports.map((r) => (
              <button
                key={String(r._id)}
                type="button"
                className="hover:bg-muted/40 border-border/40 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm"
                onClick={() => setActive(r)}
              >
                <span>
                  {r.userAId?.slice(0, 6)}… × {r.userBId?.slice(0, 6)}…
                </span>
                <span className="font-display text-lg">
                  {r.totalGuna}/{r.maxGuna}
                </span>
              </button>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
