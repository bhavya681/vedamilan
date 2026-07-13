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

export const metadata = { title: "North Indian Chart" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="North Indian Chart"
        description="Diamond-style kundli view"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard>
          <div className="border-gold/30 bg-brand-dual-soft mx-auto flex aspect-square max-w-md items-center justify-center rounded-3xl border p-6">
            <p className="font-display text-brand-dual text-2xl">North Indian Kundli</p>
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            Lagna {mockBirthDetails.lagna} · Moon {mockBirthDetails.rashi} ·{" "}
            {mockBirthDetails.nakshatra} pada {mockBirthDetails.pada}
          </p>
        </GlassCard>
      </>
    </div>
  );
}
