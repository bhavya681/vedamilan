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

export const metadata = { title: "Messages" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Messages"
        description="Secure conversations"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {mockConversations.map((c) => (
              <GlassCard key={c.id}>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground mt-1 truncate text-xs">{c.preview}</p>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="lg:col-span-2">
            <p className="font-display text-2xl">{mockConversations[0]!.name}</p>
            <div className="mt-4 space-y-3">
              {mockConversations[0]!.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "bg-primary/15 ml-auto" : "bg-muted"}`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </>
    </div>
  );
}
