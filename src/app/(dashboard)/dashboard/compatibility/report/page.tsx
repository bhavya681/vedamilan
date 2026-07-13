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

export const metadata = { title: "Compatibility Report" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Compatibility Report"
        description="Shareable relationship dossier"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard>
          <h2 className="font-display text-3xl">Ananya × Rohan</h2>
          <p className="text-muted-foreground mt-2">
            Total Guna {mockGunaMilan.reduce((s, g) => s + g.score, 0)} / 36 · AI harmony 89%
          </p>
          <p className="mt-6 text-sm leading-relaxed">
            Families can share this dossier securely. Strengths center on Graha Maitri and Nadi
            clarity, with practical pacing advised around career travel months.
          </p>
          <Button className="mt-6" variant="secondary">
            Download PDF
          </Button>
        </GlassCard>
      </>
    </div>
  );
}
