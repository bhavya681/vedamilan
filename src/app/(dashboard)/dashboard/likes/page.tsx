"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { Heart } from "lucide-react";

type LikeRow = {
  _id: string;
  name: string;
  city: string | null;
  mutual?: boolean;
  compatibilityScore?: number;
  toUserId?: string;
  fromUserId?: string;
};

export default function LikesPage() {
  const [sent, setSent] = useState<LikeRow[]>([]);
  const [received, setReceived] = useState<LikeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/likes")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          setError(json.error?.message || "Failed to load likes");
          return;
        }
        setSent(json.data.sent || []);
        setReceived(json.data.received || []);
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load likes");
      });
  }, []);

  const rows = [
    ...received.map((l) => ({ ...l, direction: "Liked you" as const, peerId: l.fromUserId })),
    ...sent.map((l) => ({ ...l, direction: "You liked" as const, peerId: l.toUserId })),
  ];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Likes"
        description="Interest signals"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No likes yet"
          description="Like profiles from Match feed to build interest signals."
          action={
            <Button asChild>
              <Link href={routes.matches}>Browse matches</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((l) => (
            <GlassCard
              key={`${l._id}-${l.direction}`}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-muted-foreground text-xs">
                  {l.city || "—"} · {l.mutual ? "Mutual" : l.direction}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{l.compatibilityScore || 0}%</Badge>
                {l.peerId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${routes.matchProfile}?id=${l.peerId}`}>View</Link>
                  </Button>
                ) : null}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
