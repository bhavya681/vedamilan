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

export const metadata = { title: "Recommendations" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Recommendations"
        description="Prioritized next actions"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-2">
          {mockMatches.slice(0, 4).map((m) => (
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
