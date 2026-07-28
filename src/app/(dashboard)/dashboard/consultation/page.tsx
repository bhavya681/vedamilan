"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function ConsultationPage() {
  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Consultation"
        description="Human experts join soon — AI coaching is ready now"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.aiInsights}>AI Insights</Link>
          </Button>
        }
      />
      <EmptyState
        title="Expert booking coming soon"
        description="Meanwhile, use AI Insights for explain-only guidance grounded in your real kundli and guna scores."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href={routes.aiInsights}>Talk to AI coach</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.premium}>View premium</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Kundli review", "Marriage timing", "Family compatibility"].map((topic) => (
          <GlassCard key={topic}>
            <h2 className="font-display text-lg">{topic}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Waitlist for verified acharyas. Your chart data is already ready to share securely.
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
