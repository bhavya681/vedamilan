"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DayTimeline,
  formatDayLength,
  type TimelineBand,
} from "@/components/astrology/day-timeline";
import { fromLocalDateInput, toLocalDateInput, useBirthPlace } from "@/hooks/use-birth-place";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Panchanga = {
  tithi: {
    number: number;
    name: string;
    progress: number;
    paksha?: "Shukla" | "Krishna";
    pakshaTithi?: number;
    meaning?: string;
  };
  vara: { number: number; name: string; english: string; sanskrit?: string };
  nakshatra: { index: number; name: string; lord: string };
  yoga: { index: number; name: string; nature?: "auspicious" | "inauspicious" | "mixed" };
  karana: { index: number; name: string; type: "moving" | "fixed"; note?: string };
  sunrise: { time: string; timestamp: number };
  sunset: { time: string; timestamp: number };
  dayLengthMinutes?: number;
  rahuKalam: { start: string; end: string; startTs?: number; endTs?: number };
  yamaganda: { start: string; end: string; startTs?: number; endTs?: number };
  gulika: { start: string; end: string; startTs?: number; endTs?: number };
  abhijit: { start: string; end: string; startTs?: number; endTs?: number } | null;
  location?: {
    latitude: number;
    longitude: number;
    timezone: string;
    placeName: string | null;
    source: string;
  };
};

const YOGA_TONE: Record<string, string> = {
  auspicious: "border-emerald-500/40 bg-emerald-500/10",
  inauspicious: "border-rose/40 bg-rose/10",
  mixed: "border-amber-500/40 bg-amber-500/10",
};

function LimbCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) {
  return (
    <GlassCard className={cn("space-y-1 p-3 sm:p-4", tone)}>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="font-display text-lg leading-snug sm:text-xl">{value}</p>
      {note ? <p className="text-muted-foreground text-xs leading-relaxed">{note}</p> : null}
    </GlassCard>
  );
}

