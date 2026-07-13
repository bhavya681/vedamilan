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

export const metadata = { title: "Consultation" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Consultation"
        description="Speak with verified experts"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <div className="grid gap-4 md:grid-cols-3">
          {mockAstrologers.map((a) => (
            <GlassCard key={a.id}>
              <h2 className="font-display text-xl">{a.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{a.specialty}</p>
              <p className="mt-3 text-xs">
                {a.experience} · ★ {a.rating} ({a.reviews})
              </p>
              <p className="mt-2 text-sm">{a.price}</p>
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href={routes.bookConsultation}>Book {a.nextSlot}</Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      </>
    </div>
  );
}
