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

export const metadata = { title: "Astrologer Profile" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Astrologer Profile"
        description="Expert credentials and slots"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard>
          <h2 className="font-display text-3xl">{mockAstrologers[0]!.name}</h2>
          <p className="text-muted-foreground mt-2">{mockAstrologers[0]!.bio}</p>
          <p className="mt-4 text-sm">Languages: {mockAstrologers[0]!.languages.join(", ")}</p>
          <Button asChild className="mt-6">
            <Link href={routes.bookConsultation}>Book session</Link>
          </Button>
        </GlassCard>
      </>
    </div>
  );
}
