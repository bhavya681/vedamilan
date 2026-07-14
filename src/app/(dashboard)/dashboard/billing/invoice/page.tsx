"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Payment = {
  _id: string;
  provider: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  createdAt?: string;
};

export default function InvoiceDetailPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    void fetch("/api/billing/invoices")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const found = (json.data.payments || []).find((p: Payment) => p._id === id);
        setPayment(found || null);
      });
  }, [id]);

  return (
    <GlassCard className="mx-auto max-w-lg space-y-4">
      <h1 className="font-display text-3xl">Invoice</h1>
      {payment ? (
        <>
          <p className="text-sm">Provider: {payment.provider}</p>
          <p className="text-sm">Reference: {payment.providerPaymentId}</p>
          <p className="text-sm">
            Amount: {(payment.amount / 100).toFixed(2)} {payment.currency}
          </p>
          <p className="text-sm">Status: {payment.paymentStatus}</p>
          <p className="text-muted-foreground text-xs">
            {payment.createdAt ? new Date(payment.createdAt).toLocaleString("en-IN") : ""}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Invoice not found.</p>
      )}
      <Button asChild variant="outline">
        <Link href={routes.invoices}>Back</Link>
      </Button>
    </GlassCard>
  );
}
