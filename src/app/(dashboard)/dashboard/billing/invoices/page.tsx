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

export const metadata = { title: "Invoices" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Invoices"
        description="Payment history"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="space-y-3">
          {mockInvoices.map((inv) => (
            <GlassCard key={inv.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{inv.id}</p>
                <p className="text-muted-foreground text-xs">
                  {inv.plan} · {inv.date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl">{inv.amount}</p>
                <Badge>{inv.status}</Badge>
              </div>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
