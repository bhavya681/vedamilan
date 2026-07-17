"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type CompatReport = {
  _id?: string;
  totalGuna?: number;
  maxGuna?: number;
  overallScore?: number;
  calculatedAt?: string;
};

type Payment = {
  _id?: string;
  amountInr?: number;
  status?: string;
  planCode?: string;
  createdAt?: string;
};

export default function DownloadsPage() {
  const [reports, setReports] = useState<CompatReport[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/compatibility").then((r) => r.json()),
      fetch("/api/billing/invoices").then((r) => r.json()),
    ]).then(([compat, invoices]) => {
      if (compat.success) setReports(compat.data.reports || []);
      if (invoices.success) setPayments(invoices.data.payments || []);
    });
  }, []);

  const items = [
    ...reports.map((r) => ({
      key: `c-${r._id}`,
      title: `Compatibility ${r.totalGuna}/${r.maxGuna}`,
      meta: r.calculatedAt ? new Date(r.calculatedAt).toLocaleDateString() : "Ready",
      href: `${routes.compatibilityReport}?id=${r._id}`,
    })),
    ...payments.map((p) => ({
      key: `p-${p._id}`,
      title: `Invoice ₹${p.amountInr ?? 0} · ${p.planCode || "Plan"}`,
      meta: p.status || "Recorded",
      href: routes.invoices,
    })),
  ];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Downloads"
        description="Open your saved dossiers and receipts"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.reports}>Reports hub</Link>
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="Nothing to download yet"
          description="Generate a kundli compatibility report or complete a premium checkout."
          action={
            <Button asChild>
              <Link href={routes.compatibility}>Start with compatibility</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <GlassCard key={item.key} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground text-xs">{item.meta}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={item.href}>Open</Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
