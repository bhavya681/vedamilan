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

export const metadata = { title: "Partner Preferences" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Partner Preferences"
        description="Intentional filters for discovery"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Age</p>
            <p className="font-display mt-2 text-2xl">
              {mockPreferences.ageRange[0]} – {mockPreferences.ageRange[1]}
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Cities</p>
            <p className="mt-2 text-sm">{mockPreferences.cities.join(" · ")}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Education</p>
            <p className="mt-2 text-sm">{mockPreferences.education.join(" · ")}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Lifestyle</p>
            <p className="mt-2 text-sm">
              Diet: {mockPreferences.diet.join(", ")} · Smoking: {mockPreferences.smoking}
            </p>
          </GlassCard>
        </div>
      </>
    </div>
  );
}
