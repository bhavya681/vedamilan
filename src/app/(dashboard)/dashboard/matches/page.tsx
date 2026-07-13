"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { mockCompatibilityRadar, mockMatches } from "@/lib/mock/vedamilan";
import { routes } from "@/lib/constants/routes";

export default function MatchesPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [hideManglik, setHideManglik] = useState(false);
  const reduceMotion = useReducedMotion();

  const filtered = useMemo(() => {
    return mockMatches.filter((match) => {
      const matchesQuery =
        !query ||
        match.name.toLowerCase().includes(query.toLowerCase()) ||
        match.profession.toLowerCase().includes(query.toLowerCase());
      const matchesCity = city === "all" || match.city === city;
      const matchesManglik = !hideManglik || match.manglik === "No";
      return matchesQuery && matchesCity && matchesManglik;
    });
  }, [query, city, hideManglik]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Match feed"
        description="Premium profiles with explainable Vedic and AI compatibility."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.matchCompare}>Compare</Link>
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

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.35 }}
                >
                  <MatchCard
                    name={match.name}
                    age={match.age}
                    city={match.city}
                    profession={match.profession}
                    score={match.score}
                    aiScore={match.aiScore}
                    headline={match.headline}
                    photo={match.photo}
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
              {filtered[0]?.headline ?? "Adjust filters to surface explainable match narratives."}
              {filtered[0] ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{filtered[0].score}% Vedic</Badge>
                  <Badge variant="secondary">{filtered[0].aiScore}% AI</Badge>
                  <Badge variant="outline">Guna {filtered[0].guna}</Badge>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card className="glass-panel border-0 shadow-none">
            <CardHeader>
              <CardTitle>Compatibility radar</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mockCompatibilityRadar}>
                  <PolarGrid stroke="rgba(200,162,74,0.25)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#C8A24A" fill="#2563EB" fillOpacity={0.22} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
