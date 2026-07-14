"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function PaymentSuccessPage() {
  return (
    <GlassCard className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="font-display text-3xl">Payment successful</h1>
      <p className="text-muted-foreground text-sm">
        Your subscription is activating. Premium features unlock immediately after webhook/verify
        confirmation.
      </p>
      <div className="flex justify-center gap-2">
        <Button asChild>
          <Link href={routes.premium}>Go to Premium</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.invoices}>View invoices</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
