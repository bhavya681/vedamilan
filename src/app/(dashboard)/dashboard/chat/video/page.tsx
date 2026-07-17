"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function VideoChatPage() {
  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Connect"
        title="Video call"
        description="Secure video joins the roadmap after messaging"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.chat}>Back to chat</Link>
          </Button>
        }
      />
      <EmptyState
        title="Video coming soon"
        description="Continue with text chat and ice breakers grounded in compatibility context."
        action={
          <Button asChild>
            <Link href={routes.chat}>Open messages</Link>
          </Button>
        }
      />
    </div>
  );
}
