"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { MoodBadge } from "@/features/compatibility/compatibility-visuals";
import {
  ProfessionalProfileHero,
  ProfileFactGrid,
  ProfilePhotoGallery,
  ProfileSection,
  SoftPill,
  primaryPhotoUrl,
} from "@/features/profile/components/professional-profile";
import { RelationshipActions } from "@/features/relationship/relationship-actions";
import { routes } from "@/lib/constants/routes";

type Candidate = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  state?: string | null;
  country?: string | null;
  profession: string | null;
  company: string | null;
  education?: string | null;
  religion?: string | null;
  community?: string | null;
  motherTongue?: string | null;
  maritalStatus?: string | null;
  languages?: string[];
  heightCm?: number | null;
  headline: string | null;
  about: string | null;
  photos?: Array<{ secureUrl?: string; isPrimary?: boolean }>;
  isVerified?: boolean;
  manglik: string;
  nakshatra?: string | null;
  moonSign?: string | null;
  lagnaSign?: string | null;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  strengths: string[];
  challenges: string[];
};

function formatMarital(status?: string | null) {
  if (!status) return null;
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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

  async function block() {
    if (!id) return;
    if (!window.confirm("Block this member? They won't be able to contact you.")) return;
    setBusy(true);
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: id }),
    });
    const json = await res.json();
    setBusy(false);
    setMessage(json.success ? "Member blocked." : json.error?.message || "Failed");
  }

  const photo = primaryPhotoUrl(profile?.photos);
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");
  const meta = profile
    ? [profile.age ? `${profile.age} yrs` : null, location || null, profile.profession]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="relative mx-auto max-w-3xl space-y-5 sm:space-y-6">
      <PageHeader
        title="Member profile"
        description="A clear view of who they are — then connect with intention."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={routes.matches}>Back to matches</Link>
          </Button>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {!profile && !error ? (
        <div
          className="border-border/60 overflow-hidden rounded-2xl border"
          role="status"
          aria-label="Loading profile"
        >
          <div className="skeleton-shimmer h-36 w-full" />
          <div className="space-y-4 px-5 pt-14 pb-6 sm:px-8">
            <div className="skeleton-shimmer h-7 w-48 rounded-full" />
            <div className="skeleton-shimmer h-3 w-full rounded-full" />
            <div className="skeleton-shimmer h-3 w-4/5 rounded-full" />
          </div>
        </div>
      ) : null}

      {profile ? (
        <>
          <ProfessionalProfileHero
            name={profile.name}
            headline={profile.headline}
            meta={meta}
            photo={photo}
            badges={
              <>
                {profile.isVerified ? <SoftPill>Verified</SoftPill> : null}
                {profile.education ? <SoftPill>{profile.education}</SoftPill> : null}
                {profile.moonSign ? <SoftPill>Moon {profile.moonSign}</SoftPill> : null}
                {profile.lagnaSign ? <SoftPill>Asc {profile.lagnaSign}</SoftPill> : null}
              </>
            }
            actions={
              <div className="flex flex-col gap-2 sm:items-stretch">
                <Button asChild>
                  <Link href={`${routes.compatibility}?candidate=${id}`}>Compatibility</Link>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void shortlist()}
                >
                  Shortlist
                </Button>
              </div>
            }
          />

          {id ? (
            <ProfileSection title="Connect">
              <RelationshipActions otherUserId={id} />
            </ProfileSection>
          ) : null}

          {profile.about ? (
            <ProfileSection title="About">
              <p className="text-sm leading-relaxed sm:text-[15px]">{profile.about}</p>
            </ProfileSection>
          ) : null}

          <ProfileSection title="Basics">
            <ProfileFactGrid
              items={[
                { label: "Age", value: profile.age },
                { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : null },
                { label: "Location", value: location || null },
                { label: "Profession", value: profile.profession },
                {
                  label: "Works at",
                  value: profile.company,
                },
                { label: "Education", value: profile.education },
                { label: "Religion", value: profile.religion },
                { label: "Community", value: profile.community },
                { label: "Mother tongue", value: profile.motherTongue },
                {
                  label: "Languages",
                  value: profile.languages?.length ? profile.languages.join(", ") : null,
                },
                { label: "Marital status", value: formatMarital(profile.maritalStatus) },
              ]}
            />
          </ProfileSection>

          <ProfileSection title="Kundli alignment">
            <div className="flex flex-wrap items-center gap-3">
              <MoodBadge score={profile.compatibilityScore} />
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{profile.compatibilityScore}% blend</span>
                <span>
                  Guna {profile.totalGuna}/{profile.maxGuna}
                </span>
                <span>Manglik {profile.manglik}</span>
                {profile.nakshatra ? <span>Nakshatra {profile.nakshatra}</span> : null}
              </div>
            </div>
            {profile.strengths?.length ? (
              <div className="mt-5">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Why you may connect
                </p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {profile.strengths.slice(0, 4).map((s) => (
                    <li key={s}>· {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {profile.challenges?.length ? (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Areas to discuss
                </p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {profile.challenges.slice(0, 3).map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-5">
              <Button asChild variant="outline" size="sm">
                <Link href={`${routes.compatibility}?candidate=${id}`}>
                  Full compatibility report
                </Link>
              </Button>
            </div>
          </ProfileSection>

          <ProfilePhotoGallery photos={profile.photos} name={profile.name} />

          <ProfileSection title="More actions">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline">
                <Link href={routes.connections}>Connections</Link>
              </Button>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => void block()}>
                Block
              </Button>
            </div>
          </ProfileSection>
        </>
      ) : null}
    </div>
  );
}
