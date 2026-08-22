"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/layout/page-shell";
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
import { northHorizonHref, panchangaHref } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type StudioTab = "almanac" | "muhurta" | "guide";

type Panchanga = {
  tithi: {
    number: number;
    name: string;
    progress: number;
    paksha?: "Shukla" | "Krishna";
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
};

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

const ACTIVITIES = [
  { value: "marriage", label: "Marriage" },
  { value: "business", label: "Business" },
  { value: "job", label: "Job joining" },
  { value: "travel", label: "Travel" },
  { value: "property", label: "Property" },
  { value: "education", label: "Education" },
  { value: "naming", label: "Naming" },
  { value: "meeting", label: "Meeting" },
  { value: "houseEntry", label: "House entry" },
  { value: "religious", label: "Puja" },
] as const;

const YOGA_TONE: Record<string, string> = {
  auspicious: "border-emerald-500/40 bg-emerald-500/10",
  inauspicious: "border-rose/40 bg-rose/10",
  mixed: "border-amber-500/40 bg-amber-500/10",
};

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

function parseTab(value: string | null): StudioTab {
  if (value === "muhurta" || value === "guide") return value;
  return "almanac";
}

function shiftDate(iso: string, days: number): string {
  const next = fromLocalDateInput(iso);
  next.setDate(next.getDate() + days);
  return toLocalDateInput(next);
}

function formatLongDate(iso: string): string {
  return fromLocalDateInput(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
          {w.reasons.map((reason) => (
            <li key={reason}>· {reason}</li>
          ))}
        </ul>
      ) : null}
      {w.cautions.length > 0 ? (
        <ul className="text-destructive/80 space-y-1 text-xs">
          {w.cautions.map((caution) => (
            <li key={caution}>· {caution}</li>
          ))}
        </ul>
      ) : null}
      <Button asChild size="sm" variant="outline" className="w-full">
        <Link
          href={northHorizonHref({
            at: w.startTs ?? `${w.date}T${w.startTime}`,
            intent: w.activity === "marriage" ? "marriage" : "muhurta",
          })}
        >
          View sky at this time
        </Link>
      </Button>
    </GlassCard>
  );
}

