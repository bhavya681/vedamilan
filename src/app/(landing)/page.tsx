import dynamic from "next/dynamic";

import { HomeGuideChat } from "@/features/ai/components/home-guide-chat";
import { TrustStrip } from "@/features/landing/components/editorial-sections";
import { LandingHero } from "@/features/landing/components/hero-section";

const NotJustAMatch = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.NotJustAMatch),
);
const DiscoverMatches = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.DiscoverMatches),
);
const CompatibilityVisual = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.CompatibilityVisual),
);
const LifePathAlignment = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.LifePathAlignment),
);
const ConnectionJourney = dynamic(() =>
  import("@/features/landing/components/editorial-sections").then((m) => m.ConnectionJourney),
);
const AstrologyExplained = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.AstrologyExplained),
);
const CompatibilityStudio = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.CompatibilityStudio),
);
const CoupleSpacePreview = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.CoupleSpacePreview),
);
const VedicKnowledge = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.VedicKnowledge),
);
const AiGuidance = dynamic(() =>
  import("@/features/landing/components/product-narrative").then((m) => m.AiGuidance),
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
        <TrustStrip />
        <NotJustAMatch />
        <DiscoverMatches />
        <CompatibilityVisual />
        <AstrologyExplained />
        <LifePathAlignment />
        <CompatibilityStudio />
        <ConnectionJourney />
        <CoupleSpacePreview />
        <VedicKnowledge />
        <AiGuidance />
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
