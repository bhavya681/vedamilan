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

export const metadata = { title: "Kundli" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Kundli"
        description="Your Vedic chart workspace"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "North Indian", h: routes.chartNorth },
            { t: "South Indian", h: routes.chartSouth },
            { t: "East Indian", h: routes.chartEast },
            { t: "Planets", h: routes.planets },
            { t: "Nakshatra", h: routes.nakshatra },
            { t: "Dasha", h: routes.dasha },
            { t: "Transit", h: routes.transit },
            { t: "Marriage Timing", h: routes.marriageTiming },
          ].map((i) => (
            <Link key={i.t} href={i.h}>
              <GlassCard className="transition hover:-translate-y-1">
                <h2 className="font-display text-xl">{i.t}</h2>
                <p className="text-muted-foreground mt-2 text-sm">Open workspace</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </>
    </div>
  );
}
