"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/i18n-provider";
import { routes } from "@/lib/constants/routes";
import { authClient } from "@/lib/auth/client";

type Bundle = {
  profile: {
    about?: string;
    headline?: string;
    visibility?: string;
  };
  user?: { name?: string; email?: string };
};

export default function SettingsPage() {
  const t = useT();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [visibility, setVisibility] = useState("MEMBERS");
  const [aiMatching, setAiMatching] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load settings");
          return;
        }
        setBundle(json.data);
        setName(json.data.user?.name || "");
        setAbout(json.data.profile?.about || "");
        setVisibility(json.data.profile?.visibility || "MEMBERS");
      })
      .catch(() => setError("Failed to load settings"));
  }, []);

  async function save() {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (name.trim() && name !== bundle?.user?.name) {
      const updated = await authClient.updateUser({ name: name.trim() });
      if (updated.error) {
        setLoading(false);
        setError(updated.error.message || "Could not update display name");
        return;
      }
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        about,
        visibility,
        headline: bundle?.profile?.headline,
      }),
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
            profile: { ...prev.profile, ...json.data },
            user: { ...prev.user, name: name.trim() },
          }
        : prev,
    );
    setMessage("Settings saved");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">{t("pages.settingsTitle")}</h1>
        <p className="text-muted-foreground mt-2">Profile and privacy preferences.</p>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{bundle?.user?.email || "Loading account…"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading || !bundle}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href={routes.editProfile}>Full profile editor</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href={routes.languageRegion}>{t("navigation.languageRegion")}</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href={routes.appearance}>{t("settings.appearance")}</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href={routes.privacySettings}>{t("settings.privacy")}</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href={routes.blocked}>{t("pages.blockedTitle")}</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href={routes.security}>{t("settings.security")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control what others can see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="visible">Show profile to members</Label>
            <Switch
              id="visible"
              checked={visibility !== "HIDDEN"}
              onCheckedChange={(on) => setVisibility(on ? "MEMBERS" : "HIDDEN")}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="public">Public profile (searchable outside)</Label>
            <Switch
              id="public"
              checked={visibility === "PUBLIC"}
              onCheckedChange={(on) => setVisibility(on ? "PUBLIC" : "MEMBERS")}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="ai">Allow AI matching insights</Label>
            <Switch id="ai" checked={aiMatching} onCheckedChange={setAiMatching} />
          </div>
          <p className="text-muted-foreground text-xs">
            Visibility is saved with your profile. AI insights only explain engine scores — they
            never invent guna or dasha values.
          </p>
          <Button type="button" onClick={() => void save()} disabled={loading || !bundle}>
            Save privacy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
