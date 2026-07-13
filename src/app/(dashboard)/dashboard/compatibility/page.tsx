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

export const metadata = { title: "Compatibility" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility"
        description="Guna Milan and AI harmony"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockGunaMilan.map((g) => (
            <GlassCard key={g.koota}>
              <p className="text-muted-foreground text-xs uppercase">{g.koota}</p>
              <p className="font-display text-rose mt-2 text-3xl">
                {g.score}/{g.max}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">{g.note}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link href={routes.compatibilityReport}>Open full report</Link>
          </Button>
        </div>
      </>
    </div>
  );
}
