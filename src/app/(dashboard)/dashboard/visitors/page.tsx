"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type VisitorRow = {
  _id: string;
  visitorUserId: string;
  name: string;
  city: string | null;
  lastVisitedAt?: string;
  visitCount?: number;
  compatibilityScore?: number;
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/visitors")
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          setError(json.error?.message || "Failed to load visitors");
          return;
        }
        setVisitors(json.data.visitors || []);
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load visitors");
      });
  }, []);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Visitors"
        description="Who viewed your profile"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}

      {!loading && visitors.length === 0 ? (
        <EmptyState
          icon={<Eye className="h-8 w-8" />}
          title="No visitors yet"
          description="When members view your profile, they appear here."
        />
      ) : (
        <div className="space-y-3">
          {visitors.map((v) => (
            <GlassCard key={v._id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-muted-foreground text-xs">
                  {v.city || "—"} ·{" "}
                  {v.lastVisitedAt
                    ? formatDistanceToNow(new Date(v.lastVisitedAt), { addSuffix: true })
                    : "Recently"}
                  {v.visitCount && v.visitCount > 1 ? ` · ${v.visitCount} visits` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{v.compatibilityScore || 0}%</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`${routes.matchProfile}?id=${v.visitorUserId}`}>View</Link>
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
