"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Note = {
  _id: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt?: string;
  type?: string;
};

export default function NotificationsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Failed to load");
      return;
    }
    setNotes(json.data.notifications || []);
  }

  useEffect(() => {
    void load().catch(() => setError("Failed to load notifications"));
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await load();
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Notifications"
        description="Matches, messages, and reports"
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => void markAll()}>
              Mark all read
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.dashboard}>Back</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {notes.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="You're all caught up"
          description="Activity from matches, payments, and AI reports will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <GlassCard key={n._id} className={!n.readAt ? "glow-border" : ""}>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <p className="font-medium">{n.title}</p>
                <span className="text-muted-foreground text-xs">
                  {n.createdAt
                    ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                    : ""}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{n.body}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