function WindowSection({
  title,
  windows,
  destructive,
}: {
  title: string;
  windows: MuhurtaWindow[];
  destructive?: boolean;
}) {
  if (windows.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className={cn("font-display text-xl", destructive && "text-destructive")}>{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {windows.map((window, index) => (
          <WindowCard key={`${window.rating}-${window.startTime}-${index}`} w={window} />
        ))}
      </div>
    </section>
  );
}

export function PanchangaMuhurtaStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { place, source, loaded, setPlace } = useBirthPlace();
  const [date, setDate] = useState(() => searchParams.get("date") || toLocalDateInput(new Date()));
  const [activity, setActivity] = useState(searchParams.get("activity") || "marriage");
  const [tab, setTab] = useState<StudioTab>(() => parseTab(searchParams.get("tab")));
  const [panchanga, setPanchanga] = useState<Panchanga | null>(null);
  const [windows, setWindows] = useState<MuhurtaWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const persistQuery = useCallback(
    (next: { tab?: StudioTab; date?: string; activity?: string }) => {
      const nextTab = next.tab ?? tab;
      const nextDate = next.date ?? date;
      const nextActivity = next.activity ?? activity;
      router.replace(
        panchangaHref({
          tab: nextTab,
          date: nextDate,
          activity: nextActivity,
        }),
        { scroll: false },
      );
    },
    [activity, date, router, tab],
  );

  const fetchDay = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date,
        activity,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      });
      const res = await fetch(`/api/muhurta?${params.toString()}`, { signal: controller.signal });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load the day");
        setWindows([]);
        setPanchanga(null);
        return;
      }
      setPanchanga(json.data.panchanga || null);
      setWindows(json.data.windows || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Failed to load the day");
      setWindows([]);
      setPanchanga(null);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [activity, date, place.latitude, place.longitude, place.timezone]);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
    const nextDate = searchParams.get("date");
    if (nextDate) setDate(nextDate);
    const nextActivity = searchParams.get("activity");
    if (nextActivity) setActivity(nextActivity);
  }, [searchParams]);

  useEffect(() => {
    if (!loaded) return;
    void fetchDay();
    return () => abortRef.current?.abort();
    // Place edits apply through Update place; date and activity reload the day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, date, activity]);

  const kalamBands: TimelineBand[] = useMemo(() => {
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

  const muhurtaBands: TimelineBand[] = useMemo(
    () =>
      windows
        .filter((window) => window.startTs && window.endTs)
        .map((window, index) => ({
          id: `${window.rating}-${index}`,
          label: window.rating === "avoid" ? window.cautions[0] || "Avoid" : window.rating,
          start: window.startTime,
          end: window.endTime,
          startTs: window.startTs as number,
          endTs: window.endTs as number,
          tone: RATING_TONE[window.rating],
        })),
    [windows],
  );

  const tithiPct = Math.round((panchanga?.tithi.progress || 0) * 100);
  const activityLabel =
    ACTIVITIES.find((item) => item.value === activity)?.label || "this activity";
  const pick =
    windows.find((window) => window.rating === "excellent") ??
    windows.find((window) => window.rating === "good") ??
    windows[0];
  const excellent = windows.filter((window) => window.rating === "excellent");
  const good = windows.filter((window) => window.rating === "good");
  const moderate = windows.filter((window) => window.rating === "moderate");
  const avoid = windows.filter((window) => window.rating === "avoid");

  function changeTab(next: string) {
    const parsed = parseTab(next);
    setTab(parsed);
    persistQuery({ tab: parsed });
  }

  function changeDate(next: string) {
    setDate(next);
    persistQuery({ date: next });
  }

  function changeActivity(next: string) {
    setActivity(next);
    persistQuery({ activity: next });
  }

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="The day, in five limbs"
        title="Panchanga & Muhurta"
        description="One almanac for the selected place: tithi through karana, then the windows worth starting — or leaving alone."
      />

      <GlassCard className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous day"
              onClick={() => changeDate(shiftDate(date, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight sm:text-xl">
                {formatLongDate(date)}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {place.placeName || "Selected place"} · {place.timezone}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next day"
              onClick={() => changeDate(shiftDate(date, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => changeDate(toLocalDateInput(new Date()))}
            >
              Today
            </Button>
          </div>
          <Input
            type="date"
            value={date}
            aria-label="Choose date"
            className="w-full max-w-[11.5rem] lg:w-auto"
            onChange={(event) => changeDate(event.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="panchanga-place">Place</Label>
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
              <Input
                id="panchanga-place"
                value={place.placeName}
                onChange={(event) => setPlace({ ...place, placeName: event.target.value })}
                placeholder="Place name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="panchanga-lat">Latitude</Label>
            <Input
              id="panchanga-lat"
              value={place.latitude}
              onChange={(event) => setPlace({ ...place, latitude: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panchanga-lon">Longitude</Label>
            <Input
              id="panchanga-lon"
              value={place.longitude}
              onChange={(event) => setPlace({ ...place, longitude: event.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={place.timezone}
            onChange={(event) => setPlace({ ...place, timezone: event.target.value })}
            placeholder="Asia/Kolkata"
            aria-label="Timezone"
            className="max-w-xs"
          />
          <Button type="button" onClick={() => void fetchDay()} disabled={loading}>
            {loading ? "Updating…" : "Update place"}
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
        <Tabs value={tab} onValueChange={changeTab}>
          <TabsList>
            <TabsTrigger value="almanac">Almanac</TabsTrigger>
            <TabsTrigger value="muhurta">Muhurta</TabsTrigger>
            <TabsTrigger value="guide">How to read</TabsTrigger>
          </TabsList>

          <TabsContent value="almanac" className="space-y-4">
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

            <GlassCard className="space-y-4">
              <div>
                <h2 className="font-display text-xl">Day kalam</h2>
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
                bands={kalamBands}
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

            {pick ? (
              <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                    Best window · {activityLabel}
                  </p>
                  <p className="font-display mt-1 text-xl">
                    {pick.startTime} – {pick.endTime}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {pick.rating} · {pick.score}/100
                  </p>
                </div>
                <Button type="button" onClick={() => changeTab("muhurta")}>
                  Open muhurta
                </Button>
              </GlassCard>
            ) : null}
          </TabsContent>

          <TabsContent value="muhurta" className="space-y-4">
            <div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Activity
              </p>
              <div className="mt-2 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {ACTIVITIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeActivity(item.value)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      activity === item.value
                        ? "text-foreground border-[#D4AF37]/50 bg-[#D4AF37]/10"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
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

            {pick ? (
              <GlassCard className="space-y-3 border-[#D4AF37]/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                      Recommended for {activityLabel}
                    </p>
                    <p className="font-display mt-1 text-2xl sm:text-3xl">
                      {pick.startTime} – {pick.endTime}
                    </p>
                  </div>
                  <Badge className={cn("border", RATING_STYLE[pick.rating])}>
                    {pick.rating} · {pick.score}
                  </Badge>
                </div>
                {pick.reasons[0] ? (
                  <p className="text-muted-foreground text-sm">{pick.reasons[0]}</p>
                ) : null}
                <Button asChild>
                  <Link
                    href={northHorizonHref({
                      at: pick.startTs ?? `${pick.date}T${pick.startTime}`,
                      intent: pick.activity === "marriage" ? "marriage" : "muhurta",
                    })}
                  >
                    View celestial configuration
                  </Link>
                </Button>
              </GlassCard>
            ) : null}

            {muhurtaBands.length > 0 ? (
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Windows on the day</h2>
                  <p className="text-muted-foreground text-xs">
                    Scored from this day&apos;s panchanga — Abhijit, nakshatra, yoga, and kalam.
                  </p>
                </div>
                <DayTimeline
                  sunriseTs={panchanga.sunrise.timestamp}
                  sunsetTs={panchanga.sunset.timestamp}
                  sunriseLabel={panchanga.sunrise.time}
                  sunsetLabel={panchanga.sunset.time}
                  bands={muhurtaBands}
                />
              </GlassCard>
            ) : null}

            {!loading && windows.length === 0 && !error ? (
              <EmptyState
                title="No muhurta windows found"
                description="Try a different date or activity."
              />
            ) : null}

            <WindowSection title="Recommended" windows={excellent} />
            <WindowSection title="Good windows" windows={good} />
            <WindowSection title="Moderate" windows={moderate} />
            <WindowSection title="Avoid" windows={avoid} destructive />
          </TabsContent>

          <TabsContent value="guide">
            <GlassCard className="space-y-3 text-sm leading-relaxed">
              <h2 className="font-display text-xl">How the day is read</h2>
              <p>
                Panchanga means five limbs: Tithi (lunar day), Vara (weekday), Nakshatra (the
                Moon&apos;s star), Yoga (Sun and Moon combined), and Karana (half-tithi). Location
                changes sunrise, so every kalam is place-specific.
              </p>
              <p>
                Shukla paksha is the waxing fortnight; Krishna is waning. Purnima is tithi 15;
                Amavasya is tithi 30. Vishti/Bhadra karana and several yogas (Vyatipata, Vaidhrti,
                and others) are traditionally avoided for major starts.
              </p>
              <p>
                Muhurta uses that same day. Abhijit is a short midday window treated as generally
                auspicious. Rahu Kalam, Yamaganda, and Gulika are the three inauspicious eighths of
                daylight. Choose an activity, then start in a recommended window — not during a
                kalam the almanac marks to avoid.
              </p>
              <p className="text-muted-foreground text-xs">
                Showing {formatLongDate(date)}
                {place.placeName ? ` · ${place.placeName}` : ""}.
              </p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
