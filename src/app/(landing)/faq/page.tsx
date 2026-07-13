import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";
import { mockFaqs } from "@/lib/mock/vedamilan";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Clarity"
        title="FAQ"
        description="Answers with the same calm tone as the product."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.contact}>Still need help?</Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-3xl space-y-3">
        {mockFaqs.map((item) => (
          <GlassCard key={item.q}>
            <h2 className="font-display text-lg sm:text-xl">{item.q}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.a}</p>
          </GlassCard>
        ))}
      </div>
    </MarketingPageShell>
  );
}
