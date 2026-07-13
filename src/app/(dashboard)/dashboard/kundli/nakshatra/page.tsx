import Link from "next/link";
import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard, StatCard, MatchCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import {
  mockMatches,
  mockPlanets,
  mockDasha,
  mockTransits,
  mockMarriageTiming,
  mockGunaMilan,
  mockAiInsights,
  mockNotifications,
  mockAstrologers,
  mockReports,
  mockInvoices,
  mockBlogPosts,
  mockFaqs,
  mockPricingPlans,
  mockUser,
  mockBirthDetails,
  mockPreferences,
  mockVisitors,
  mockLikes,
  mockShortlisted,
  mockHoroscopeDaily,
  mockConversations,
  mockAntardasha,
} from "@/lib/mock/vedamilan";

export const metadata = { title: "Nakshatra" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Nakshatra"
        description="Lunar mansion insights"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard>
          <h2 className="font-display text-3xl">{mockBirthDetails.nakshatra}</h2>
          <p className="text-muted-foreground mt-2">
            Pada {mockBirthDetails.pada} · Moon in {mockBirthDetails.rashi}
          </p>
          <p className="mt-6 text-sm leading-relaxed">
            Ardra brings intensity, curiosity, and transformative emotional intelligence. Channel
            this into honest conversations and creative problem-solving in partnerships.
          </p>
        </GlassCard>
      </>
    </div>
  );
}
