"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function PaymentFailurePage() {
  return (
    <GlassCard className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="font-display text-3xl">Payment unsuccessful</h1>
      <p className="text-muted-foreground text-sm">
        No charges were finalized. You can retry checkout or choose another provider.
      </p>
      <div className="flex justify-center gap-2">
        <Button asChild>
          <Link href={routes.payments}>Try again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.support}>Contact support</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
