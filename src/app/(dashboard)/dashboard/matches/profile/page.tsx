"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type Candidate = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  company: string | null;
  headline: string | null;
  about: string | null;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  manglik: string;
  strengths: string[];
  challenges: string[];
};

export default function MatchProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Select a profile from Match feed.");
      return;
    }
    void fetch(`/api/matches/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Profile not found");
          return;
        }
        setProfile(json.data.profile);
      })
      .catch(() => setError("Failed to load profile"));
  }, [id]);

  async function sendInterest() {
    if (!id) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: id, type: "INTEREST" }),
    });
    const json = await res.json();
    setBusy(false);
    setMessage(json.success ? "Interest sent." : json.error?.message || "Failed");
  }

  async function shortlist() {
    if (!id) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: id }),
    });
    const json = await res.json();
    setBusy(false);
    setMessage(json.success ? "Added to shortlist." : json.error?.message || "Failed");
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Match Profile"
        description="Deep profile and chart context"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.matches}>Back to matches</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {profile ? (
        <GlassCard>
          <h2 className="font-display text-3xl">{profile.name}</h2>
          <p className="text-muted-foreground mt-1">
            {profile.age ?? "—"} · {profile.city || "—"} · {profile.profession || "—"}
            {profile.company ? ` @ ${profile.company}` : ""}
          </p>
          <p className="mt-6 text-sm leading-relaxed">
            {profile.about || profile.headline || "No bio yet."}
          </p>
          <div className="text-muted-foreground mt-4 flex flex-wrap gap-3 text-sm">
            <span>Compat {profile.compatibilityScore}%</span>
            <span>
              Guna {profile.totalGuna}/{profile.maxGuna}
            </span>
            <span>Manglik {profile.manglik}</span>
          </div>
          {profile.strengths?.length ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {profile.strengths.slice(0, 5).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" disabled={busy} onClick={() => void sendInterest()}>
              Send interest
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void shortlist()}
            >
              Shortlist
            </Button>
            <Button asChild variant="outline">
              <Link href={`${routes.compatibility}?candidate=${profile.userId}`}>
                Run compatibility
              </Link>
            </Button>
          </div>
        </GlassCard>
      ) : !error ? (
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      ) : null}
    </div>
  );
}
