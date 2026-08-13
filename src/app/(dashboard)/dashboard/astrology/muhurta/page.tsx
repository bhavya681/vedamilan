"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, MapPin } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type MuhurtaWindow = {
  date: string;
  activity: string;
  rating: "excellent" | "good" | "moderate" | "avoid";
  startTime: string;
  endTime: string;
  score: number;
  reasons: string[];
  cautions: string[];
};

const ACTIVITIES = [
  { value: "marriage", label: "Marriage / Engagement" },
  { value: "business", label: "Business Launch" },
  { value: "job", label: "Job Joining" },
  { value: "travel", label: "Travel" },
  { value: "property", label: "Property Purchase" },
  { value: "education", label: "Education / Exam" },
  { value: "naming", label: "Naming Ceremony" },
  { value: "meeting", label: "Important Meeting" },
  { value: "houseEntry", label: "House Entry" },
  { value: "religious", label: "Religious / Spiritual" },
];

const RATING_STYLE: Record<string, string> = {
  excellent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  good: "border-gold/40 bg-gold/10 text-foreground",
  moderate: "border-amber-500/40 bg-amber-500/10 text-foreground",
  avoid: "border-rose/40 bg-rose/10 text-foreground",
};

export default function AstrologyMuhurtaPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [activity, setActivity] = useState("marriage");
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [windows, setWindows] = useState<MuhurtaWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        date: date.toISOString().split("T")[0] || "",
        activity,
        latitude,
        longitude,
        timezone,
      });
      const res = await fetch(`/api/muhurta?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to calculate muhurta");
        setWindows([]);
      } else {
        setWindows(json.data.windows || []);
      }
    } catch {
      setError("Failed to calculate muhurta");
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  const excellent = windows.filter((w) => w.rating === "excellent");
  const good = windows.filter((w) => w.rating === "good");
  const avoid = windows.filter((w) => w.rating === "avoid");

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Electional astrology"
        title="Muhurta Finder"
        description="Identify traditionally auspicious windows for important activities based on Panchanga rules."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.astrologyPanchanga}>Today&apos;s Panchanga</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-muted-foreground h-4 w-4" />
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Activity</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITIES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Timezone"
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Calculating..." : "Find Muhurta"}
            </Button>
          </div>
        </div>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {searched && !loading && windows.length === 0 && !error ? (
        <EmptyState
          title="No muhurta windows found"
          description="Try a different date or activity."
        />
      ) : null}

      {excellent.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Recommended</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {excellent.map((w, i) => (
              <GlassCard key={`${w.date}-${i}`} className="space-y-2 border-emerald-500/30">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("border text-[10px]", RATING_STYLE[w.rating])}>
                    {w.rating}
                  </Badge>
                  <span className="font-display text-lg">{w.date}</span>
                </div>
                <p className="font-medium">
                  {w.startTime} – {w.endTime}
                </p>
                <p className="text-muted-foreground text-xs">Score: {w.score}/100</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  {w.reasons.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
                {w.cautions.length > 0 ? (
                  <ul className="text-destructive/80 space-y-1 text-xs">
                    {w.cautions.map((c) => (
                      <li key={c}>· {c}</li>
                    ))}
                  </ul>
                ) : null}
              </GlassCard>
            ))}
          </div>
        </section>
      ) : null}

      {good.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Good windows</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {good.map((w, i) => (
              <GlassCard key={`${w.date}-${i}`} className="border-gold/30 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("border text-[10px]", RATING_STYLE[w.rating])}>
                    {w.rating}
                  </Badge>
                  <span className="font-display text-lg">{w.date}</span>
                </div>
                <p className="font-medium">
                  {w.startTime} – {w.endTime}
                </p>
                <p className="text-muted-foreground text-xs">Score: {w.score}/100</p>
              </GlassCard>
            ))}
          </div>
        </section>
      ) : null}

      {avoid.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-destructive text-xl">Avoid</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {avoid.map((w, i) => (
              <GlassCard key={`${w.date}-${i}`} className="border-rose/30 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("border text-[10px]", RATING_STYLE[w.rating])}>
                    {w.rating}
                  </Badge>
                  <span className="font-display text-lg">{w.date}</span>
                </div>
                <p className="font-medium">
                  {w.startTime} – {w.endTime}
                </p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  {w.cautions.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
