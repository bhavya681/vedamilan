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

export const metadata = { title: "Book Consultation" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Book Consultation"
        description="Choose time with an expert"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard className="max-w-xl space-y-4">
          <p className="text-muted-foreground text-sm">Booking with {mockAstrologers[0]!.name}</p>
          <div>
            <label className="text-sm font-medium">Topic</label>
            <select className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2">
              <option>Marriage timing</option>
              <option>Compatibility mediation</option>
              <option>Dasha counseling</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Slot</label>
            <input
              className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
              defaultValue={mockAstrologers[0]!.nextSlot}
            />
          </div>
          <Button>Confirm booking</Button>
        </GlassCard>
      </>
    </div>
  );
}
