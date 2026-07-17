"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type CompatReport = {
  _id?: string;
  totalGuna?: number;
  maxGuna?: number;
  overallScore?: number;
  userBId?: string;
  calculatedAt?: string;
};

type Payment = {
  _id?: string;
  amountInr?: number;
  status?: string;
  provider?: string;
  createdAt?: string;
  planCode?: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<CompatReport[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/compatibility").then((r) => r.json()),
      fetch("/api/billing/invoices").then((r) => r.json()),
    ])
      .then(([compat, invoices]) => {
        if (compat.success) setReports(compat.data.reports || []);
        if (invoices.success) setPayments(invoices.data.payments || []);
        if (!compat.success && !invoices.success) {
          setError("Could not load reports");
        }
      })
      .catch(() => setError("Could not load reports"));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Reports"
        description="Compatibility dossiers and billing receipts"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.compatibility}>New compatibility</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div>
        <h2 className="font-display text-xl">Compatibility</h2>
        <div className="mt-3 space-y-3">
          {reports.length === 0 ? (
            <EmptyState
              title="No compatibility reports"
              description="Run guna milan with a match who also has a kundli."
              action={
                <Button asChild>
                  <Link href={routes.matches}>Browse matches</Link>
                </Button>
              }
            />
          ) : (
            reports.map((r) => (
              <GlassCard
                key={String(r._id)}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">
                    Guna {r.totalGuna}/{r.maxGuna} · {r.overallScore}%
                  </p>
                  <p className="text-muted-foreground text-xs">
                    vs {r.userBId?.slice(0, 10)}… ·{" "}
                    {r.calculatedAt ? new Date(r.calculatedAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`${routes.compatibilityReport}?id=${r._id}`}>Open</Link>
                </Button>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl">Invoices</h2>
        <div className="mt-3 space-y-3">
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payments yet.</p>
          ) : (
            payments.map((p) => (
              <GlassCard
                key={String(p._id)}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">
                    ₹{p.amountInr ?? 0} · {p.planCode || "Plan"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {p.provider} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    p.status === "PAID" || p.status === "SUCCEEDED" ? "default" : "secondary"
                  }
                >
                  {p.status}
                </Badge>
              </GlassCard>
            ))
          )}
        </div>
        <Button asChild className="mt-4" variant="ghost" size="sm">
          <Link href={routes.invoices}>All invoices</Link>
        </Button>
      </div>
    </div>
  );
}
