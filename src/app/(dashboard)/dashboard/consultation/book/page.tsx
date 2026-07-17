"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function BookConsultationPage() {
  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Book consultation"
        description="Scheduling opens with the expert network launch"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.consultation}>Back</Link>
          </Button>
        }
      />
      <EmptyState
        title="Booking unavailable"
        description="Use AI Insights and chat with matches today. Expert slots will appear here."
        action={
          <Button asChild>
            <Link href={routes.aiInsights}>Open AI Insights</Link>
          </Button>
        }
      />
    </div>
  );
}
