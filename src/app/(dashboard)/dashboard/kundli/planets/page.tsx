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

export const metadata = { title: "Planet Details" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Planet Details"
        description="Positions, dignity, and themes"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mockPlanets.map((p) => (
            <GlassCard key={p.name}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">{p.name}</h2>
                <Badge>{p.sign}</Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                House {p.house} · {p.degree} · {p.dignity}
              </p>
              <p className="text-ai mt-2 text-xs">{p.nature}</p>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
