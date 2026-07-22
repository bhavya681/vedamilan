"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import {
  ProfilePhotoUploader,
  type ProfilePhotoItem,
} from "@/features/profile/components/profile-photo-uploader";

type ProfileBundle = {
  profile: {
    name?: string;
    headline?: string;
    about?: string;
    profession?: string | null;
    city?: string | null;
    education?: string | null;
    religion?: string | null;
    heightCm?: number | null;
    visibility?: string;
    completion?: {
      score: number;
      isComplete?: boolean;
      requiresPhoto?: boolean;
      missing?: string[];
    };
    photos?: ProfilePhotoItem[];
  };
  user?: { name?: string };
};

export default function EditProfilePage() {
  const [bundle, setBundle] = useState<ProfileBundle | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBundle(json.data);
        else setError(json.error?.message || "Failed to load profile");
      })
      .catch(() => setError("Failed to load profile"));
  }, []);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const photos = bundle?.profile.photos || [];
    if (photos.length === 0) {
      setError("Add a profile picture before saving. Upload a file or paste an image link.");
      return;
    }

    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      headline: String(form.get("headline") || ""),
      profession: String(form.get("profession") || ""),
      city: String(form.get("city") || ""),
      education: String(form.get("education") || ""),
      religion: String(form.get("religion") || ""),
      about: String(form.get("about") || ""),
      heightCm: form.get("heightCm") ? Number(form.get("heightCm")) : null,
      visibility: String(form.get("visibility") || "MEMBERS"),
    };
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Save failed");
      return;
    }
    setBundle((prev) =>
      prev
        ? {
            ...prev,
            profile: {
              ...prev.profile,
              ...json.data,
              photos: prev.profile.photos,
            },
          }
        : prev,
    );
    setMessage(`Saved. Profile strength ${json.data.completion?.score ?? ""}%`);
  }

  const p = bundle?.profile;
  const photos = p?.photos || [];

  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Edit Profile"
        description="Your photo comes first — then the details that help the right people find you."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.profile}>Back to profile</Link>
          </Button>
        }
      />
      <GlassCard className="max-w-2xl space-y-6">
        {!bundle && !error ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}

        {p ? (
          <>
            <ProfilePhotoUploader
              photos={photos}
              required
              onChanged={(next) =>
                setBundle((prev) =>
                  prev ? { ...prev, profile: { ...prev.profile, photos: next } } : prev,
                )
              }
              onMessage={setMessage}
              onError={setError}
            />

            {photos.length === 0 ? (
              <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-sm">
                Profile picture is mandatory. Members without a photo stay hidden from matches.
              </div>
            ) : null}

            <form className="space-y-4 border-t pt-6" onSubmit={onSave}>
              {(
                [
                  ["name", "Name", p.name || bundle?.user?.name || ""],
                  ["headline", "Headline (shown under your name)", p.headline || ""],
                  ["profession", "Profession", p.profession || ""],
                  ["city", "City", p.city || ""],
                  ["education", "Education", p.education || ""],
                  ["religion", "Religion", p.religion || ""],
                  ["heightCm", "Height (cm)", p.heightCm ?? ""],
                ] as const
              ).map(([name, label, value]) => (
                <div key={name}>
                  <label className="text-sm font-medium" htmlFor={name}>
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                    defaultValue={value as string | number}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium" htmlFor="visibility">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                  defaultValue={p.visibility || "MEMBERS"}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS">Members</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="about">
                  About
                </label>
                <textarea
                  id="about"
                  name="about"
                  className="border-input bg-background mt-1 w-full rounded-xl border px-3 py-2"
                  rows={4}
                  defaultValue={p.about || ""}
                />
              </div>
              <Button type="submit" disabled={loading || photos.length === 0}>
                {loading
                  ? "Saving…"
                  : photos.length === 0
                    ? "Add photo to continue"
                    : "Save changes"}
              </Button>
            </form>
          </>
        ) : null}
      </GlassCard>
    </div>
  );
}
