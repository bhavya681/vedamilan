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

export const metadata = { title: "Edit Profile" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Edit Profile"
        description="Refine how you are discovered"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      <>
        <GlassCard className="max-w-2xl space-y-4">
          {[
            ["Full name", mockUser.name],
            ["Profession", mockUser.profession],
            ["City", mockUser.city],
            ["Education", mockUser.education],
          ].map(([label, value]) => (
            <div key={label}>
              <label className="text-sm font-medium">{label}</label>
              <input
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={value}
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium">About</label>
            <textarea
              className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
              rows={4}
              defaultValue={mockUser.about}
            />
          </div>
          <Button type="button">Save changes</Button>
        </GlassCard>
      </>
    </div>
  );
}
