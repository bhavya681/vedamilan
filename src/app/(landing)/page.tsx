import { HeroSection } from "@/features/matchmaking/components/hero-section";
import {
  LandingSearchSection,
  AiDemoSection,
  CompatibilityPreviewSection,
  SuccessStoriesStrip,
} from "@/features/matchmaking/components/landing-extras";
import { HowItWorksSection } from "@/features/matchmaking/components/how-it-works";
import { FeaturesGridSection } from "@/features/matchmaking/components/features-grid";
import { MarriageTimingPreview } from "@/features/matchmaking/components/marriage-timing-preview";
import { TestimonialsSection } from "@/features/matchmaking/components/testimonials-section";
import { PricingSection } from "@/features/payments/components/pricing-section";
import { FaqSection } from "@/features/matchmaking/components/faq-section";
import { AnimatedStatsSection } from "@/features/matchmaking/components/animated-stats";
import { FinalCtaSection } from "@/features/matchmaking/components/final-cta";

export default function LandingPage() {
  return (
    <main id="main-content">
      <HeroSection />
      <LandingSearchSection />
      <AnimatedStatsSection />
      <HowItWorksSection />
      <FeaturesGridSection />
      <AiDemoSection />
      <CompatibilityPreviewSection />
      <MarriageTimingPreview />
      <SuccessStoriesStrip />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
