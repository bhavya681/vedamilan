"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow, isToday } from "date-fns";
import { Bell } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { useT } from "@/components/i18n/i18n-provider";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { ContentReveal, ListSkeleton } from "@/components/ui/page-skeletons";
import { emitNotificationsUpdated } from "@/lib/notifications/events";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { localizeNotification } from "@/lib/i18n/catalogs/localize";

type Note = {
  _id?: string;
  id?: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt?: string;
  type?: string;
  data?: { href?: string; otherUserId?: string; senderName?: string; preview?: string };
};

function noteId(note: Note) {
  return String(note.id || note._id || "");
}

function hrefFor(note: Note) {
  if (note.data?.href) return note.data.href;
  switch (note.type) {
    case "INTEREST":
    case "MUTUAL_INTEREST":
      return note.data?.otherUserId
        ? `${routes.matchProfile}?id=${note.data.otherUserId}`
        : routes.connections;
    case "CONNECTION_REQUEST":
      return routes.connections;
    case "CONNECTION_ACCEPTED":
    case "JOURNEY_SPACE_READY":
    case "JOURNEY_SHARED_INSIGHT":
    case "JOURNEY_SHARED_ANSWER":
      return note.data?.otherUserId
        ? `${routes.yourConnection}?partner=${note.data.otherUserId}`
        : routes.yourConnection;
    case "MESSAGE":
      return note.data?.otherUserId ? `${routes.chat}?with=${note.data.otherUserId}` : routes.chat;
    case "COMPATIBILITY":
      return routes.compatibility;
    default:
      return routes.dashboard;
  }
}

async function patchRead(body: { markAll?: boolean; notificationId?: string }) {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.success) {
    emitNotificationsUpdated(Number(json.data?.unread ?? 0));
  }
  return json;
}

export default function NotificationsPage() {
  const t = useT();
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const autoMarkedRef = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Failed to load");
      return;
    }
    setNotes(json.data.notifications || []);
    const nextUnread = Number(json.data.unread || 0);
    setUnread(nextUnread);
    emitNotificationsUpdated(nextUnread);
  }, []);

  useEffect(() => {
    void load()
      .catch(() => setError("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, [load]);

  /** Opening the inbox clears unread — once per visit. */
  useEffect(() => {
    if (loading || autoMarkedRef.current || unread <= 0) return;
    autoMarkedRef.current = true;
    let cancelled = false;
    void (async () => {
      setMarking(true);
      try {
        const json = await patchRead({ markAll: true });
        if (cancelled) return;
        if (json.success) {
          const now = new Date().toISOString();
          setNotes((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || now })));
          setUnread(Number(json.data?.unread ?? 0));
        }
      } finally {
        if (!cancelled) setMarking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, unread]);

  async function markAll() {
    setMarking(true);
    try {
      const json = await patchRead({ markAll: true });
      if (!json.success) {
        setError(json.error?.message || "Could not mark as read");
        return;
      }
      setNotes((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnread(Number(json.data?.unread ?? 0));
    } finally {
      setMarking(false);
    }
  }

  async function onOpenNote(note: Note) {
    const id = noteId(note);
    if (!id || note.readAt) return;
    setNotes((prev) =>
      prev.map((n) => (noteId(n) === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnread((u) => Math.max(0, u - 1));
    await patchRead({ notificationId: id });
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
        {items.map((n) => {
          const id = noteId(n);
          const unreadItem = !n.readAt;
          const copy = localizeNotification(t, n);
          return (
            <Link key={id} href={hrefFor(n)} className="block" onClick={() => void onOpenNote(n)}>
              <GlassCard
                className={cn(
                  "transition-colors",
                  unreadItem ? "glow-border border-gold/25" : "opacity-90",
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-2">
                    {unreadItem ? (
                      <span className="bg-gold h-2 w-2 shrink-0 rounded-full" aria-hidden />
                    ) : null}
                    <p className="font-medium">{copy.title}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                      : ""}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{copy.body}</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        title={t("pages.notificationsTitle")}
        description={t("notifications.emptyHint")}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={marking || unread === 0}
              onClick={() => void markAll()}
            >
              {marking ? t("common.loading") : t("notifications.markAllRead")}
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.connections}>{t("navigation.connections")}</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <ListSkeleton rows={5} /> : null}

      {!loading && notes.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title={t("notifications.emptyTitle")}
          description={t("notifications.emptyHint")}
        />
      ) : null}

      {!loading && notes.length > 0 ? (
        <ContentReveal className="space-y-8">
          {grouped.today.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl">{t("notifications.today")}</h2>
              {renderList(grouped.today)}
            </section>
          ) : null}
          {grouped.earlier.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl">{t("notifications.earlier")}</h2>
              {renderList(grouped.earlier)}
            </section>
          ) : null}
        </ContentReveal>
      ) : null}
    </div>
  );
}
