import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";

const topics = [
  {
    title: "Getting started",
    body: "Create your profile, add birth details, and unlock your first kundli.",
  },
  {
    title: "Kundli basics",
    body: "North, South, and East chart views explained without jargon overload.",
  },
  {
    title: "Compatibility reports",
    body: "How Ashta Koota and AI scores work together for family conversations.",
  },
  {
    title: "Billing and premium",
    body: "Plans, invoices, and how upgrades unlock reports and consultations.",
  },
];

export const metadata = { title: "Help Center" };

export default function HelpPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Guides"
        title="Help Center"
        description="Calm, step-by-step guidance for every part of the journey."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.support}>Contact support</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <GlassCard key={topic.title}>
            <h2 className="font-display text-xl">{topic.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{topic.body}</p>
          </GlassCard>
        ))}
      </div>
    </MarketingPageShell>
  );
}
