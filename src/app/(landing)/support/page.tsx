import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Care"
        title="Support"
        description="Private help for accounts, reports, and consultations."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.contact}>Write to us</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="font-display text-xl">Email support</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Reach our care team for account access, billing, or report questions.
          </p>
          <a
            className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
            href={`mailto:${brand.supportEmail}`}
          >
            {brand.supportEmail}
          </a>
        </GlassCard>
        <GlassCard>
          <h2 className="font-display text-xl">Help articles</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Browse guides for kundli, compatibility, and premium features.
          </p>
          <Button asChild className="mt-4" variant="secondary">
            <Link href={routes.help}>Open Help Center</Link>
          </Button>
        </GlassCard>
      </div>
    </MarketingPageShell>
  );
}
