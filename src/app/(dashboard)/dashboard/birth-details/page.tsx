"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Birth = {
  birthDate?: string | Date;
  birthTime?: string;
  birthTimeUnknown?: boolean;
  placeName?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  chartStylePreference?: string;
  updatedAt?: string;
};

export default function BirthDetailsPage() {
  const [birth, setBirth] = useState<Birth | null>(null);
  const [hasChart, setHasChart] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegen, setShowRegen] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/birth-details").then((r) => r.json()),
      fetch("/api/horoscope").then((r) => r.json()),
    ])
      .then(([birthJson, chartJson]) => {
        if (birthJson.success) {
          setBirth(birthJson.data || {});
          setTimeUnknown(Boolean(birthJson.data?.birthTimeUnknown));
        } else setError(birthJson.error?.message || "Failed to load");
        setHasChart(Boolean(chartJson.success && chartJson.data?.horoscope));
      })
      .catch(() => setError("Failed to load birth details"));
  }, []);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const rawTime = String(form.get("birthTime") || "12:00");
    const payload = {
      birthDate: String(form.get("birthDate")),
      birthTime: timeUnknown ? "12:00:00" : rawTime.length === 5 ? `${rawTime}:00` : rawTime,
      birthTimeUnknown: timeUnknown,
      placeName: String(form.get("placeName")),
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      timezone: String(form.get("timezone") || "Asia/Kolkata"),
      chartStylePreference: String(form.get("chartStylePreference") || "NORTH"),
    };
    const res = await fetch("/api/birth-details", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Save failed");
      return;
    }
    setBirth(json.data);
    setMessage("Birth details saved.");
    if (hasChart) setShowRegen(true);
  }

  const dateValue = birth?.birthDate ? new Date(birth.birthDate).toISOString().slice(0, 10) : "";

  return (
    <div className="relative space-y-4">
      <PageHeader
        eyebrow="Setup"
        title="Birth details"
        description="Your birth date, exact time, and location help us calculate your Vedic birth chart."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Open kundli</Link>
          </Button>
        }
      />

      {showRegen ? (
        <GlassCard className="border-primary/30 bg-primary/5 space-y-3">
          <p className="font-medium">Your birth details changed.</p>
          <p className="text-muted-foreground text-sm">
            Your Kundli and compatibility results may need to be recalculated.
          </p>
          <Button asChild>
            <Link href={routes.kundli}>Regenerate Kundli</Link>
          </Button>
        </GlassCard>
      ) : null}

      <GlassCard className="max-w-2xl space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}
        <p className="text-muted-foreground text-sm">
          Exact birth time improves Ascendant, houses, and relationship indicators. Don&apos;t know
          it? You can still continue with limited chart accuracy.
        </p>
        {birth === null && !error ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <label className="text-sm font-medium" htmlFor="birthDate">
                Birth date
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={dateValue}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="birthTime">
                Birth time
              </label>
              <input
                id="birthTime"
                name="birthTime"
                type="time"
                step={1}
                disabled={timeUnknown}
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2 disabled:opacity-50"
                defaultValue={(birth?.birthTime || "12:00:00").slice(0, 8)}
              />
              <label className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => setTimeUnknown(e.target.checked)}
                />
                I don&apos;t know my exact birth time
              </label>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="placeName">
                Birth location
              </label>
              <input
                id="placeName"
                name="placeName"
                required
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={birth?.placeName || ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium" htmlFor="latitude">
                  Latitude
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  required
                  className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                  defaultValue={birth?.latitude ?? 12.9716}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="longitude">
                  Longitude
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  required
                  className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                  defaultValue={birth?.longitude ?? 77.5946}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="timezone">
                Timezone
              </label>
              <input
                id="timezone"
                name="timezone"
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={birth?.timezone || "Asia/Kolkata"}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="chartStylePreference">
                Chart style
              </label>
              <select
                id="chartStylePreference"
                name="chartStylePreference"
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={birth?.chartStylePreference || "NORTH"}
              >
                <option value="NORTH">North Indian</option>
                <option value="SOUTH">South Indian</option>
                <option value="EAST">East Indian</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save birth details"}
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.kundli}>{hasChart ? "View kundli" : "Generate My Kundli"}</Link>
              </Button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
