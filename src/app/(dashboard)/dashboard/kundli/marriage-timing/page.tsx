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

export const metadata = { title: "Marriage Timing" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Marriage Timing"
        description="Activation windows with context"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="space-y-4">
          {mockMarriageTiming.map((w) => (
            <GlassCard key={w.window} glow={w.score > 90}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-crimson text-xs uppercase">{w.label}</p>
                  <h2 className="font-display text-2xl">{w.window}</h2>
                </div>
                <p className="font-display text-brand-dual text-3xl">{w.score}</p>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">{w.reason}</p>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
