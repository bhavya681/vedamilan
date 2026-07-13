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

export const metadata = { title: "Premium" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Premium"
        description="Unlock full intelligence"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard glow>
          <h2 className="font-display text-3xl">Sangam Premium</h2>
          <p className="text-muted-foreground mt-2">
            You are on the recommended plan for full relationship intelligence.
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild>
              <Link href={routes.checkout}>Manage billing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.pricing}>Compare plans</Link>
            </Button>
          </div>
        </GlassCard>
      </>
    </div>
  );
}
