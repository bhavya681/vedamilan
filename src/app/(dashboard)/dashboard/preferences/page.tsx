"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Prefs = {
  ageMin?: number;
  ageMax?: number;
  cities?: string[];
  educations?: string[];
  diet?: string[];
  religions?: string[];
  minCompatibilityScore?: number;
  notes?: string;
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/preferences")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPrefs(json.data || { ageMin: 24, ageMax: 36, cities: [] });
        else setError(json.error?.message || "Failed to load");
      })
      .catch(() => setError("Failed to load preferences"));
  }, []);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      ageMin: Number(form.get("ageMin")),
      ageMax: Number(form.get("ageMax")),
      cities: String(form.get("cities") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      educations: String(form.get("educations") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      diet: String(form.get("diet") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      religions: String(form.get("religions") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      minCompatibilityScore: Number(form.get("minCompatibilityScore") || 18),
      notes: String(form.get("notes") || ""),
    };
    const res = await fetch("/api/preferences", {
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
    setPrefs(json.data);
    setMessage("Preferences saved");
  }

  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Partner Preferences"
        description="Intentional filters for discovery"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.dashboard}>Back to overview</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive mb-4 text-sm">{error}</p> : null}
      {message ? <p className="text-emerald mb-4 text-sm">{message}</p> : null}
      <form onSubmit={onSave}>
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Age</p>
            <div className="mt-3 flex gap-3">
              <input
                name="ageMin"
                type="number"
                className="border-input bg-background w-full rounded-xl border px-3 py-2"
                defaultValue={prefs?.ageMin ?? 24}
                min={18}
                max={80}
              />
              <input
                name="ageMax"
                type="number"
                className="border-input bg-background w-full rounded-xl border px-3 py-2"
                defaultValue={prefs?.ageMax ?? 36}
                min={18}
                max={80}
              />
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Cities</p>
            <input
              name="cities"
              className="border-input bg-background mt-3 w-full rounded-xl border px-3 py-2"
              defaultValue={(prefs?.cities || []).join(", ")}
              placeholder="Bengaluru, Mumbai"
            />
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Education</p>
            <input
              name="educations"
              className="border-input bg-background mt-3 w-full rounded-xl border px-3 py-2"
              defaultValue={(prefs?.educations || []).join(", ")}
            />
          </GlassCard>
          <GlassCard>
            <p className="text-muted-foreground text-xs uppercase">Lifestyle / Religion</p>
            <input
              name="diet"
              className="border-input bg-background mt-3 w-full rounded-xl border px-3 py-2"
              defaultValue={(prefs?.diet || []).join(", ")}
              placeholder="Diet preferences"
            />
            <input
              name="religions"
              className="border-input bg-background mt-2 w-full rounded-xl border px-3 py-2"
              defaultValue={(prefs?.religions || []).join(", ")}
              placeholder="Religions"
            />
          </GlassCard>
          <GlassCard className="md:col-span-2">
            <p className="text-muted-foreground text-xs uppercase">Min compatibility (guna)</p>
            <input
              name="minCompatibilityScore"
              type="number"
              min={0}
              max={36}
              className="border-input bg-background mt-3 w-full max-w-xs rounded-xl border px-3 py-2"
              defaultValue={prefs?.minCompatibilityScore ?? 18}
            />
            <textarea
              name="notes"
              className="border-input bg-background mt-3 w-full rounded-xl border px-3 py-2"
              rows={3}
              defaultValue={prefs?.notes || ""}
              placeholder="Notes for your search"
            />
            <Button type="submit" className="mt-4" disabled={loading || !prefs}>
              {loading ? "Saving…" : "Save preferences"}
            </Button>
          </GlassCard>
        </div>
      </form>
    </div>
  );
}
