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

export const metadata = { title: "Advanced Filters" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Advanced Filters"
        description="Precision discovery controls"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard className="grid gap-4 md:grid-cols-2">
          {["Age range", "Height", "City", "Education", "Manglik", "Diet"].map((f) => (
            <div key={f}>
              <label className="text-sm font-medium">{f}</label>
              <select className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2">
                <option>Any</option>
                <option>Preferred</option>
              </select>
            </div>
          ))}
          <Button className="md:col-span-2">Apply filters</Button>
        </GlassCard>
      </>
    </div>
  );
}
