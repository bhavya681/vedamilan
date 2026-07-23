"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, isToday } from "date-fns";
import { Bell } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { ContentReveal, ListSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type Note = {
  _id: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt?: string;
  type?: string;
  data?: { href?: string; otherUserId?: string };
};

function hrefFor(note: Note) {
  if (note.data?.href) return note.data.href;
  switch (note.type) {
    case "INTEREST":
    case "MUTUAL_INTEREST":
      return note.data?.otherUserId
        ? `${routes.matchProfile}?id=${note.data.otherUserId}`
        : routes.connections;
    case "CONNECTION_REQUEST":
    case "CONNECTION_ACCEPTED":
      return routes.connections;
    case "MESSAGE":
      return note.data?.otherUserId ? `${routes.chat}?with=${note.data.otherUserId}` : routes.chat;
    case "COMPATIBILITY":
      return routes.compatibility;
    default:
      return routes.dashboard;
  }
}

export default function NotificationsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Failed to load");
      return;
    }
    setNotes(json.data.notifications || []);
  }

  useEffect(() => {
    void load().catch(() => {
      setLoading(false);
      setError("Failed to load notifications");
    });
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await load();
  }

  const grouped = useMemo(() => {
    const today: Note[] = [];
    const earlier: Note[] = [];
    for (const n of notes) {
      if (n.createdAt && isToday(new Date(n.createdAt))) today.push(n);
      else earlier.push(n);
    }
    return { today, earlier };
  }, [notes]);

  function renderList(items: Note[]) {
    return (
      <div className="space-y-3">
        {items.map((n) => (
          <Link key={n._id} href={hrefFor(n)} className="block">
            <GlassCard className={!n.readAt ? "glow-border" : ""}>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <p className="font-medium">{n.title}</p>
                <span className="text-muted-foreground text-xs">
                  {n.createdAt
                    ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                    : ""}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{n.body}</p>
              {n.type ? (
                <p className="text-muted-foreground mt-2 text-xs tracking-wide uppercase">
                  {n.type.replaceAll("_", " ")}
                </p>
              ) : null}
            </GlassCard>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        title="Notifications"
        description="Interest, connections, messages, and compatibility updates."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => void markAll()}>
              Mark all read
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.connections}>Connections</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <ListSkeleton rows={5} /> : null}

      {!loading && notes.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="You're all caught up"
          description="Interest signals, connection requests, and messages will appear here."
        />
      ) : null}

      {!loading && notes.length > 0 ? (
        <ContentReveal className="space-y-8">
          {grouped.today.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl">Today</h2>
              {renderList(grouped.today)}
            </section>
          ) : null}
          {grouped.earlier.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl">Earlier</h2>
              {renderList(grouped.earlier)}
            </section>
          ) : null}
        </ContentReveal>
      ) : null}
    </div>
  );
}
