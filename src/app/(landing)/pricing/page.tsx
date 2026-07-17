import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";
import { mockPricingPlans } from "@/lib/mock/vedamilan";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Membership"
        title="Pricing"
        description="Transparent plans for every stage of your journey."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.home}>Back home</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {mockPricingPlans.map((plan) => (
          <GlassCard
            key={plan.name}
            glow={plan.highlighted}
            className={plan.highlighted ? "bg-navy text-ivory" : ""}
          >
            {plan.highlighted ? (
              <p className="text-gold mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Most chosen
              </p>
            ) : null}
            <h2 className="font-display text-2xl">{plan.name}</h2>
            <p
              className={`mt-2 text-sm ${plan.highlighted ? "text-ivory/75" : "text-muted-foreground"}`}
            >
              {plan.description}
            </p>
            <p className="font-display mt-6 text-4xl">
              {plan.price}
              <span className="text-base opacity-70">{plan.period}</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 w-full"
              variant={plan.highlighted ? "default" : "outline"}
            >
              <Link href={`${routes.register}?next=${encodeURIComponent(routes.premium)}`}>
                Choose {plan.name}
              </Link>
            </Button>
          </GlassCard>
        ))}
      </div>
    </MarketingPageShell>
  );
}
