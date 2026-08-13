"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarIcon, MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/lib/constants/routes";

type Panchanga = {
  tithi: { number: number; name: string; progress: number };
  vara: { number: number; name: string; english: string };
  nakshatra: { index: number; name: string; lord: string };
  yoga: { index: number; name: string };
  karana: { index: number; name: string; type: "moving" | "fixed" };
  sunrise: { time: string; timestamp: number };
  sunset: { time: string; timestamp: number };
  rahuKalam: { start: string; end: string };
  yamaganda: { start: string; end: string };
  gulika: { start: string; end: string };
  abhijit: { start: string; end: string } | null;
};

export default function AstrologyPanchangaPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [panchanga, setPanchanga] = useState<Panchanga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPanchanga = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date: date.toISOString().split("T")[0] || "",
        latitude,
        longitude,
        timezone,
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
  }, [date, latitude, longitude, timezone]);

  useEffect(() => {
    void fetchPanchanga();
  }, [fetchPanchanga]);

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Daily Vedic calendar"
        title="Panchanga"
        description="Vara, Tithi, Nakshatra, Yoga, Karana — plus sunrise, sunset, Rahu Kalam, Yamaganda, and Gulika."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.astrologyMuhurta}>Muhurta Finder</Link>
          </Button>
        }
      />

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Label>Timezone</Label>
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Timezone"
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
        </div>
        <Button onClick={fetchPanchanga} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Loading..." : "Update Panchanga"}
        </Button>
      </GlassCard>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {panchanga ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Tithi", value: `${panchanga.tithi.name} (${panchanga.tithi.number})` },
            { label: "Vara", value: panchanga.vara.name },
            {
              label: "Nakshatra",
              value: `${panchanga.nakshatra.name} · Lord ${panchanga.nakshatra.lord}`,
            },
            { label: "Yoga", value: panchanga.yoga.name },
            { label: "Karana", value: `${panchanga.karana.name} (${panchanga.karana.type})` },
            { label: "Sunrise", value: panchanga.sunrise.time },
            { label: "Sunset", value: panchanga.sunset.time },
            {
              label: "Rahu Kalam",
              value: `${panchanga.rahuKalam.start} – ${panchanga.rahuKalam.end}`,
            },
            {
              label: "Yamaganda",
              value: `${panchanga.yamaganda.start} – ${panchanga.yamaganda.end}`,
            },
            { label: "Gulika", value: `${panchanga.gulika.start} – ${panchanga.gulika.end}` },
          ].map((item) => (
            <GlassCard key={item.label} className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                {item.label}
              </p>
              <p className="text-sm font-medium">{item.value}</p>
            </GlassCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
