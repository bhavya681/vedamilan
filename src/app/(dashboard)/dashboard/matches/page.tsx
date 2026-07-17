"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { MatchCard, GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";
import { mockMatches } from "@/lib/mock/vedamilan";

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  totalGuna: number;
  manglik: string;
  headline: string;
  photo: string | null;
  reasons: string[];
  gunaBreakdown: Array<{ koota: string; score: number; max: number }>;
};

function demoMatches(): MatchItem[] {
  return mockMatches.map((m) => ({
    userId: m.id,
    name: m.name,
    age: m.age,
    city: m.city,
    profession: m.profession,
    compatibilityScore: m.score,
    totalGuna: m.guna,
    manglik: m.manglik,
    headline: m.headline,
    photo: m.photo,
    reasons: [],
    gunaBreakdown: [
      { koota: "Varna", score: 1, max: 1 },
      { koota: "Vashya", score: 2, max: 2 },
      { koota: "Tara", score: 2.5, max: 3 },
      { koota: "Yoni", score: 3, max: 4 },
      { koota: "Graha", score: 4, max: 5 },
      { koota: "Gana", score: 5, max: 6 },
      { koota: "Bhakoot", score: 6, max: 7 },
      { koota: "Nadi", score: 7, max: 8 },
    ],
  }));
}

function filterDemo(query: string, city: string, hideManglik: boolean): MatchItem[] {
  const q = query.trim().toLowerCase();
  return demoMatches().filter((m) => {
    if (city !== "all" && m.city !== city) return false;
    if (hideManglik && m.manglik !== "No") return false;
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || (m.profession || "").toLowerCase().includes(q);
  });
}

export default function MatchesPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [hideManglik, setHideManglik] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      city,
      prefs: "0",
      limit: "24",
    });
    if (query.trim()) params.set("q", query.trim());
    if (hideManglik) params.set("manglik", "NON_MANGLIK");
    try {
      const res = await fetch(`/api/matches?${params.toString()}`);
      const json = await res.json();
      setLoading(false);
      if (!json.success) {
        setMatches(filterDemo(query, city, hideManglik));
        return;
      }
      const data = (json.data.data || []) as MatchItem[];
      setMatches(data.length > 0 ? data : filterDemo(query, city, hideManglik));
    } catch {
      setLoading(false);
      setMatches(filterDemo(query, city, hideManglik));
    }
  }, [query, city, hideManglik]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function shortlist(userId: string) {
    setShortlisting(userId);
    await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    setShortlisting(null);
  }

  const radar = useMemo(() => {
    const top = matches[0];
    if (!top?.gunaBreakdown?.length) return [];
    return top.gunaBreakdown.map((g) => ({
      axis: g.koota,
      score: Math.round((g.score / g.max) * 100),
    }));
  }, [matches]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Matches"
        description="Browse compatible profiles. Scores stay explainable."
        actions={
          <Button asChild variant="outline">
            <Link
              href={
                matches[0] && matches[1]
                  ? `${routes.matchCompare}?a=${matches[0].userId}&b=${matches[1].userId}`
                  : routes.matchCompare
              }
            >
              Compare
            </Link>
          </Button>
        }
      />

      <GlassCard className="sticky top-20 z-10 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            className="mt-2"
            placeholder="Name or profession"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <Label>City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              <SelectItem value="Bengaluru">Bengaluru</SelectItem>
              <SelectItem value="Chennai">Chennai</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
              <SelectItem value="Kolkata">Kolkata</SelectItem>
              <SelectItem value="Jaipur">Jaipur</SelectItem>
              <SelectItem value="Kochi">Kochi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <Checkbox
            id="manglik"
            checked={hideManglik}
            onCheckedChange={(value) => setHideManglik(Boolean(value))}
          />
          <Label htmlFor="manglik">Hide partial manglik</Label>
        </div>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading matches…</p>
          ) : matches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {matches.map((match, index) => (
                <motion.div
                  key={match.userId}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.35 }}
                >
                  <MatchCard
                    name={match.name}
                    age={match.age ?? 0}
                    city={match.city || "—"}
                    profession={match.profession || "—"}
                    score={match.compatibilityScore}
                    aiScore={match.compatibilityScore}
                    headline={match.headline}
                    photo={match.photo || undefined}
                    href={`${routes.matchProfile}?id=${match.userId}`}
                    shortlisting={shortlisting === match.userId}
                    onShortlist={() => void shortlist(match.userId)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title="No matches for these filters"
              description="Widen city or profession filters to rediscover compatible profiles."
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setCity("all");
                    setHideManglik(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-40 xl:self-start">
          <Card className="glass-panel glow-border border-0 shadow-none">
            <CardHeader>
              <CardTitle>AI explanation</CardTitle>
              <CardDescription>Why the top result ranks highly</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {matches[0]?.headline ?? "Adjust filters to surface explainable match narratives."}
              {matches[0] ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{matches[0].compatibilityScore}% Vedic</Badge>
                  <Badge variant="secondary">{matches[0].compatibilityScore}% AI</Badge>
                  <Badge variant="outline">Guna {matches[0].totalGuna}</Badge>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card className="glass-panel border-0 shadow-none">
            <CardHeader>
              <CardTitle>Compatibility radar</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {radar.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="rgba(200,162,74,0.25)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#D4AF37" fill="#C47A1A" fillOpacity={0.22} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Generate kundlis for you and matches to populate Ashta Koota radar.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
