import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Agreements that protect members and the platform."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.privacy}>Privacy Policy</Link>
          </Button>
        }
      />
      <GlassCard className="mx-auto max-w-3xl space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          These demo Terms describe how members use VedaMilan AI for relationship intelligence,
          matchmaking, and Vedic reports.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Members agree to provide accurate birth details, respect the privacy of other members, and
          treat AI insights as guidance—not absolute destiny.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Premium features, consultations, and downloads are subject to the plan selected at
          checkout. Misuse, harassment, or fraudulent profiles may result in suspension.
        </p>
      </GlassCard>
    </MarketingPageShell>
  );
}
