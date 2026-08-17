"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayTimeline, type TimelineBand } from "@/components/astrology/day-timeline";
import { toLocalDateInput, useBirthPlace } from "@/hooks/use-birth-place";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type MuhurtaWindow = {
  date: string;
  activity: string;
  rating: "excellent" | "good" | "moderate" | "avoid";
  startTime: string;
  endTime: string;
  startTs?: number;
  endTs?: number;
  score: number;
  reasons: string[];
  cautions: string[];
};

type PanchangaSnap = {
  tithi: { name: string; paksha?: string; number: number };
  vara: { name: string; sanskrit?: string };
  nakshatra: { name: string; lord: string };
  yoga: { name: string; nature?: string };
  karana: { name: string };
  sunrise: { time: string; timestamp: number };
  sunset: { time: string; timestamp: number };
  rahuKalam: { start: string; end: string; startTs?: number; endTs?: number };
  yamaganda: { start: string; end: string; startTs?: number; endTs?: number };
  gulika: { start: string; end: string; startTs?: number; endTs?: number };
  abhijit: { start: string; end: string; startTs?: number; endTs?: number } | null;
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

const RATING_TONE: Record<MuhurtaWindow["rating"], TimelineBand["tone"]> = {
  excellent: "good",
  good: "neutral",
  moderate: "warn",
  avoid: "bad",
};

function WindowCard({ w }: { w: MuhurtaWindow }) {
  return (
    <GlassCard
      className={cn(
        "space-y-2",
        w.rating === "excellent" && "border-emerald-500/30",
        w.rating === "good" && "border-gold/30",
        w.rating === "moderate" && "border-amber-500/30",
        w.rating === "avoid" && "border-rose/30",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge className={cn("border text-[10px]", RATING_STYLE[w.rating])}>{w.rating}</Badge>
        <span className="text-muted-foreground text-xs tabular-nums">{w.score}/100</span>
      </div>
      <p className="font-display text-lg">
        {w.startTime} – {w.endTime}
      </p>
      <Progress value={w.score} />
      {w.reasons.length > 0 ? (
        <ul className="text-muted-foreground space-y-1 text-xs">
          {w.reasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      ) : null}
      {w.cautions.length > 0 ? (
        <ul className="text-destructive/80 space-y-1 text-xs">
          {w.cautions.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      ) : null}
    </GlassCard>
  );
}

export default function AstrologyMuhurtaPage() {
  const { place, source, loaded, setPlace } = useBirthPlace();
  const [date, setDate] = useState(() => toLocalDateInput(new Date()));
  const [activity, setActivity] = useState("marriage");
  const [windows, setWindows] = useState<MuhurtaWindow[]>([]);
  const [panchanga, setPanchanga] = useState<PanchangaSnap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        date,
        activity,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      });
      const res = await fetch(`/api/muhurta?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to calculate muhurta");
        setWindows([]);
        setPanchanga(null);
      } else {
        setWindows(json.data.windows || []);
        setPanchanga(json.data.panchanga || null);
      }
    } catch {
      setError("Failed to calculate muhurta");
      setWindows([]);
      setPanchanga(null);
    } finally {
      setLoading(false);
    }
  }, [activity, date, place.latitude, place.longitude, place.timezone]);

  useEffect(() => {
    if (!loaded) return;
    void handleSearch();
    // Location edits use Find Muhurta; date/activity changes reload automatically.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, date, activity]);

  const excellent = windows.filter((w) => w.rating === "excellent");
  const good = windows.filter((w) => w.rating === "good");
  const moderate = windows.filter((w) => w.rating === "moderate");
  const avoid = windows.filter((w) => w.rating === "avoid");

  const bands: TimelineBand[] = useMemo(() => {
    return windows
      .filter((w) => w.startTs && w.endTs)
      .map((w, i) => ({
        id: `${w.rating}-${i}`,
        label: w.rating === "avoid" ? w.cautions[0] || "Avoid" : w.rating,
        start: w.startTime,
        end: w.endTime,
        startTs: w.startTs as number,
        endTs: w.endTs as number,
        tone: RATING_TONE[w.rating],
      }));
  }, [windows]);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Electional astrology"
        title="Muhurta Finder"
        description="Auspicious and inauspicious windows for the selected activity, scored from the day’s Panchanga — Abhijit, nakshatra, yoga, and kalam."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.astrologyPanchanga}>Today&apos;s Panchanga</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="muhurta-date">Date</Label>
            <Input
              id="muhurta-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
            <Label>Latitude</Label>
            <Input
              value={place.latitude}
              onChange={(e) => setPlace({ ...place, latitude: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              value={place.longitude}
              onChange={(e) => setPlace({ ...place, longitude: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[200px] flex-1 items-center gap-2">
            <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
            <Input
              value={place.timezone}
              onChange={(e) => setPlace({ ...place, timezone: e.target.value })}
              placeholder="Asia/Kolkata"
            />
          </div>
          <Button onClick={() => void handleSearch()} disabled={loading}>
            {loading ? "Calculating…" : "Find Muhurta"}
          </Button>
          {source === "birth" ? (
            <Badge variant="outline">{place.placeName}</Badge>
          ) : (
            <Badge variant="outline">Default: New Delhi</Badge>
          )}
        </div>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading && windows.length === 0 ? <PanelSkeleton lines={8} /> : null}

      {panchanga ? (
        <GlassCard className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">Day snapshot</h2>
            <p className="text-muted-foreground text-xs">
              Sunrise {panchanga.sunrise.time} · Sunset {panchanga.sunset.time}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "Tithi",
                value: `${panchanga.tithi.paksha || ""} ${panchanga.tithi.name}`.trim(),
              },
              { label: "Vara", value: panchanga.vara.sanskrit || panchanga.vara.name },
              {
                label: "Nakshatra",
                value: `${panchanga.nakshatra.name} · ${panchanga.nakshatra.lord}`,
              },
              {
                label: "Yoga",
                value: `${panchanga.yoga.name}${panchanga.yoga.nature ? ` · ${panchanga.yoga.nature}` : ""}`,
              },
              { label: "Karana", value: panchanga.karana.name },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-3">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {panchanga && bands.length > 0 ? (
        <GlassCard className="space-y-3">
          <h2 className="font-display text-xl">Windows on the day</h2>
          <DayTimeline
            sunriseTs={panchanga.sunrise.timestamp}
            sunsetTs={panchanga.sunset.timestamp}
            sunriseLabel={panchanga.sunrise.time}
            sunsetLabel={panchanga.sunset.time}
            bands={bands}
          />
        </GlassCard>
      ) : null}

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
              <WindowCard key={`ex-${i}`} w={w} />
            ))}
          </div>
        </section>
      ) : null}

      {good.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Good windows</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {good.map((w, i) => (
              <WindowCard key={`good-${i}`} w={w} />
            ))}
          </div>
        </section>
      ) : null}

      {moderate.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Moderate</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {moderate.map((w, i) => (
              <WindowCard key={`mod-${i}`} w={w} />
            ))}
          </div>
        </section>
      ) : null}

      {avoid.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-destructive text-xl">Avoid</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {avoid.map((w, i) => (
              <WindowCard key={`av-${i}`} w={w} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
