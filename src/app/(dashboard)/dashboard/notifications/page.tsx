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

export const metadata = { title: "Notifications" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Notifications"
        description="Matches, messages, and reports"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="space-y-3">
          {mockNotifications.map((n) => (
            <GlassCard key={n.id} className={!n.read ? "glow-border" : ""}>
              <div className="flex justify-between gap-3">
                <p className="font-medium">{n.title}</p>
                <span className="text-muted-foreground text-xs">{n.time}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{n.body}</p>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
