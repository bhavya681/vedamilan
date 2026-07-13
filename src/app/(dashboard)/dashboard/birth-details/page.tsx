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
  placeName?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  chartStylePreference?: string;
};

export default function BirthDetailsPage() {
  const [birth, setBirth] = useState<Birth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/birth-details")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBirth(json.data || {});
        else setError(json.error?.message || "Failed to load");
      })
      .catch(() => setError("Failed to load birth details"));
  }, []);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      birthDate: String(form.get("birthDate")),
      birthTime: String(form.get("birthTime")),
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
    setMessage("Birth details saved — ready for horoscope engine (Module 4)");
  }

  const dateValue = birth?.birthDate ? new Date(birth.birthDate).toISOString().slice(0, 10) : "";

  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Birth Details"
        description="Precise time and place unlock authentic Vedic charts"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Open kundli</Link>
          </Button>
        }
      />
      <GlassCard className="max-w-2xl space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}
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
                required
                step={1}
                className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                defaultValue={(birth?.birthTime || "12:00:00").slice(0, 8)}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="placeName">
                Place
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save birth details"}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
