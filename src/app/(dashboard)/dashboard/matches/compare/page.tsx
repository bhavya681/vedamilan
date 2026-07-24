"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/constants/routes";

type Candidate = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  education: string | null;
  headline: string | null;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  manglik: string;
};

function CompareMatchesInner() {
  const searchParams = useSearchParams();
  const [leftId, setLeftId] = useState(searchParams.get("a") || "");
  const [rightId, setRightId] = useState(searchParams.get("b") || "");
  const [left, setLeft] = useState<Candidate | null>(null);
  const [right, setRight] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPair(a: string, b: string) {
    if (!a || !b) {
      setError("Provide two member ids to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    const [la, ra] = await Promise.all([
      fetch(`/api/matches/${encodeURIComponent(a)}`).then((r) => r.json()),
      fetch(`/api/matches/${encodeURIComponent(b)}`).then((r) => r.json()),
    ]);
    setLoading(false);
    if (!la.success || !ra.success) {
      setError(la.error?.message || ra.error?.message || "Could not load both profiles");
      setLeft(null);
      setRight(null);
      return;
    }
    setLeft(la.data.profile);
    setRight(ra.data.profile);
  }

  useEffect(() => {
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    if (a && b) void loadPair(a, b).catch(() => setError("Compare failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const rows =
    left && right
      ? [
          ["City", left.city || "—", right.city || "—"],
          ["Profession", left.profession || "—", right.profession || "—"],
          ["Education", left.education || "—", right.education || "—"],
          ["Match score", `${left.compatibilityScore}%`, `${right.compatibilityScore}%`],
          [
            "Guna (blend)",
            `${left.totalGuna}/${left.maxGuna}`,
            `${right.totalGuna}/${right.maxGuna}`,
          ],
          ["Manglik", left.manglik, right.manglik],
          ["Age", String(left.age ?? "—"), String(right.age ?? "—")],
        ]
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Compare profiles"
        description="Side-by-side comparison for thoughtful shortlisting."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.matches}>Back to matches</Link>
          </Button>
        }
      />

      <Card className="glass-panel">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Input
            placeholder="Left user id"
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
          />
          <Input
            placeholder="Right user id"
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
          />
          <Button
            type="button"
            disabled={loading}
            onClick={() => void loadPair(leftId.trim(), rightId.trim())}
          >
            {loading ? "Loading…" : "Compare"}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <EmptyState
          title="Select two profiles"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.matches}>Open match feed</Link>
            </Button>
          }
        />
      ) : null}

      {left && right ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {[left, right].map((profile) => (
              <Card key={profile.userId} className="glass-panel">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">{profile.name}</CardTitle>
                  {profile.headline &&
                  !String(profile.headline).toLowerCase().endsWith("'s profile") ? (
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {profile.headline}
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={profile.compatibilityScore} />
                  <div className="flex flex-wrap gap-2">
                    <Badge>{profile.compatibilityScore}% match score</Badge>
                    <Badge variant="outline">
                      Guna {profile.totalGuna}/{profile.maxGuna}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {[profile.age, profile.city, profile.profession].filter(Boolean).join(" · ")}
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${routes.matchProfile}?id=${profile.userId}`}>Open profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-panel overflow-x-auto">
            <CardContent className="divide-border/60 divide-y p-0">
              {rows.map(([label, a, b]) => (
                <div key={label} className="grid min-w-[320px] grid-cols-3 gap-3 px-4 py-3 text-sm">
                  <p className="text-muted-foreground font-medium">{label}</p>
                  <p className="break-words">{a}</p>
                  <p className="break-words">{b}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Button asChild>
            <Link href={`${routes.compatibility}?candidate=${encodeURIComponent(right.userId)}`}>
              Run full guna milan
            </Link>
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default function CompareMatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-2" role="status" aria-label="Loading compare">
          <div className="skeleton-shimmer h-10 w-64 max-w-full rounded-2xl" />
          <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
          <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
        </div>
      }
    >
      <CompareMatchesInner />
    </Suspense>
  );
}
