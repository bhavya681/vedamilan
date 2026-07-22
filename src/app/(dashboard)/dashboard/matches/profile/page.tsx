"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { MoodBadge } from "@/features/compatibility/compatibility-visuals";
import { routes } from "@/lib/constants/routes";

type Candidate = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  company: string | null;
  education?: string | null;
  headline: string | null;
  about: string | null;
  photos?: Array<{ secureUrl?: string; isPrimary?: boolean }>;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  manglik: string;
  strengths: string[];
  challenges: string[];
};

export default function MatchProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  async function startChat() {
    if (!id) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: id }),
    });
    const json = await res.json();
    setBusy(false);
    if (!json.success) {
      setMessage(json.error?.message || "Could not start chat");
      return;
    }
    router.push(routes.chat);
  }

  const photo =
    profile?.photos?.find((p) => p.isPrimary)?.secureUrl || profile?.photos?.[0]?.secureUrl || null;
  const meta = profile
    ? [
        profile.age,
        profile.city,
        profile.profession,
        profile.company ? `@ ${profile.company}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="relative space-y-6">
      <PageHeader
        title={profile?.name || "Profile"}
        description="Get to know this person before you connect."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.matches}>Back to matches</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {profile ? (
        <article className="border-border/70 bg-card shadow-soft overflow-hidden rounded-2xl border">
          <div className="bg-navy relative aspect-[16/10] w-full sm:aspect-[21/9]">
            {photo ? (
              <Image
                src={photo}
                alt=""
                fill
                unoptimized={
                  photo.startsWith("data:") ||
                  (!photo.includes("res.cloudinary.com") &&
                    !photo.includes("images.unsplash.com") &&
                    !photo.includes("upload.wikimedia.org"))
                }
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            ) : (
              <div className="bg-muted absolute inset-0" />
            )}
            <div className="from-navy via-navy/40 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="text-ivory absolute inset-x-0 bottom-0 space-y-1 p-5 sm:p-8">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{profile.name}</h2>
              {profile.headline ? (
                <p className="text-ivory/85 max-w-2xl text-sm leading-relaxed sm:text-base">
                  {profile.headline}
                </p>
              ) : null}
              {meta ? <p className="text-ivory/70 pt-1 text-sm">{meta}</p> : null}
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            {profile.about ? (
              <div>
                <p className="text-muted-foreground text-sm">About</p>
                <p className="mt-2 text-sm leading-relaxed sm:text-base">{profile.about}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <MoodBadge score={profile.compatibilityScore} />
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{profile.compatibilityScore}%</span>
                <span>
                  Guna {profile.totalGuna}/{profile.maxGuna}
                </span>
                <span>Manglik {profile.manglik}</span>
              </div>
            </div>

            {profile.strengths?.length ? (
              <div>
                <p className="text-muted-foreground text-sm">Why you may connect</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {profile.strengths.slice(0, 5).map((s) => (
                    <li key={s}>· {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
              <Button
                type="button"
                variant="outline"
                disabled={busy || !id}
                onClick={() => void startChat()}
              >
                Message
              </Button>
              <Button asChild variant="outline">
                <Link href={`${routes.compatibility}?candidate=${profile.userId}`}>
                  Explore compatibility
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ) : !error ? (
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      ) : null}
    </div>
  );
}
