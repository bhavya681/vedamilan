import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="Essential cookies for sessions, preferences, and secure access."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.privacy}>Privacy Policy</Link>
          </Button>
        }
      />
      <GlassCard className="mx-auto max-w-3xl space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          We use necessary cookies for authentication, theme preference, and fraud prevention.
          Optional analytics cookies help us understand which journeys feel confusing—never for
          marketplace retargeting spam.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You can clear cookies in your browser at any time. Signing out ends the active session
          cookie for this device.
        </p>
      </GlassCard>
    </MarketingPageShell>
  );
}
