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

export const metadata = { title: "Match Profile" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Match Profile"
        description="Deep profile and chart context"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard>
          <h2 className="font-display text-3xl">{mockMatches[0]!.name}</h2>
          <p className="text-muted-foreground mt-1">
            {mockMatches[0]!.age} · {mockMatches[0]!.city} · {mockMatches[0]!.profession} @{" "}
            {mockMatches[0]!.company}
          </p>
          <p className="mt-6 text-sm leading-relaxed">{mockMatches[0]!.headline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button>Send interest</Button>
            <Button variant="secondary">Shortlist</Button>
            <Button asChild variant="outline">
              <Link href={routes.compatibility}>Run compatibility</Link>
            </Button>
          </div>
        </GlassCard>
      </>
    </div>
  );
}
