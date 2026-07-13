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

export const metadata = { title: "Dasha Timeline" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Dasha Timeline"
        description="Mahadasha and antardasha clarity"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {mockDasha.map((d) => (
              <GlassCard key={d.planet} glow={d.active}>
                <div className="flex justify-between gap-3">
                  <h2 className="font-display text-xl">{d.planet}</h2>
                  {d.active ? <Badge>Active</Badge> : null}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {d.start} → {d.end}
                </p>
                <p className="mt-3 text-sm">{d.theme}</p>
              </GlassCard>
            ))}
          </div>
          <div className="space-y-3">
            {mockAntardasha.map((a) => (
              <GlassCard key={a.planet}>
                <p className="font-medium">{a.planet}</p>
                <p className="text-muted-foreground text-xs">{a.period}</p>
                <p className="text-muted-foreground mt-2 text-sm">{a.note}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}
