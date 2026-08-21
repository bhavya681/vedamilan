import Link from "next/link";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { mockPricingPlans } from "@/lib/mock/vedamilan";
import { cn } from "@/lib/utils/cn";

export function PricingSection() {
  return (
    <LandingSection id="pricing" className="scroll-mt-24">
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          Membership
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl">
          Plans with intention
        </h2>
        <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
          Transparent pricing for every stage. Upgrade anytime as your search deepens.
        </p>
      </FadeIn>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {mockPricingPlans.map((plan, index) => {
          const featured = plan.highlighted;
          return (
            <FadeIn
              key={plan.name}
              delay={0.06 * index}
              className={cn(
                "h-full",
                featured && "order-first md:col-span-2 lg:order-none lg:col-span-1",
              )}
            >
              <article
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 md:p-7",
                  featured
                    ? "border-white/12 bg-[#14110E] text-[#F7F1E3]"
                    : "border-border/60 bg-card",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "text-[10px] tracking-[0.18em] uppercase",
                      featured ? "text-[#F7F1E3]/50" : "text-muted-foreground",
                    )}
                  >
                    0{index + 1}
                  </p>
                  {featured ? (
                    <p className="text-[10px] tracking-[0.18em] text-[#D4AF37] uppercase">
                      Most chosen
                    </p>
                  ) : null}
                </div>

                <h3 className="font-display mt-4 text-2xl tracking-tight sm:text-3xl">{plan.name}</h3>
                <p
                  className={cn(
                    "mt-2 max-w-md text-sm leading-relaxed",
                    featured ? "text-[#F7F1E3]/72" : "text-muted-foreground",
                  )}
                >
                  {plan.description}
                </p>

                <p className="font-display mt-6 text-4xl leading-none tabular-nums sm:text-5xl">
                  {plan.price}
                  <span
                    className={cn(
                      "ml-1 font-sans text-sm font-normal tracking-normal",
                      featured ? "text-[#F7F1E3]/55" : "text-muted-foreground",
                    )}
                  >
                    {plan.period}
                  </span>
                </p>

                <ul className="mt-8 flex-1 space-y-0">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-center gap-3 border-t py-3 text-sm",
                        featured ? "border-white/10" : "border-border/50",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn("h-px w-4 shrink-0", featured ? "bg-[#D4AF37]" : "bg-primary")}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="mt-8 h-12 w-full"
                  variant={featured ? "default" : "outline"}
                >
                  <Link href={routes.register}>Choose {plan.name}</Link>
                </Button>
              </article>
            </FadeIn>
          );
        })}
      </div>
    </LandingSection>
  );
}
