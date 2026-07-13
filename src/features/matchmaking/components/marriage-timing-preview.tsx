"use client";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";
import { GlassCard } from "@/components/ui/premium-cards";
import { mockMarriageTiming } from "@/lib/mock/vedamilan";

export function MarriageTimingPreview() {
  return (
    <LandingSection id="timing" tone="muted">
      <FadeIn>
        <SectionIntro
          eyebrow="Marriage timing"
          title="Activation windows, not vague promises"
          description="Dasha and transit confluence presented as calm, actionable seasons."
        />
      </FadeIn>
      <div className="mt-10 space-y-3 sm:space-y-4">
        {mockMarriageTiming.map((w, i) => (
          <FadeIn key={w.window} delay={0.06 * i}>
            <GlassCard
              glow={w.score > 90}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-rose text-[11px] tracking-[0.16em] uppercase">{w.label}</p>
                <p className="font-display text-xl sm:text-2xl">{w.window}</p>
                <p className="text-muted-foreground mt-1 text-sm">{w.reason}</p>
              </div>
              <p className="font-display text-brand-dual shrink-0 text-3xl sm:text-4xl">
                {w.score}
              </p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
