import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we protect birth details, profiles, and conversations."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.cookies}>Cookie Policy</Link>
          </Button>
        }
      />
      <GlassCard className="mx-auto max-w-3xl space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          VedaMilan AI treats birth data, photos, and messages as sensitive. We use encryption in
          transit, role-based access, and soft-delete patterns so members can request removal.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          AI scoring uses profile and chart signals to produce explainable recommendations. We do
          not sell personal data. Analytics are aggregated whenever possible.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Privacy requests:{" "}
          <a className="text-primary hover:underline" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>
        </p>
      </GlassCard>
    </MarketingPageShell>
  );
}
