"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { mockPricingPlans } from "@/lib/mock/vedamilan";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const chooseHref = `${routes.register}?next=${encodeURIComponent(routes.premium)}`;

export function PricingSection() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="pricing" className="scroll-mt-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <FadeIn className="max-w-xl">
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Membership
          </p>
          <h2 className="font-display mt-3 text-[1.75rem] tracking-tight text-balance sm:text-4xl md:text-5xl">
            Plans with intention
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
            Transparent pricing for every stage. Upgrade anytime as your search deepens.
          </p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
            Billed monthly
          </p>
        </FadeIn>
      </div>

      <div className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg:pt-4">
        {mockPricingPlans.map((plan, index) => {
          const featured = plan.highlighted;
          return (
            <motion.article
              key={plan.name}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={
                reduceMotion ? undefined : { y: featured ? -8 : -5, transition: { duration: 0.45, delay: 0, ease } }
              }
              transition={{ duration: 0.55, delay: 0.06 * index, ease }}
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6 md:p-7",
                featured
                  ? "z-10 border border-white/10 bg-[#14110E] text-[#F7F1E3] shadow-[0_28px_70px_rgba(20,17,14,0.22)] md:order-first md:col-span-2 lg:order-none lg:col-span-1 lg:-translate-y-2"
                  : "border-border/60 bg-card border",
              )}
            >
              {featured ? (
                <span className="absolute inset-x-0 top-0 h-px bg-[#D4AF37]" aria-hidden />
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    "text-[10px] tabular-nums tracking-[0.18em] uppercase",
                    featured ? "text-[#F7F1E3]/50" : "text-muted-foreground",
                  )}
                >
                  0{index + 1}
                </p>
                {featured ? (
                  <p className="rounded-full border border-[#D4AF37]/35 px-2.5 py-0.5 text-[10px] tracking-[0.16em] text-[#D4AF37] uppercase">
                    Most chosen
                  </p>
                ) : (
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                    Monthly
                  </p>
                )}
              </div>

              <h3 className="font-display mt-5 text-2xl tracking-tight sm:text-3xl">{plan.name}</h3>
              <p
                className={cn(
                  "mt-2 max-w-md text-sm leading-relaxed",
                  featured ? "text-[#F7F1E3]/72" : "text-muted-foreground",
                )}
              >
                {plan.description}
              </p>

              <p className="mt-7 flex items-baseline gap-1.5">
                <span className="font-display text-4xl leading-none tracking-tight tabular-nums sm:text-5xl">
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    featured ? "text-[#F7F1E3]/55" : "text-muted-foreground",
                  )}
                >
                  {plan.period}
                </span>
              </p>

              <ul className="mt-8 flex-1">
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
                      className={cn("h-px w-4 shrink-0", featured ? "bg-[#D4AF37]" : "bg-foreground/25")}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={cn(
                  "mt-8 h-12 w-full",
                  featured && "bg-[#F7F1E3] text-[#14110E] hover:bg-[#F7F1E3]/90",
                )}
                variant={featured ? "default" : "outline"}
              >
                <Link href={chooseHref}>Choose {plan.name}</Link>
              </Button>
            </motion.article>
          );
        })}
      </div>
    </LandingSection>
  );
}
