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

export const metadata = { title: "Privacy" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Privacy"
        description="Visibility and data controls"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="space-y-3">
          {[
            "Show profile in search",
            "Allow photo views for premium members",
            "Share compatibility reports with family",
            "AI coaching suggestions",
          ].map((s) => (
            <GlassCard key={s} className="flex items-center justify-between">
              <p className="text-sm">{s}</p>
              <Badge>Enabled</Badge>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
