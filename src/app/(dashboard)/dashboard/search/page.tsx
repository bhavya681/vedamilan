"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard, MatchCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { SearchX } from "lucide-react";

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  headline: string;
  photo: string | null;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortlisting, setShortlisting] = useState<string | null>(null);

  const runSearch = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        prefs: "0",
        limit: "24",
        city: searchParams.get("city") || "all",
      });
      if (query.trim()) params.set("q", query.trim());
      if (searchParams.get("religion")) params.set("religion", searchParams.get("religion")!);
      if (searchParams.get("minAge")) params.set("minAge", searchParams.get("minAge")!);
      if (searchParams.get("maxAge")) params.set("maxAge", searchParams.get("maxAge")!);
      if (searchParams.get("manglik")) params.set("manglik", searchParams.get("manglik")!);
      if (searchParams.get("minHeightCm"))
        params.set("minHeightCm", searchParams.get("minHeightCm")!);
      if (searchParams.get("maxHeightCm"))
        params.set("maxHeightCm", searchParams.get("maxHeightCm")!);
      if (searchParams.get("education")) params.set("education", searchParams.get("education")!);
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      setLoading(false);
      if (!json.success) {
        setError(json.error?.message || "Search failed");
        setResults([]);
        return;
      }
      setResults(json.data.data || []);
    },
    [searchParams],
  );

  useEffect(() => {
    void runSearch(q).catch(() => {
      setLoading(false);
      setError("Search failed");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial + filter param changes
  }, [searchParams]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runSearch(q);
  }

  async function shortlist(userId: string) {
    setShortlisting(userId);
    await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    setShortlisting(null);
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Search"
        description="Discover with intention"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />

      <GlassCard className="mb-2">
        <form onSubmit={onSubmit}>
          <input
            className="border-input bg-background w-full rounded-xl border px-4 py-3"
            placeholder="Search by city, profession, values…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.filters}>Advanced filters</Link>
            </Button>
          </div>
        </form>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((m) => (
            <MatchCard
              key={m.userId}
              name={m.name}
              age={m.age ?? 0}
              city={m.city || "—"}
              profession={m.profession || "—"}
              score={m.compatibilityScore}
              aiScore={m.compatibilityScore}
              headline={m.headline}
              photo={m.photo || undefined}
              href={`${routes.matchProfile}?id=${m.userId}`}
              shortlisting={shortlisting === m.userId}
              onShortlist={() => void shortlist(m.userId)}
            />
          ))}
        </div>
      ) : !loading ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="No profiles found"
          description="Try a different query or open advanced filters."
        />
      ) : null}
    </div>
  );
}
