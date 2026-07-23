import Link from "next/link";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { mockPricingPlans } from "@/lib/mock/vedamilan";

export function PricingSection() {
  return (
    <LandingSection id="pricing">
      <FadeIn>
        <SectionIntro
          eyebrow="Membership"
          title="Plans with intention"
          description="Transparent pricing for every stage. Upgrade anytime as your search deepens."
          align="center"
        />
      </FadeIn>
      <div className="mt-10 grid gap-4 sm:gap-6 lg:grid-cols-3">
        {mockPricingPlans.map((plan, index) => (
          <FadeIn key={plan.name} delay={index * 0.08}>
            <article
              className={`flex h-full flex-col rounded-2xl border p-5 sm:rounded-3xl sm:p-6 ${
                plan.highlighted
                  ? "border-primary/50 via-navy text-ivory shadow-dual before:bg-brand-dual relative overflow-hidden bg-gradient-to-br from-[#132844] to-[#0b1426] before:absolute before:inset-x-0 before:top-0 before:h-1 lg:scale-[1.02]"
                  : "border-border/60 bg-card/70"
              }`}
            >
              {plan.highlighted ? (
                <p className="text-gold mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Most chosen
                </p>
              ) : null}
              <h3 className="font-display text-2xl">{plan.name}</h3>
              <p
                className={`mt-2 text-sm ${plan.highlighted ? "text-ivory/75" : "text-muted-foreground"}`}
              >
                {plan.description}
              </p>
              <p className="font-display mt-6 text-4xl">
                {plan.price}
                <span className="font-sans text-base font-normal opacity-70">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className={plan.highlighted ? "text-gold" : "text-primary"} aria-hidden>
                      •
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href={routes.register}>Choose {plan.name}</Link>
              </Button>
            </article>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
