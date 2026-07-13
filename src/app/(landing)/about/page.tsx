import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard, StatCard } from "@/components/ui/premium-cards";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow={brand.shortName}
        title="About"
        description="The story behind calm, premium relationship intelligence."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.register}>Join VedaMilan</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-2xl sm:text-3xl">Built for intentional unions</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
            {brand.description}
          </p>
          <div className="lotus-divider mt-8" />
          <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
            Designed for modern professionals and families who want clarity without fear-based
            astrology or marketplace noise.
          </p>
        </GlassCard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label="Members exploring" value="48k+" hint="India + NRI" tone="gold" />
          <StatCard
            label="Avg. compatibility clarity"
            value="87%"
            hint="Explainable scores"
            tone="ai"
          />
        </div>
      </div>
    </MarketingPageShell>
  );
}
