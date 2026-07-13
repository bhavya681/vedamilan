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

export const metadata = { title: "Calendar" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Calendar"
        description="Sessions and timing windows"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <h2 className="font-display text-xl">Upcoming</h2>
            <p className="mt-3 text-sm">Thu · Consultation with Acharya Meera Joshi</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Primary marriage window reminder · Aug 2026
            </p>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-xl">Today&apos;s horoscope</h2>
            <p className="mt-3 text-sm">{mockHoroscopeDaily.summary}</p>
          </GlassCard>
        </div>
      </>
    </div>
  );
}
