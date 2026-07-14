"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type Subscription = {
  planCode?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
} | null;

export default function PremiumPage() {
  const [subscription, setSubscription] = useState<Subscription>(null);

  useEffect(() => {
    void fetch("/api/billing")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSubscription(json.data.subscription || null);
      });
  }, []);

  const isPremium =
    subscription &&
    subscription.planCode &&
    subscription.planCode !== "FREE" &&
    ["ACTIVE", "TRIALING"].includes(subscription.subscriptionStatus || "");

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Premium"
        description="Unlock full intelligence"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      <GlassCard glow>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-3xl">
            {isPremium ? subscription?.planCode : "Sangam Premium"}
          </h2>
          <Badge>{isPremium ? "Active" : "Upgrade available"}</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          {isPremium
            ? `Your plan is active until ${subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN") : "—"}.`
            : "You are on the recommended path for full relationship intelligence. Upgrade to unlock unlimited matches, reports, and timing guidance."}
        </p>
        <div className="mt-6 flex gap-2">
          <Button asChild>
            <Link href={routes.payments}>Manage billing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.pricing}>Compare plans</Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
