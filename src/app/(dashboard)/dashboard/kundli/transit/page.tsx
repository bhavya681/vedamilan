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

export const metadata = { title: "Transit Analysis" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Transit Analysis"
        description="Current planetary weather"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="space-y-3">
          {mockTransits.map((t) => (
            <GlassCard key={t.planet + t.date}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl">{t.planet}</h2>
                <Badge variant="secondary">{t.date}</Badge>
              </div>
              <p className="mt-2 text-sm">
                {t.from} → {t.to}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">{t.impact}</p>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
