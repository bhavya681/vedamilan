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

export const metadata = { title: "Security" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Security"
        description="Password and sessions"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard className="max-w-lg space-y-4">
          <div>
            <label className="text-sm font-medium">Current password</label>
            <input
              type="password"
              className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
              defaultValue="••••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>
          <Button>Update password</Button>
        </GlassCard>
      </>
    </div>
  );
}
