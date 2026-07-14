"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { MessageSquare } from "lucide-react";

type ChatRow = {
  id: string;
  name: string;
  preview: string;
  unread: number;
  lastMessageAt?: string | null;
};

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/chats")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load messages");
          return;
        }
        setChats(json.data.chats || []);
      })
      .catch(() => setError("Failed to load messages"));
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Messages"
        description="Secure conversations"
        actions={
          <Button asChild>
            <Link href={routes.chat}>Open chat</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {chats.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title="No conversations yet"
          description="Message a match from their profile to start chatting."
          action={
            <Button asChild>
              <Link href={routes.matches}>Browse matches</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {chats.map((c) => (
              <GlassCard key={c.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">{c.preview}</p>
                  </div>
                  {c.unread > 0 ? <Badge>{c.unread}</Badge> : null}
                </div>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="lg:col-span-2">
            <p className="font-display text-2xl">{chats[0]?.name}</p>
            <p className="text-muted-foreground mt-2 text-sm">{chats[0]?.preview}</p>
            <Button asChild className="mt-6">
              <Link href={routes.chat}>Continue in chat</Link>
            </Button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
