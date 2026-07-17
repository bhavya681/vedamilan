"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function AstrologerPage() {
  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Astrologer profile"
        description="Verified experts will list here"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.consultation}>Back</Link>
          </Button>
        }
      />
      <EmptyState
        title="No experts listed yet"
        description="While the network launches, get explain-only guidance from AI Insights using your calculated chart."
        action={
          <Button asChild>
            <Link href={routes.aiInsights}>AI Insights</Link>
          </Button>
        }
      />
    </div>
  );
}
