"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";

import type { CelestialSnapshot } from "@/application/horoscope/celestial-horizon.types";
import { lerpAngle } from "@/application/horoscope/horizon-coordinates";
import { EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CelestialSkyMap,
  grahaTitle,
  nakshatraHint,
  type HorizonFilter,
  type SkyLayers,
  type SkyViewMode,
} from "@/features/horoscope/components/celestial-sky-map";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const TIME_PRESETS = [
  { id: "now", label: "Now", hours: 0 },
  { id: "h1", label: "−1 h", hours: -1 },
  { id: "h3", label: "−3 h", hours: -3 },
  { id: "h6", label: "−6 h", hours: -6 },
  { id: "h12", label: "−12 h", hours: -12 },
  { id: "d1", label: "−1 day", hours: -24 },
] as const;

const AI_PROMPTS = [
  "Why is my Moon important right now?",
  "What does my rising sign mean?",
  "Explain the Nakshatra rising now.",
  "How is today's sky different from my birth sky?",
  "What does this planetary alignment mean according to Vedic astrology?",
];

function isoFromLocal(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function localInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function offsetIso(hours: number) {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

function interpolateSnapshot(
  from: CelestialSnapshot,
  to: CelestialSnapshot,
  t: number,
): CelestialSnapshot {
  const mix = (a: number, b: number) => a + (b - a) * t;
  const mixPoint = (
    a: CelestialSnapshot["ascendant"],
    b: CelestialSnapshot["ascendant"],
  ): CelestialSnapshot["ascendant"] => ({
    ...b,
    altitude: mix(a.altitude, b.altitude),
    azimuth: lerpAngle(a.azimuth, b.azimuth, t),
  });
  return {
    ...to,
    ascendant: mixPoint(from.ascendant, to.ascendant),
    midheaven:
      from.midheaven && to.midheaven ? mixPoint(from.midheaven, to.midheaven) : to.midheaven,
    planets: to.planets.map((planet) => {
      const prev = from.planets.find((row) => row.planet === planet.planet);
      if (!prev) return planet;
      const altitude = mix(prev.altitude, planet.altitude);
      return {
        ...planet,
        altitude,
        azimuth: lerpAngle(prev.azimuth, planet.azimuth, t),
        aboveHorizon: altitude > 0,
      };
    }),
    eclipticPath: to.eclipticPath.map((point, i) => {
      const prev = from.eclipticPath[i];
      if (!prev) return point;
      return {
        ...point,
        altitude: mix(prev.altitude, point.altitude),
        azimuth: lerpAngle(prev.azimuth, point.azimuth, t),
      };
    }),
  };
}

function houseOrdinal(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

function visibilityLabel(status: string, above: boolean) {
  if (status === "rising") return "Rising in the east";
  if (status === "near-rising") return "Near the eastern horizon";
  if (status === "setting") return "Setting in the west";
  return above ? "Above horizon" : "Below horizon";
}

function placementNote(planet: string, house: number, sign: string) {
  const houses: Record<number, string> = {
    1: "identity and first impressions",
    2: "speech, family resources, and values",
    4: "home and emotional roots",
    7: "partnership and public relating",
    10: "duty, career, and visibility",
  };
  const theme = houses[house] || "the themes of that house";
  return `${planet} is currently in ${sign}, the ${houseOrdinal(house)} house from the current lagna — traditionally associated with ${theme}. This is a calculated placement, not a prediction.`;
}

export function NorthHorizonExplorer() {
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
  const initialAt = params.get("at");
  const initialMode = params.get("mode") === "birth" ? "birth" : "live";
  const intent = params.get("intent");
  const muhurta = intent === "muhurta";
  const marriageSky = intent === "marriage";

  const [mode, setMode] = useState<"live" | "birth">(initialMode);
  const [at, setAt] = useState(initialAt || new Date().toISOString());
  const [preset, setPreset] = useState(initialAt ? "custom" : "now");
  const [locSource, setLocSource] = useState<"birth" | "device">("birth");
  const [device, setDevice] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<SkyViewMode>("sky");
  const [layers, setLayers] = useState<SkyLayers>({
    zodiac: true,
    nakshatra: true,
    planets: true,
    horizon: true,
    houses: false,
    constellations: false,
  });
  const [filter, setFilter] = useState<HorizonFilter>("all");
  const [paused, setPaused] = useState(Boolean(initialAt));
  const [lagnaOpen, setLagnaOpen] = useState(false);
  const [offsetHours, setOffsetHours] = useState(0);
  const hasSky = useRef(false);
  const sliderTimer = useRef<number | null>(null);
  const [data, setData] = useState<CelestialSnapshot | null>(null);
  const [sky, setSky] = useState<CelestialSnapshot | null>(null);
  const fromSky = useRef<CelestialSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [nakOpen, setNakOpen] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [desktopPanel, setDesktopPanel] = useState(false);

  const load = useCallback(async () => {
    const quiet = hasSky.current;
    if (!quiet) {
      setLoading(true);
      setError(null);
      setCode(null);
    }
    const q = new URLSearchParams({ mode });
    if (mode === "live") q.set("at", at);
    if (locSource === "device" && device) {
      q.set("latitude", String(device.lat));
      q.set("longitude", String(device.lng));
      q.set("locationSource", "device");
      q.set("locationLabel", "Current location");
    } else {
      q.set("locationSource", "birth");
    }
    try {
      const res = await fetch(`/api/celestial-horizon?${q.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setData(null);
        hasSky.current = false;
        setError(json.error?.message || "We couldn't calculate the sky for this moment.");
        setCode(json.error?.code || null);
        return;
      }
      setData(json.data as CelestialSnapshot);
      setError(null);
      setCode(null);
      hasSky.current = true;
    } catch {
      setData(null);
      hasSky.current = false;
      setError("We couldn't calculate the sky for this moment.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [mode, at, locSource, device]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (sliderTimer.current) window.clearTimeout(sliderTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "live" || paused || preset !== "now") return;
    const id = window.setInterval(() => {
      setAt(new Date().toISOString());
    }, 60_000);
    return () => window.clearInterval(id);
  }, [mode, paused, preset]);

  useEffect(() => {
    const nextAt = params.get("at");
    const nextMode = params.get("mode");
    if (nextAt) {
      setAt(nextAt);
      setPreset("custom");
    }
    if (nextMode === "birth") setMode("birth");
    else if (nextAt) setMode("live");
  }, [params]);

  useEffect(() => {
    if (!data) {
      setSky(null);
      fromSky.current = null;
      return;
    }
    if (reduceMotion || !fromSky.current) {
      setSky(data);
      fromSky.current = data;
      return;
    }
    const origin = fromSky.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 700);
      setSky(interpolateSnapshot(origin, data, t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromSky.current = data;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data, reduceMotion]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopPanel(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function applyPreset(hours: number, id: string) {
    setPreset(id);
    setMode("live");
    setOffsetHours(hours);
    setPaused(id !== "now");
    setAt(offsetIso(hours));
  }

  function stepHours(delta: number) {
    const next = Math.max(-12, Math.min(12, offsetHours + delta));
    setMode("live");
    setPaused(true);
    setPreset("custom");
    setOffsetHours(next);
    setAt(offsetIso(next));
  }

  function shiftAt(hours: number) {
    setMode("live");
    setPaused(true);
    setPreset("custom");
    setAt(new Date(new Date(at).getTime() + hours * 3600_000).toISOString());
  }

  function goNow() {
    setMode("live");
    setPaused(false);
    setPreset("now");
    setOffsetHours(0);
    setAt(new Date().toISOString());
  }

  function readDeviceLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocSource("device");
      },
      () => setError("Could not read current location."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function askGuru(prompt: string) {
    if (!data) return;
    setAiBusy(true);
    setAiAnswer(null);
    const context = [
      "Calculated by VedaMilan astrology engine (Swiss Ephemeris, Lahiri).",
      `Mode ${data.mode}. Time ${data.timestamp}. Place ${data.location.label}.`,
      `Ascendant ${data.ascendant.sign} ${data.ascendant.degreeInSign}, ${data.ascendant.nakshatra} pada ${data.ascendant.nakshatraPada}.`,
      `Planets: ${data.planets.map((p) => `${p.planet} ${p.sign} ${p.degreeInSign} alt ${p.altitude}° az ${p.azimuth}° ${p.status}`).join("; ")}.`,
      "Explain only from this calculated context. Do not invent positions.",
      prompt,
    ].join("\n");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "ASTROLOGER_GURU", message: context }),
      });
      const json = await res.json();
      setAiAnswer(
        json.success
          ? String(json.data?.answer || "")
          : json.error?.message || "Could not explain this sky.",
      );
    } catch {
      setAiAnswer("Could not explain this sky.");
    } finally {
      setAiBusy(false);
    }
  }

  const selectedBody = data?.planets.find((p) => p.planet === selected) || null;
  const nakMeta = nakOpen ? nakshatraHint(nakOpen) : null;
  const transitInsight = useMemo(() => {
    if (!data?.natal) return null;
    const saturn = data.planets.find((p) => p.planet === "Saturn");
    if (!saturn || saturn.houseFromNatalLagna == null) return null;
    return {
      title: "Saturn transit",
      body: `Saturn is currently transiting ${saturn.sign}, the ${houseOrdinal(saturn.houseFromNatalLagna)} house from your natal lagna (${data.natal.lagnaSign}). Your natal Moon is in ${data.natal.moonSign || "—"}. Worth exploring in Gochar — according to this Vedic framework, not a guaranteed event.`,
    };
  }, [data]);

  const risingCopy = useMemo(() => {
    if (!selectedBody) return null;
    const place = data?.location.label || "this location";
    if (selectedBody.status === "rising") {
      return `${selectedBody.planet} is rising in the east from ${place}.`;
    }
    if (selectedBody.status === "near-rising") {
      return `${selectedBody.planet} is near the eastern horizon from ${place}.`;
    }
    if (selectedBody.status === "setting") {
      return `${selectedBody.planet} is setting in the west.`;
    }
    return null;
  }, [selectedBody, data?.location.label]);

  const skyTab = mode === "birth" ? "birth" : paused && preset !== "now" ? "explore" : "live";

  return (
    <div
      data-dashboard-bleed
      className="flex min-h-0 w-full flex-1 flex-col gap-2 lg:h-full lg:min-h-0 lg:overflow-hidden"
    >
      <header className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="font-display text-lg tracking-tight sm:text-xl">Horizon</h1>
          <Tabs
            value={skyTab}
            onValueChange={(v) => {
              if (v === "birth") {
                setMode("birth");
                return;
              }
              if (v === "explore") {
                setMode("live");
                setPaused(true);
                setPreset("custom");
                return;
              }
              goNow();
            }}
          >
            <TabsList>
              <TabsTrigger value="live">Live sky</TabsTrigger>
              <TabsTrigger value="birth">Birth sky</TabsTrigger>
              <TabsTrigger value="explore">Explore sky</TabsTrigger>
            </TabsList>
          </Tabs>
          {mode === "live" ? (
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
              <span
                className={cn(
                  "bg-gold h-1.5 w-1.5 rounded-full",
                  !paused && !reduceMotion && "animate-pulse",
                )}
              />
              {paused ? "Paused" : "Live"}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {mode === "live" ? (
            <div className="flex items-center gap-1.5">
              <Label htmlFor="nh-at" className="sr-only">
                Date and time
              </Label>
              <input
                id="nh-at"
                type="datetime-local"
                className="border-input bg-background h-8 min-w-[11.5rem] rounded-md border px-2 text-xs tabular-nums"
                value={localInput(at)}
                onChange={(e) => {
                  setPreset("custom");
                  setPaused(true);
                  setAt(isoFromLocal(e.target.value));
                }}
              />
            </div>
          ) : (
            <p className="text-muted-foreground max-w-[20rem] truncate text-xs">
              {data?.natal?.birthLabel || "Birth sky"}
            </p>
          )}
          <span className="text-muted-foreground inline-flex max-w-[14rem] items-center gap-1 truncate text-xs">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {data?.location.label || "Location"}
          </span>
          {data ? (
            <Badge variant="outline" className="text-[10px]">
              {data.location.timezone}
            </Badge>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => setLocSource("birth")}>
            Birth
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => readDeviceLocation()}>
            Here
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setHelp(true)}>
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
        </div>
      </header>

      {muhurta || marriageSky ? (
        <p className="text-muted-foreground shrink-0 text-xs">
          {marriageSky ? "Marriage sky" : "Muhurta sky"} for the selected window.{" "}
          <Link
            href={muhurta ? routes.astrologyMuhurta : routes.marriageTiming}
            className="underline"
          >
            Why this time?
          </Link>
        </p>
      ) : null}

      {error ? (
        <EmptyState
          title={
            code === "NOT_FOUND" && mode === "birth"
              ? "Add your birth details to explore your personal sky."
              : error.toLowerCase().includes("location")
                ? "Choose a location to explore the sky."
                : "We could not calculate the sky for this moment."
          }
          description={error}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="outline" onClick={() => void load()}>
                Retry
              </Button>
              <Button asChild>
                <Link href={routes.birthDetails}>Add birth details</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="grid min-h-0 flex-1 gap-2 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
            <section className="border-border/60 bg-card/40 relative flex min-h-[min(70dvh,42rem)] min-w-0 flex-col overflow-hidden rounded-2xl border lg:min-h-0">
              {loading && !data ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
                  <div
                    className={cn(
                      "border-gold/40 h-16 w-16 rounded-full border-2 border-t-transparent",
                      !reduceMotion && "animate-spin",
                    )}
                  />
                  <p className="text-muted-foreground text-sm">Mapping the sky…</p>
                </div>
              ) : data ? (
                <>
                  <div className="relative min-h-0 flex-1 p-1 sm:p-2">
                    <CelestialSkyMap
                      snapshot={sky || data}
                      layers={layers}
                      viewMode={viewMode}
                      selected={selected}
                      filter={filter}
                      onSelect={setSelected}
                      onNakshatra={setNakOpen}
                      onLagna={() => setLagnaOpen(true)}
                      fill
                    />
                    <div className="pointer-events-none absolute inset-0 z-20 p-2 sm:p-3">
                      <div className="pointer-events-auto flex max-w-[min(100%,22rem)] flex-wrap gap-1">
                        {(
                          [
                            ["sky", "Sky"],
                            ["vedic", "Vedic"],
                            ["learning", "Learn"],
                          ] as const
                        ).map(([id, label]) => (
                          <Button
                            key={id}
                            type="button"
                            size="sm"
                            variant={viewMode === id ? "default" : "outline"}
                            className="bg-background/80 h-7 px-2 text-[10px] backdrop-blur-sm"
                            onClick={() => {
                              setViewMode(id);
                              if (id === "vedic") {
                                setLayers((s) => ({ ...s, houses: true, nakshatra: true }));
                              }
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <div className="pointer-events-auto absolute top-2 right-2 sm:top-3 sm:right-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="bg-background/80 h-7 gap-1 px-2 text-[10px] backdrop-blur-sm"
                            >
                              <Layers className="size-3" />
                              Layers
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-44 p-2 text-[11px]"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <p className="text-muted-foreground mb-1.5 text-[10px] tracking-[0.14em] uppercase">
                              Sky layers
                            </p>
                            {(
                              [
                                ["planets", "Planets"],
                                ["zodiac", "Rashis"],
                                ["nakshatra", "Nakshatras"],
                                ["houses", "Houses"],
                                ["horizon", "Horizon line"],
                                ["constellations", "Stars"],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key} className="flex items-center gap-1.5 py-0.5">
                                <input
                                  type="checkbox"
                                  checked={layers[key]}
                                  onChange={(e) =>
                                    setLayers((s) => ({ ...s, [key]: e.target.checked }))
                                  }
                                />
                                {label}
                              </label>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="pointer-events-auto absolute bottom-2 left-2 flex flex-wrap gap-1 sm:bottom-3 sm:left-3">
                        {(
                          [
                            ["all", "All"],
                            ["above", "Above"],
                            ["below", "Below"],
                          ] as const
                        ).map(([id, label]) => (
                          <Button
                            key={id}
                            type="button"
                            size="sm"
                            variant={filter === id ? "default" : "outline"}
                            className="bg-background/80 h-7 px-2 text-[10px] backdrop-blur-sm"
                            onClick={() => setFilter(id)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground px-3 pb-2 text-center text-[10px]">
                    Calculated by VedaMilan astrology engine · Lahiri sidereal
                  </p>
                </>
              ) : null}
            </section>

            {data ? (
              <aside className="scrollbar-premium hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
                {desktopPanel && selectedBody ? (
                  <GlassCard className="space-y-2 p-4">
                    <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                      Selected
                    </p>
                    <p className="font-display text-2xl">{grahaTitle(selectedBody.planet)}</p>
                    <p className="text-sm">
                      {selectedBody.sign} {selectedBody.degreeInSign}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {selectedBody.nakshatra} · pada {selectedBody.nakshatraPada}
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>House {houseOrdinal(selectedBody.houseFromCurrentLagna)} from lagna</li>
                      <li>
                        Alt {selectedBody.altitude.toFixed(1)}° · Az{" "}
                        {selectedBody.azimuth.toFixed(1)}°
                      </li>
                      <li>{visibilityLabel(selectedBody.status, selectedBody.aboveHorizon)}</li>
                      {selectedBody.dignity ? <li>Dignity · {selectedBody.dignity}</li> : null}
                      <li>Motion · {selectedBody.isRetrograde ? "retrograde" : "direct"}</li>
                    </ul>
                    {risingCopy ? <p className="text-xs leading-relaxed">{risingCopy}</p> : null}
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {placementNote(
                        selectedBody.planet,
                        selectedBody.houseFromCurrentLagna,
                        selectedBody.sign,
                      )}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ai"
                      onClick={() =>
                        void askGuru(`Ask AI about ${selectedBody.planet} in this calculated sky.`)
                      }
                    >
                      Ask AI Guru about {selectedBody.planet}
                    </Button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link href={routes.kundli}>Kundli</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={routes.astrologyNakshatra}>Nakshatra</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={routes.gochar}>Transit</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={routes.planets}>Planet</Link>
                      </Button>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard className="space-y-2 p-4">
                    <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                      What is rising
                    </p>
                    <p className="font-display text-2xl">{data.ascendant.sign} rising</p>
                    <p className="text-sm">
                      {data.ascendant.degreeInSign} · {data.ascendant.nakshatra} · pada{" "}
                      {data.ascendant.nakshatraPada}
                    </p>
                    {data.midheaven ? (
                      <p className="text-muted-foreground text-xs">
                        Midheaven · {data.midheaven.sign} {data.midheaven.degreeInSign}
                      </p>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <Link href={routes.kundli}>Understand my ascendant</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ai"
                      onClick={() => void askGuru("What does my rising sign mean?")}
                    >
                      Ask AI about my Lagna
                    </Button>
                  </GlassCard>
                )}

                <GlassCard className="space-y-2 p-4">
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                    Celestial snapshot
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    <li>Rising sign · {data.snapshot.risingSign}</li>
                    <li>
                      Moon · {data.moonSign || "—"} · {data.moonNakshatra || "—"}
                    </li>
                    <li>Current nakshatra · {data.snapshot.currentNakshatra}</li>
                    <li>Closest to horizon · {data.snapshot.closestToHorizon || "—"}</li>
                    <li>Strongest visible · {data.snapshot.strongestVisible || "—"}</li>
                  </ul>
                </GlassCard>

                {transitInsight ? (
                  <GlassCard className="space-y-2 p-4">
                    <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                      {transitInsight.title}
                    </p>
                    <p className="text-xs leading-relaxed">{transitInsight.body}</p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={routes.gochar}>View transit</Link>
                    </Button>
                  </GlassCard>
                ) : null}

                <GlassCard className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary h-4 w-4" />
                    <p className="font-display text-base">Ask about this sky</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {AI_PROMPTS.slice(0, 3).map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-auto justify-start py-1.5 text-left text-[11px] whitespace-normal"
                        disabled={aiBusy}
                        onClick={() => void askGuru(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                  {aiBusy ? (
                    <p className="text-muted-foreground text-xs">
                      Explaining from calculated positions…
                    </p>
                  ) : null}
                  {aiAnswer ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                  ) : null}
                </GlassCard>
              </aside>
            ) : null}
          </div>

          {data ? (
            <div className="border-border/60 bg-card/50 shrink-0 space-y-2 rounded-2xl border p-2 sm:p-3">
              {mode === "live" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => shiftAt(-24)}
                  >
                    −1 day
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => stepHours(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    −1 h
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      if (paused && preset === "now") setAt(new Date().toISOString());
                      setPaused((p) => !p);
                    }}
                  >
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {paused ? "Play" : "Pause"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => stepHours(1)}
                  >
                    +1 h
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => shiftAt(24)}
                  >
                    +1 day
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === "now" && !paused ? "default" : "outline"}
                    className="shrink-0"
                    onClick={() => goNow()}
                  >
                    Now
                  </Button>
                  {TIME_PRESETS.filter((p) => p.id !== "now").map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      size="sm"
                      variant={preset === p.id ? "default" : "outline"}
                      className="hidden shrink-0 md:inline-flex"
                      onClick={() => applyPreset(p.hours, p.id)}
                    >
                      {p.label}
                    </Button>
                  ))}
                  <p className="text-muted-foreground ml-auto text-[11px] tabular-nums">
                    {new Date(at).toLocaleString()}
                  </p>
                </div>
              ) : null}
              {mode === "live" ? (
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-10 shrink-0 text-[11px]">−12h</span>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={offsetHours}
                    aria-label="Explore sky timeline"
                    className="accent-primary w-full"
                    onChange={(e) => {
                      const hours = Number(e.target.value);
                      setOffsetHours(hours);
                      setPaused(true);
                      setPreset(hours === 0 ? "now" : "custom");
                      if (sliderTimer.current) window.clearTimeout(sliderTimer.current);
                      sliderTimer.current = window.setTimeout(() => {
                        setAt(offsetIso(hours));
                      }, 350);
                    }}
                  />
                  <span className="text-muted-foreground w-10 shrink-0 text-right text-[11px]">
                    +12h
                  </span>
                </div>
              ) : null}
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-[11px] lg:hidden">
                <span>Rising · {data.snapshot.risingSign}</span>
                <span>Moon · {data.moonNakshatra || "—"}</span>
                <span>Strongest · {data.snapshot.strongestVisible || "—"}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Sheet
        open={Boolean(selectedBody) && !desktopPanel}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent
          side="bottom"
          className="md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[min(100%,24rem)] md:rounded-none"
        >
          {selectedBody ? (
            <>
              <SheetHeader>
                <SheetTitle>{grahaTitle(selectedBody.planet)}</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 overflow-y-auto px-4 pb-6 text-sm">
                <p>
                  {selectedBody.sign} {selectedBody.degreeInSign}
                </p>
                <p>
                  Nakshatra {selectedBody.nakshatra} · pada {selectedBody.nakshatraPada}
                </p>
                <p>House {houseOrdinal(selectedBody.houseFromCurrentLagna)} from current lagna</p>
                {selectedBody.houseFromNatalLagna != null ? (
                  <p>House {houseOrdinal(selectedBody.houseFromNatalLagna)} from natal lagna</p>
                ) : null}
                <p>
                  Altitude {selectedBody.altitude.toFixed(1)}° · Azimuth{" "}
                  {selectedBody.azimuth.toFixed(1)}°
                </p>
                <p>{visibilityLabel(selectedBody.status, selectedBody.aboveHorizon)}</p>
                {selectedBody.dignity ? <p>Dignity · {selectedBody.dignity}</p> : null}
                <p>Motion · {selectedBody.isRetrograde ? "retrograde" : "direct"}</p>
                {risingCopy ? <p className="text-muted-foreground">{risingCopy}</p> : null}
                <div className="border-border/60 space-y-1 rounded-xl border p-3">
                  <p className="text-[10px] tracking-wide uppercase">Why this matters</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {placementNote(
                      selectedBody.planet,
                      selectedBody.houseFromCurrentLagna,
                      selectedBody.sign,
                    )}
                  </p>
                </div>
                <p className="text-muted-foreground text-[11px]">Explore this placement</p>
                <div className="flex flex-col gap-2 pt-1">
                  <Button asChild>
                    <Link href={routes.planets}>View planet</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={routes.astrologyNakshatra}>Understand this Nakshatra</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={routes.gochar}>View transit</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={routes.kundli}>View house meaning</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ai"
                    onClick={() =>
                      void askGuru(`Ask AI about ${selectedBody.planet} in this calculated sky.`)
                    }
                  >
                    Ask AI about {selectedBody.planet}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(nakMeta)} onOpenChange={(o) => !o && setNakOpen(null)}>
        <SheetContent side="bottom">
          {nakMeta ? (
            <>
              <SheetHeader>
                <SheetTitle>{nakMeta.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 px-4 pb-6 text-sm">
                <p>Deity · {nakMeta.deity}</p>
                <p>Symbol · {nakMeta.symbol}</p>
                <p>Ruling planet · {nakMeta.lord}</p>
                <Button
                  type="button"
                  variant="ai"
                  className="mt-2"
                  onClick={() =>
                    void askGuru(`Ask AI about ${nakMeta.name} Nakshatra from this calculated sky.`)
                  }
                >
                  Ask AI about {nakMeta.name}
                </Button>
                <Button asChild className="mt-1">
                  <Link href={routes.astrologyNakshatra}>Understand this Nakshatra</Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={lagnaOpen} onOpenChange={setLagnaOpen}>
        <SheetContent
          side="bottom"
          className="md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[min(100%,24rem)] md:rounded-none"
        >
          {data ? (
            <>
              <SheetHeader>
                <SheetTitle>{data.ascendant.sign} rising</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 px-4 pb-6 text-sm">
                <p>
                  {data.ascendant.degreeInSign} · {data.ascendant.nakshatra} · pada{" "}
                  {data.ascendant.nakshatraPada}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The Ascendant is the zodiac sign rising on the eastern horizon at this time and
                  place. It is calculated by the VedaMilan engine, not by the visualization.
                </p>
                <Button asChild>
                  <Link href={routes.kundli}>Understand my ascendant</Link>
                </Button>
                <Button
                  type="button"
                  variant="ai"
                  onClick={() => void askGuru("Ask AI about my Lagna from this calculated sky.")}
                >
                  Ask AI about my Lagna
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={help} onOpenChange={setHelp}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>What am I seeing?</SheetTitle>
          </SheetHeader>
          <ul className="text-muted-foreground space-y-2 px-4 pb-6 text-sm leading-relaxed">
            <li>
              <span className="text-foreground font-medium">Horizon</span> — the circle where the
              sky meets the earth from this location.
            </li>
            <li>
              <span className="text-foreground font-medium">Ascendant</span> — the zodiac sign
              rising on the eastern horizon at this time and place.
            </li>
            <li>
              <span className="text-foreground font-medium">East / West</span> — east is rising;
              west is setting.
            </li>
            <li>
              <span className="text-foreground font-medium">Altitude</span> — height above the
              horizon. 90° is overhead.
            </li>
            <li>
              <span className="text-foreground font-medium">Azimuth</span> — compass direction. 0°
              north, 90° east.
            </li>
            <li>
              <span className="text-foreground font-medium">Nakshatra / Zodiac</span> — sidereal
              Lahiri divisions from the same engine as your kundli.
            </li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
