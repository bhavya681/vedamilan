"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentReveal, ListSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type ShortlistRow = {
  _id: string;
  targetUserId: string;
  name: string;
  note?: string;
  compatibilityScore?: number;
};

export default function ShortlistedPage() {
  const [items, setItems] = useState<ShortlistRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/shortlist")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          setError(json.error?.message || "Failed to load shortlist");
          return;
        }
        setItems(json.data.shortlist || []);
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load shortlist");
      });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Shortlisted"
        description="Profiles you are considering"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <ListSkeleton rows={4} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="Shortlist is empty"
          description="Bookmark profiles from Match feed to review later."
          action={
            <Button asChild>
              <Link href={routes.matches}>Browse matches</Link>
            </Button>
          }
        />
      ) : (
        <ContentReveal className="space-y-3">
          {items.map((s) => (
            <GlassCard key={s._id}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{s.name}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{s.note || "No note yet"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>{s.compatibilityScore || 0}%</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${routes.matchProfile}?id=${s.targetUserId}`}>View</Link>
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </ContentReveal>
      )}
    </div>
  );
}
