import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockFaqs } from "@/lib/mock/vedamilan";

export function FaqSection() {
  return (
    <LandingSection id="faq" className="scroll-mt-24" tone="muted">
      <div className="grid min-w-0 items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 lg:gap-12">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            FAQ
          </p>
          <h2 className="font-display mt-3 max-w-md text-[1.75rem] tracking-tight text-balance sm:text-4xl md:text-5xl">
            Questions, answered clearly
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
            Everything you need before beginning your VedaMilan journey.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Accordion type="single" collapsible className="w-full">
            {mockFaqs.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="font-display hover:no-underline gap-4 py-5 text-base leading-snug sm:py-6 sm:text-lg md:text-xl">
                  <span className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <span className="text-muted-foreground mt-0.5 w-7 shrink-0 text-xs tabular-nums">
                      0{index + 1}
                    </span>
                    <span className="min-w-0">{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-10 text-sm leading-relaxed sm:pl-11 sm:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </LandingSection>
  );
}
