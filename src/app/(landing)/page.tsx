import dynamic from "next/dynamic";

import { HomeGuideChat } from "@/features/ai/components/home-guide-chat";
import { ThreeExperiences } from "@/features/landing/components/experiences-section";
import { TrustStrip } from "@/features/landing/components/editorial-sections";
import { LandingHero } from "@/features/landing/components/hero-section";

const AstrologyExplained = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.AstrologyExplained),
);
const VedicKnowledge = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.VedicKnowledge),
);
const AiGuidance = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.AiGuidance),
);
const CompatibilityVisual = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.CompatibilityVisual),
);
const DiscoverMatches = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.DiscoverMatches),
);
const CompatibilityStudio = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.CompatibilityStudio),
);
const NotJustAMatch = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.NotJustAMatch),
);
const CoupleSpacePreview = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.CoupleSpacePreview),
);
const LifePathAlignment = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.LifePathAlignment),
);
const ConnectionJourney = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.ConnectionJourney),
);
const SafetyTrust = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.SafetyTrust),
);
const International = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.International),
);
const PricingSection = dynamic(() =>
  import("@/features/payments/components/pricing-section").then((m) => m.PricingSection),
);
const FaqSection = dynamic(() =>
  import("@/features/matchmaking/components/faq-section").then((m) => m.FaqSection),
);
const LandingFinalCta = dynamic(() =>
  import("@/features/landing/components/close-sections").then((m) => m.LandingFinalCta),
);

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        <LandingHero />
        <ThreeExperiences />
        <AstrologyExplained />
        <VedicKnowledge />
        <AiGuidance />
        <CompatibilityVisual />
        <DiscoverMatches />
        <CompatibilityStudio />
        <NotJustAMatch />
        <CoupleSpacePreview />
        <LifePathAlignment />
        <ConnectionJourney />
        <TrustStrip />
        <SafetyTrust />
        <International />
        <PricingSection />
        <FaqSection />
        <LandingFinalCta />
      </main>
      <HomeGuideChat />
    </>
  );
}
