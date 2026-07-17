import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Support"
        title="Contact"
        description="We respond with care—usually within one business day."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.help}>Help center</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="space-y-4 lg:col-span-3">
          <div>
            <label htmlFor="contact-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="contact-name"
              className="border-input bg-background mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
              defaultValue="Aditi Sharma"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className="border-input bg-background mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
              defaultValue="ananya.sharma@email.com"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="contact-message"
              className="border-input bg-background mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
              rows={5}
              defaultValue="I would like guidance on marriage timing reports for my family."
            />
          </div>
          <Button type="button" className="w-full sm:w-auto">
            Send message
          </Button>
        </GlassCard>
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-xl">Direct email</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Prefer writing us yourself? Reach the care team at:
          </p>
          <a
            className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
            href={`mailto:${brand.supportEmail}`}
          >
            {brand.supportEmail}
          </a>
          <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
            For billing, privacy, or expert consultation questions, include your registered email so
            we can locate your account quickly.
          </p>
        </GlassCard>
      </div>
    </MarketingPageShell>
  );
}
