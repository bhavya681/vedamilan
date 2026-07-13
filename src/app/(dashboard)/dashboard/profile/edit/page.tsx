"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

type ProfileBundle = {
  profile: {
    headline?: string;
    about?: string;
    profession?: string | null;
    city?: string | null;
    education?: string | null;
    religion?: string | null;
    heightCm?: number | null;
    visibility?: string;
    completion?: { score: number };
    photos?: Array<{ secureUrl: string; cloudinaryPublicId: string; isPrimary?: boolean }>;
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
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
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
    setBundle((prev) => (prev ? { ...prev, profile: { ...prev.profile, ...json.data } } : prev));
    setMessage(`Saved. Profile strength ${json.data.completion?.score ?? ""}%`);
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      const res = await fetch("/api/profile/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, makePrimary: true }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Upload failed — configure Cloudinary env vars");
        return;
      }
      setMessage("Photo uploaded");
      const refreshed = await fetch("/api/profile").then((r) => r.json());
      if (refreshed.success) setBundle(refreshed.data);
    };
    reader.readAsDataURL(file);
  }

  const p = bundle?.profile;

  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Edit Profile"
        description="Refine how you are discovered"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.profile}>Back to profile</Link>
          </Button>
        }
      />
      <GlassCard className="max-w-2xl space-y-4">
        {!bundle && !error ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}
        {p ? (
          <form className="space-y-4" onSubmit={onSave}>
            {(
              [
                ["headline", "Headline", p.headline || ""],
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
            <div>
              <label className="text-sm font-medium" htmlFor="photo">
                Upload photo
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={onUpload}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Requires Cloudinary credentials. Current photos: {p.photos?.length ?? 0}
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </form>
        ) : null}
      </GlassCard>
    </div>
  );
}
