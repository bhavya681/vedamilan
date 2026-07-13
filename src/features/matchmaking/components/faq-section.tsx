import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockFaqs } from "@/lib/mock/vedamilan";

export function FaqSection() {
  return (
    <LandingSection id="faq" className="max-w-none">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <SectionIntro
            eyebrow="FAQ"
            title="Questions, answered clearly"
            description="Everything you need before beginning your VedaMilan AI journey."
          />
        </FadeIn>
        <FadeIn delay={0.1} className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            {mockFaqs.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
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
