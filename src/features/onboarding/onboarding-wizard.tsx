"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MatchCard } from "@/components/ui/premium-cards";
import {
  ProfilePhotoUploader,
  type ProfilePhotoItem,
} from "@/features/profile/components/profile-photo-uploader";
import { evaluateOnboardingReadiness } from "@/features/onboarding/onboarding-status";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  "Getting to know you",
  "Understanding your chart",
  "Your Vedic profile",
  "Finding your alignment",
  "Potential connections",
] as const;

type ChartSummary = {
  lagnaSign?: string;
  moonSign?: string;
  sunSign?: string;
  planets?: Array<{ planet: string; nakshatra?: string }>;
};

type MatchItem = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  compatibilityScore: number;
  headline: string;
  photo: string | null;
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [photos, setPhotos] = useState<ProfilePhotoItem[]>([]);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [chart, setChart] = useState<ChartSummary | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    gender: "UNDISCLOSED",
    dateOfBirth: "",
    city: "",
    profession: "",
    education: "",
    heightCm: "",
    motherTongue: "",
    religion: "",
    community: "",
    about: "",
    birthDate: "",
    birthTime: "12:00",
    placeName: "",
    latitude: "12.9716",
    longitude: "77.5946",
    timezone: "Asia/Kolkata",
    ageMin: "24",
    ageMax: "36",
    prefCities: "",
    prefReligions: "",
  });

  const loadInitial = useCallback(async () => {
    const [me, profileRes, chartRes] = await Promise.all([
      authClient.getSession(),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/horoscope").then((r) => r.json()),
    ]);
    const p = profileRes.success ? profileRes.data?.profile : null;
    const birth = profileRes.success ? profileRes.data?.birthDetails : null;
    const prefs = profileRes.success ? profileRes.data?.preferences : null;
    const name = me.data?.user?.name || "";
    setForm((f) => ({
      ...f,
      name,
      gender: p?.gender || "UNDISCLOSED",
      dateOfBirth: p?.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : "",
      city: p?.city || "",
      profession: p?.profession || "",
      education: p?.education || "",
      heightCm: p?.heightCm ? String(p.heightCm) : "",
      motherTongue: p?.motherTongue || "",
      religion: p?.religion || "",
      community: p?.community || "",
      about: p?.about || "",
      birthDate: birth?.birthDate ? new Date(birth.birthDate).toISOString().slice(0, 10) : "",
      birthTime: (birth?.birthTime || "12:00:00").slice(0, 5),
      placeName: birth?.placeName || "",
      latitude: birth?.latitude != null ? String(birth.latitude) : f.latitude,
      longitude: birth?.longitude != null ? String(birth.longitude) : f.longitude,
      timezone: birth?.timezone || "Asia/Kolkata",
      ageMin: String(prefs?.ageMin ?? 24),
      ageMax: String(prefs?.ageMax ?? 36),
      prefCities: (prefs?.cities || []).join(", "),
      prefReligions: (prefs?.religions || []).join(", "),
    }));
    setTimeUnknown(Boolean(birth?.birthTimeUnknown));
    setPhotos(p?.photos || []);
    if (chartRes.success && chartRes.data?.horoscope) {
      setChart(chartRes.data.horoscope);
    }

    const readiness = evaluateOnboardingReadiness({
      gender: p?.gender,
      city: p?.city,
      profession: p?.profession,
      education: p?.education,
      dateOfBirth: p?.dateOfBirth,
      photos: p?.photos,
      completionScore: p?.completion?.score,
      hasBirthDetails: Boolean(birth?.birthDate),
      hasChart: Boolean(chartRes.success && chartRes.data?.horoscope),
    });

    // Only leave onboarding when fully ready — never bounce on a partial flag.
    if (readiness.ready && p?.onboardingCompletedAt) {
      router.replace(routes.dashboard);
      return;
    }

    // Resume step if partially done — never skip required setup
    if (readiness.hasChart && readiness.hasBirth && p?.city && readiness.hasPhoto) {
      setStep(3);
    } else if (readiness.hasBirth) setStep(2);
    else if (p?.city && p?.profession) setStep(1);
  }, [router]);

  useEffect(() => {
    void loadInitial().catch(() => setError("Could not load your profile"));
  }, [loadInitial]);

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function markComplete() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completeOnboarding: true }),
    });
  }

  async function saveAbout() {
    setBusy(true);
    setError(null);
    if (photos.length === 0) {
      setError("Add a profile photo to continue.");
      setBusy(false);
      return;
    }
    if (!form.gender || form.gender === "UNDISCLOSED") {
      setError("Please select your gender.");
      setBusy(false);
      return;
    }
    if (!form.dateOfBirth || !form.city || !form.profession || !form.education) {
      setError("Please fill the required fields.");
      setBusy(false);
      return;
    }
    try {
      if (form.name.trim() && "updateUser" in authClient) {
        await (authClient as { updateUser: (d: { name: string }) => Promise<unknown> }).updateUser({
          name: form.name.trim(),
        });
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          city: form.city,
          profession: form.profession,
          education: form.education,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
          motherTongue: form.motherTongue || null,
          religion: form.religion || null,
          community: form.community || null,
          about: form.about || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Save failed");
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveBirthAndGenerate() {
    setBusy(true);
    setError(null);
    if (!form.birthDate || !form.placeName) {
      setError("Birth date and place are required.");
      setBusy(false);
      return;
    }
    try {
      const time = timeUnknown
        ? "12:00:00"
        : form.birthTime.length === 5
          ? `${form.birthTime}:00`
          : form.birthTime;
      const birthRes = await fetch("/api/birth-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime: time,
          birthTimeUnknown: timeUnknown,
          placeName: form.placeName,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          timezone: form.timezone || "Asia/Kolkata",
        }),
      });
      const birthJson = await birthRes.json();
      if (!birthJson.success)
        throw new Error(birthJson.error?.message || "Could not save birth details");

      setStep(2);
      setGenPhase(0);
      const phases = [1, 2, 3, 4, 5];
      for (const p of phases) {
        await new Promise((r) => setTimeout(r, 350));
        setGenPhase(p);
      }

      const chartRes = await fetch("/api/horoscope", { method: "POST" });
      const chartJson = await chartRes.json();
      if (!chartJson.success)
        throw new Error(chartJson.error?.message || "Chart generation failed");
      setChart(chartJson.data?.horoscope || null);
      setGenPhase(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep(1);
    } finally {
      setBusy(false);
    }
  }

  async function savePrefs() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageMin: Number(form.ageMin) || 24,
          ageMax: Number(form.ageMax) || 36,
          cities: form.prefCities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          religions: form.prefReligions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Could not save preferences");

      const matchRes = await fetch("/api/recommendations");
      const matchJson = await matchRes.json();
      setMatches(matchJson.success ? matchJson.data?.data || [] : []);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function finishToMatches() {
    setBusy(true);
    try {
      await markComplete();
      router.push(routes.matches);
    } finally {
      setBusy(false);
    }
  }

  const moonNak =
    chart?.planets?.find((p) => p.planet === "Moon")?.nakshatra ||
    chart?.planets?.find((p) => p.planet === "Moon")?.nakshatra;

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-2 sm:max-w-2xl">
      <div className="space-y-3 text-center sm:text-left">
        <p className="text-muted-foreground text-sm">{STEPS[step]}</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          {step === 0
            ? "Let's understand you"
            : step === 1
              ? "When and where were you born?"
              : step === 2
                ? "Understanding your chart"
                : step === 3
                  ? "Tell us what you're looking for"
                  : "People who may align with you"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step === 0
            ? "A few essentials so we can introduce you thoughtfully."
            : step === 1
              ? "Birth details unlock deeper Vedic compatibility."
              : step === 2
                ? "We're preparing your Ascendant, Moon, and relationship patterns."
                : step === 3
                  ? "Preferences help us surface more meaningful connections."
                  : "Based on your profile and Vedic chart."}
        </p>
        <Progress value={progressPct} className="mx-auto max-w-sm sm:mx-0" />
      </div>

      {error ? <p className="text-destructive text-center text-sm sm:text-left">{error}</p> : null}

      <div className="border-border/70 bg-card shadow-soft space-y-5 rounded-2xl border p-5 sm:p-6">
        {step === 0 ? (
          <>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                >
                  <option value="UNDISCLOSED">Select…</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setField("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={form.profession}
                  onChange={(e) => setField("profession", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={form.education}
                  onChange={(e) => setField("education", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block">Profile photo</Label>
                <ProfilePhotoUploader
                  photos={photos}
                  required
                  onChanged={setPhotos}
                  onError={setError}
                  onMessage={() => undefined}
                />
              </div>
            </div>

            <button
              type="button"
              className="text-primary text-sm font-medium hover:underline"
              onClick={() => setShowOptional((v) => !v)}
            >
              {showOptional ? "Hide optional fields" : "Add more (optional)"}
            </button>

            {showOptional ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={form.heightCm}
                    onChange={(e) => setField("heightCm", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tongue">Mother tongue</Label>
                  <Input
                    id="tongue"
                    value={form.motherTongue}
                    onChange={(e) => setField("motherTongue", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={form.religion}
                    onChange={(e) => setField("religion", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="community">Community</Label>
                  <Input
                    id="community"
                    value={form.community}
                    onChange={(e) => setField("community", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="about">About me</Label>
                  <textarea
                    id="about"
                    className="border-input bg-background min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
                    value={form.about}
                    onChange={(e) => setField("about", e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                disabled={busy}
                onClick={() => void saveAbout()}
              >
                {busy ? "Saving…" : "Continue"}
              </Button>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="space-y-2">
              <h2 className="font-display text-xl">
                Your birth details help us understand compatibility.
              </h2>
              <p className="text-muted-foreground text-sm">
                We use your birth date, exact birth time, and birth location to calculate your Vedic
                birth chart.
              </p>
              <p className="text-muted-foreground text-sm">
                Your exact birth time helps us calculate your Ascendant, houses, planetary
                positions, and relationship indicators more accurately.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bdate">Birth date</Label>
                <Input
                  id="bdate"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setField("birthDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="btime">Exact birth time</Label>
                <Input
                  id="btime"
                  type="time"
                  step={1}
                  disabled={timeUnknown}
                  value={form.birthTime}
                  onChange={(e) => setField("birthTime", e.target.value)}
                />
                <label className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                  />
                  I don&apos;t know my exact birth time
                </label>
                {timeUnknown ? (
                  <p className="text-muted-foreground text-xs">
                    Chart accuracy will be limited. You can add the exact time later for better
                    Ascendant and house placements. Basic matching still works.
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="place">Birth location</Label>
                <Input
                  id="place"
                  value={form.placeName}
                  onChange={(e) => setField("placeName", e.target.value)}
                  placeholder="City, Country"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tz">Timezone</Label>
                <Input
                  id="tz"
                  value={form.timezone}
                  onChange={(e) => setField("timezone", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                disabled={busy}
                onClick={() => void saveBirthAndGenerate()}
              >
                {busy ? "Working…" : "Generate My Kundli"}
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            {genPhase < 6 ? (
              <div className="space-y-4 py-4 text-center">
                <p className="font-display text-xl">Calculating planetary positions…</p>
                <ul className="text-muted-foreground mx-auto max-w-xs space-y-2 text-left text-sm">
                  {[
                    "Birth details verified",
                    "Planetary positions calculated",
                    "Nakshatra identified",
                    "Ascendant calculated",
                    "Dasha timeline prepared",
                  ].map((label, i) => (
                    <li key={label} className={cn(genPhase > i ? "text-foreground" : "")}>
                      {genPhase > i ? "✓" : "·"} {label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-display text-center text-xl">Your Vedic profile is ready</h2>
                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  {[
                    ["Ascendant", chart?.lagnaSign],
                    ["Moon", chart?.moonSign],
                    ["Nakshatra", moonNak],
                    ["Sun", chart?.sunSign],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="bg-muted/40 rounded-xl px-2 py-3">
                      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
                      <p className="font-medium">{value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={routes.kundli}>Explore My Kundli</Link>
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="space-y-2">
              <h2 className="font-display text-xl">What are you looking for?</h2>
              <p className="text-muted-foreground text-sm">
                A few preferences help us recommend more meaningful connections.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ageMin">Age from</Label>
                <Input
                  id="ageMin"
                  type="number"
                  value={form.ageMin}
                  onChange={(e) => setField("ageMin", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ageMax">Age to</Label>
                <Input
                  id="ageMax"
                  type="number"
                  value={form.ageMax}
                  onChange={(e) => setField("ageMax", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pcities">Preferred cities (comma-separated)</Label>
                <Input
                  id="pcities"
                  value={form.prefCities}
                  onChange={(e) => setField("prefCities", e.target.value)}
                  placeholder="Mumbai, Bangalore"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prel">Preferred religions (comma-separated)</Label>
                <Input
                  id="prel"
                  value={form.prefReligions}
                  onChange={(e) => setField("prefReligions", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                disabled={busy}
                onClick={() => void savePrefs()}
              >
                {busy ? "Finding meaningful connections…" : "See potential connections"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    const matchRes = await fetch("/api/recommendations");
                    const matchJson = await matchRes.json();
                    setMatches(matchJson.success ? matchJson.data?.data || [] : []);
                    setStep(4);
                  })();
                }}
              >
                Skip for now
              </Button>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            {matches.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {matches.slice(0, 4).map((m) => (
                  <MatchCard
                    key={m.userId}
                    name={m.name}
                    age={m.age ?? 0}
                    city={m.city || "—"}
                    profession={m.profession || "—"}
                    score={m.compatibilityScore}
                    headline={m.headline || "Strong potential alignment"}
                    photo={m.photo || undefined}
                    href={`${routes.matchProfile}?id=${m.userId}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center text-sm">
                We&apos;ll show more people as the community grows. You can explore Search anytime.
              </p>
            )}
            <Button
              type="button"
              className="w-full"
              disabled={busy}
              onClick={() => void finishToMatches()}
            >
              {busy ? "Opening…" : "Continue to Matches"}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