export default function AstrologyPanchangaPage() {
  const { place, source, loaded, setPlace } = useBirthPlace();
  const [date, setDate] = useState(() => toLocalDateInput(new Date()));
  const [panchanga, setPanchanga] = useState<Panchanga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPanchanga = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      });
      const res = await fetch(`/api/panchanga?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load panchanga");
      } else {
        setPanchanga(json.data);
      }
    } catch {
      setError("Failed to load panchanga");
    } finally {
      setLoading(false);
    }
  }, [date, place.latitude, place.longitude, place.timezone]);

  useEffect(() => {
    if (!loaded) return;
    void fetchPanchanga();
    // Location edits use the Update button; date changes reload automatically.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, date]);

  const bands: TimelineBand[] = useMemo(() => {
    if (!panchanga) return [];
    const items: TimelineBand[] = [];
    if (panchanga.abhijit?.startTs && panchanga.abhijit.endTs) {
      items.push({
        id: "abhijit",
        label: "Abhijit",
        start: panchanga.abhijit.start,
        end: panchanga.abhijit.end,
        startTs: panchanga.abhijit.startTs,
        endTs: panchanga.abhijit.endTs,
        tone: "good",
      });
    }
    if (panchanga.rahuKalam.startTs && panchanga.rahuKalam.endTs) {
      items.push({
        id: "rahu",
        label: "Rahu Kalam",
        start: panchanga.rahuKalam.start,
        end: panchanga.rahuKalam.end,
        startTs: panchanga.rahuKalam.startTs,
        endTs: panchanga.rahuKalam.endTs,
        tone: "bad",
      });
    }
    if (panchanga.yamaganda.startTs && panchanga.yamaganda.endTs) {
      items.push({
        id: "yama",
        label: "Yamaganda",
        start: panchanga.yamaganda.start,
        end: panchanga.yamaganda.end,
        startTs: panchanga.yamaganda.startTs,
        endTs: panchanga.yamaganda.endTs,
        tone: "warn",
      });
    }
    if (panchanga.gulika.startTs && panchanga.gulika.endTs) {
      items.push({
        id: "gulika",
        label: "Gulika",
        start: panchanga.gulika.start,
        end: panchanga.gulika.end,
        startTs: panchanga.gulika.startTs,
        endTs: panchanga.gulika.endTs,
        tone: "warn",
      });
    }
    return items;
  }, [panchanga]);

  const tithiPct = Math.round((panchanga?.tithi.progress || 0) * 100);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Five limbs of time"
        title="Panchanga"
        description="Tithi, Vara, Nakshatra, Yoga, and Karana for the selected day — with sunrise, Abhijit, and inauspicious kalam like DrikPanchang."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.astrologyMuhurta}>Muhurta Finder</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="panchanga-date">Date</Label>
            <Input
              id="panchanga-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label>Place</Label>
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
              <Input
                value={place.placeName}
                onChange={(e) => setPlace({ ...place, placeName: e.target.value })}
                placeholder="Place name"
              />
            </div>
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
          <Input
            value={place.timezone}
            onChange={(e) => setPlace({ ...place, timezone: e.target.value })}
            placeholder="Asia/Kolkata"
            className="max-w-xs"
          />
          <Button onClick={() => void fetchPanchanga()} disabled={loading}>
            {loading ? "Loading…" : "Update"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDate(toLocalDateInput(new Date()))}
            disabled={loading}
          >
            Today
          </Button>
          {source === "birth" ? (
            <Badge variant="outline">Using birth place</Badge>
          ) : (
            <Badge variant="outline">Default: New Delhi</Badge>
          )}
        </div>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading && !panchanga ? <PanelSkeleton lines={8} /> : null}

      {panchanga ? (
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="kala">Day kalam</TabsTrigger>
            <TabsTrigger value="guide">How to read</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <LimbCard
                label="Tithi"
                value={`${panchanga.tithi.paksha || ""} ${panchanga.tithi.name}`.trim()}
                note={
                  panchanga.tithi.meaning ||
                  `${tithiPct}% elapsed · Tithi ${panchanga.tithi.number}`
                }
              />
              <LimbCard
                label="Vara"
                value={panchanga.vara.sanskrit || panchanga.vara.name}
                note={panchanga.vara.english}
              />
              <LimbCard
                label="Nakshatra"
                value={panchanga.nakshatra.name}
                note={`Vimshottari lord ${panchanga.nakshatra.lord}`}
              />
              <LimbCard
                label="Yoga"
                value={panchanga.yoga.name}
                note={panchanga.yoga.nature ? `${panchanga.yoga.nature} yoga` : undefined}
                tone={panchanga.yoga.nature ? YOGA_TONE[panchanga.yoga.nature] : undefined}
              />
              <LimbCard
                label="Karana"
                value={panchanga.karana.name}
                note={panchanga.karana.note || panchanga.karana.type}
              />
            </div>

            <GlassCard className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">Tithi progress</h2>
                  <p className="text-muted-foreground text-xs">
                    {panchanga.tithi.paksha || "Paksha"} · {tithiPct}% of this lunar day elapsed
                  </p>
                </div>
                <Badge variant="outline">Tithi {panchanga.tithi.number} / 30</Badge>
              </div>
              <Progress value={tithiPct} />
            </GlassCard>

            <div className="grid gap-3 sm:grid-cols-3">
              <GlassCard className="space-y-1 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Sunrise
                </p>
                <p className="font-display text-2xl">{panchanga.sunrise.time}</p>
              </GlassCard>
              <GlassCard className="space-y-1 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Sunset</p>
                <p className="font-display text-2xl">{panchanga.sunset.time}</p>
              </GlassCard>
              <GlassCard className="space-y-1 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Day length
                </p>
                <p className="font-display text-2xl">
                  {formatDayLength(panchanga.dayLengthMinutes || 0)}
                </p>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="kala" className="space-y-4">
            <GlassCard className="space-y-4">
              <div>
                <h2 className="font-display text-xl">Day timeline</h2>
                <p className="text-muted-foreground text-xs">
                  Sunrise to sunset. Green is Abhijit; red is Rahu Kalam; amber is Yamaganda and
                  Gulika.
                </p>
              </div>
              <DayTimeline
                sunriseTs={panchanga.sunrise.timestamp}
                sunsetTs={panchanga.sunset.timestamp}
                sunriseLabel={panchanga.sunrise.time}
                sunsetLabel={panchanga.sunset.time}
                bands={bands}
              />
            </GlassCard>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard className="space-y-1 border-emerald-500/30 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Abhijit Muhurta
                </p>
                <p className="font-medium">
                  {panchanga.abhijit
                    ? `${panchanga.abhijit.start} – ${panchanga.abhijit.end}`
                    : "—"}
                </p>
                <p className="text-muted-foreground text-xs">24 minutes around local midday</p>
              </GlassCard>
              <GlassCard className="border-rose/30 space-y-1 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Rahu Kalam
                </p>
                <p className="font-medium">
                  {panchanga.rahuKalam.start} – {panchanga.rahuKalam.end}
                </p>
                <p className="text-muted-foreground text-xs">Avoid new starts</p>
              </GlassCard>
              <GlassCard className="space-y-1 border-amber-500/30 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                  Yamaganda
                </p>
                <p className="font-medium">
                  {panchanga.yamaganda.start} – {panchanga.yamaganda.end}
                </p>
                <p className="text-muted-foreground text-xs">Avoid journeys and contracts</p>
              </GlassCard>
              <GlassCard className="space-y-1 border-amber-500/30 p-4">
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Gulika</p>
                <p className="font-medium">
                  {panchanga.gulika.start} – {panchanga.gulika.end}
                </p>
                <p className="text-muted-foreground text-xs">Avoid auspicious rites</p>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <GlassCard className="space-y-3 text-sm leading-relaxed">
              <h2 className="font-display text-xl">The five limbs</h2>
              <p>
                Panchanga means five limbs: Tithi (lunar day), Vara (weekday), Nakshatra (Moon’s
                star), Yoga (Sun+Moon combination), and Karana (half-tithi). Location changes
                sunrise, so kalam times are place-specific.
              </p>
              <p>
                Shukla paksha is the waxing fortnight; Krishna is waning. Purnima is tithi 15;
                Amavasya is tithi 30. Vishti/Bhadra karana and several yogas (Vyatipata, Vaidhrti,
                and others) are traditionally avoided for major starts.
              </p>
              <p>
                Abhijit is a short midday window treated as generally auspicious. Rahu Kalam,
                Yamaganda, and Gulika are the three inauspicious eighths of daylight used by
                DrikPanchang and similar almanacs.
              </p>
              <p className="text-muted-foreground text-xs">
                Showing{" "}
                {fromLocalDateInput(date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                {place.placeName ? ` · ${place.placeName}` : ""}.
              </p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
