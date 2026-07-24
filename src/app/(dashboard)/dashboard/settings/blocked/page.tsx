"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type BlockedRow = {
  blockedId: string;
  reason: string;
  blockedAt?: string;
  member: {
    userId: string;
    name: string;
    city: string | null;
    profession: string | null;
    photo: string | null;
    age: number | null;
  } | null;
};

export default function BlockedMembersPage() {
  const [blocks, setBlocks] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blocks");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load blocked members");
        setBlocks([]);
      } else {
        setBlocks(json.data.blocks || []);
      }
    } catch {
      setError("Failed to load blocked members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function unblock(blockedId: string) {
    setBusyId(blockedId);
    setError(null);
    const res = await fetch("/api/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId }),
    });
    const json = await res.json();
    setBusyId(null);
    if (!json.success) {
      setError(json.error?.message || "Could not unblock");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.blockedId !== blockedId));
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Privacy"
        title="Blocked members"
        description="Blocked people cannot discover you, send interest, connect, or message. Unblocking restores normal rules."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.privacySettings}>Privacy settings</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={4} /> : null}
      {!loading && blocks.length === 0 ? (
        <EmptyState
          title="No blocked members"
          description="When you block someone from a profile, they appear here."
          action={
            <Button asChild>
              <Link href={routes.matches}>Back to matches</Link>
            </Button>
          }
        />
      ) : null}
      {!loading && blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((row) => (
            <GlassCard
              key={row.blockedId}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{row.member?.name || "Member"}</p>
                <p className="text-muted-foreground text-sm">
                  {[row.member?.age, row.member?.city, row.member?.profession]
                    .filter(Boolean)
                    .join(" · ") || "Details hidden"}
                </p>
                {row.reason ? (
                  <p className="text-muted-foreground mt-1 text-xs">Reason: {row.reason}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busyId === row.blockedId}
                onClick={() => void unblock(row.blockedId)}
              >
                {busyId === row.blockedId ? "Unblocking…" : "Unblock"}
              </Button>
            </GlassCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
