import { HeroSection } from "@/features/matchmaking/components/hero-section";
import {
  LandingSearchSection,
  CompatibilityPreviewSection,
  SuccessStoriesStrip,
} from "@/features/matchmaking/components/landing-extras";
import { HowItWorksSection } from "@/features/matchmaking/components/how-it-works";
import { FeaturesGridSection } from "@/features/matchmaking/components/features-grid";
import { TestimonialsSection } from "@/features/matchmaking/components/testimonials-section";
import { PricingSection } from "@/features/payments/components/pricing-section";
import { FaqSection } from "@/features/matchmaking/components/faq-section";
import { FinalCtaSection } from "@/features/matchmaking/components/final-cta";
import { HomeGuideChat } from "@/features/ai/components/home-guide-chat";

/**
 * Narrative landing — problem → approach → discovery → compatibility → trust → CTA.
 * Stats counters and AI demo kits intentionally omitted (vibe-code landing pattern).
 */
export default function LandingPage() {
  return (
    <>
      <main id="main-content">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesGridSection />
        <CompatibilityPreviewSection />
        <LandingSearchSection />
        <SuccessStoriesStrip />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <HomeGuideChat />
    </>
  );
}
