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

export const metadata = { title: "Search" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Search"
        description="Discover with intention"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard className="mb-6">
          <input
            className="border-input bg-background w-full rounded-xl border px-4 py-3"
            placeholder="Search by city, profession, values…"
            defaultValue="Bengaluru designer family-oriented"
          />
          <div className="mt-3 flex gap-2">
            <Button>Search</Button>
            <Button asChild variant="outline">
              <Link href={routes.filters}>Advanced filters</Link>
            </Button>
          </div>
        </GlassCard>
        <div className="grid gap-4 md:grid-cols-2">
          {mockMatches.map((m) => (
            <MatchCard
              key={m.id}
              name={m.name}
              age={m.age}
              city={m.city}
              profession={m.profession}
              score={m.score}
              aiScore={m.aiScore}
              headline={m.headline}
            />
          ))}
        </div>
      </>
    </div>
  );
}
