"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { Receipt } from "lucide-react";

type Payment = {
  _id: string;
  provider: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  invoiceUrl?: string | null;
  createdAt?: string;
};

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/billing/invoices")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load invoices");
          return;
        }
        setPayments(json.data.payments || []);
      })
      .catch(() => setError("Failed to load invoices"));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Payment history"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.payments}>Back to billing</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-8 w-8" />}
          title="No invoices yet"
          description="Successful payments appear here with provider references."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <GlassCard
              key={p._id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {p.provider} · {(p.amount / 100).toFixed(2)} {p.currency}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {p.providerPaymentId}
                  {p.createdAt ? ` · ${new Date(p.createdAt).toLocaleString("en-IN")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{p.paymentStatus}</Badge>
                {p.invoiceUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={p.invoiceUrl} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${routes.invoice}?id=${p._id}`}>Details</Link>
                  </Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
