"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  ProfessionalProfileHero,
  ProfileFactGrid,
  ProfileLayout,
  ProfilePageFrame,
  ProfilePhotoGallery,
  ProfileScorePanel,
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
  manglik: string | null;
  nakshatra?: string | null;
  moonSign?: string | null;
  lagnaSign?: string | null;
  acceptInterests?: boolean;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  strengths: string[];
  challenges: string[];
  reasons?: string[];
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

  return (
    <ProfilePageFrame>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            Discovery
          </p>
          <h1 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">Member profile</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Review their presence, kundli alignment, then connect with intention.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.matches}>Back to matches</Link>
        </Button>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {!profile && !error ? (
        <div
          className="border-border/60 overflow-hidden rounded-[1.35rem] border"
          role="status"
          aria-label="Loading profile"
        >
          <div className="skeleton-shimmer h-40 w-full" />
          <div className="space-y-4 px-5 pt-16 pb-8 sm:px-8">
            <div className="skeleton-shimmer h-8 w-56 rounded-full" />
            <div className="skeleton-shimmer h-3 w-full max-w-lg rounded-full" />
            <div className="skeleton-shimmer h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ) : null}

      {profile ? (
        <>
          <ProfessionalProfileHero
            name={profile.name}
            headline={profile.headline}
            location={location || null}
            profession={
              [profile.profession, profile.company ? `at ${profile.company}` : null]
                .filter(Boolean)
                .join(" ") || null
            }
            education={profile.education}
            verified={Boolean(profile.isVerified)}
            photo={photo}
            eyebrow="Potential connection"
            badges={
              <>
                {profile.age != null ? <SoftPill>{profile.age} yrs</SoftPill> : null}
                {profile.heightCm ? <SoftPill>{profile.heightCm} cm</SoftPill> : null}
                {profile.moonSign ? <SoftPill tone="gold">Moon {profile.moonSign}</SoftPill> : null}
                {profile.lagnaSign ? <SoftPill>Asc {profile.lagnaSign}</SoftPill> : null}
              </>
            }
            actions={
              <>
                <Button asChild className="w-full">
                  <Link href={`${routes.compatibility}?candidate=${id}`}>Compatibility</Link>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={busy}
                  onClick={() => void shortlist()}
                >
                  Shortlist
                </Button>
              </>
            }
          />

          <ProfileLayout
            main={
              <>
                {profile.about ? (
                  <ProfileSection title="About" description="In their words.">
                    <p className="text-[15px] leading-relaxed sm:text-base">{profile.about}</p>
                  </ProfileSection>
                ) : null}

                <ProfileSection
                  title="Why this person?"
                  description="Concise reasons from preferences and soft match scoring — not the full deep report."
                >
                  {(profile.reasons || profile.strengths || []).slice(0, 4).length ? (
                    <ul className="space-y-2 text-sm">
                      <li className="text-foreground font-medium">
                        {profile.compatibilityScore}% match alignment
                      </li>
                      {(profile.reasons || profile.strengths).slice(0, 4).map((r) => (
                        <li key={r} className="text-muted-foreground">
                          · {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Open compatibility for a deeper explanation of this connection.
                    </p>
                  )}
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`${routes.compatibility}?candidate=${id}`}>
                        See compatibility details
                      </Link>
                    </Button>
                  </div>
                </ProfileSection>

                <ProfileSection
                  title="Personal details"
                  description="Background shared on their profile."
                >
                  <ProfileFactGrid
                    items={[
                      { label: "Age", value: profile.age },
                      {
                        label: "Height",
                        value: profile.heightCm ? `${profile.heightCm} cm` : null,
                      },
                      { label: "Location", value: location || null },
                      { label: "Profession", value: profile.profession },
                      { label: "Works at", value: profile.company },
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

                <ProfileScorePanel
                  score={profile.compatibilityScore}
                  guna={profile.totalGuna}
                  maxGuna={profile.maxGuna}
                  manglik={profile.manglik || undefined}
                  nakshatra={profile.nakshatra}
                  moonSign={profile.moonSign}
                  lagnaSign={profile.lagnaSign}
                  strengths={profile.strengths}
                  challenges={profile.challenges}
                  footer={
                    <div className="pt-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`${routes.compatibility}?candidate=${id}`}>
                          Full compatibility report
                        </Link>
                      </Button>
                    </div>
                  }
                />

                <ProfilePhotoGallery photos={profile.photos} name={profile.name} />
              </>
            }
            aside={
              <>
                {id ? (
                  <ProfileSection
                    title="Connect"
                    description="Interest first, then connect to message."
                  >
                    <RelationshipActions otherUserId={id} />
                  </ProfileSection>
                ) : null}

                <ProfileSection title="More">
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={routes.connections}>Connections</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={routes.matches}>Back to matches</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive justify-start"
                      disabled={busy}
                      onClick={() => void block()}
                    >
                      Block member
                    </Button>
                  </div>
                </ProfileSection>
              </>
            }
          />
        </>
      ) : null}
    </ProfilePageFrame>
  );
}
