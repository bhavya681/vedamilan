"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/lib/constants/routes";

export default function PrivacySettingsPage() {
  const [visibility, setVisibility] = useState("MEMBERS");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setVisibility(json.data.profile?.visibility || "MEMBERS");
        else setError(json.error?.message || "Failed to load");
      })
      .catch(() => setError("Failed to load privacy settings"));
  }, []);

  async function save() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Save failed");
      return;
    }
    setMessage(`Visibility set to ${json.data.visibility}`);
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Privacy"
        description="Visibility and data controls"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.settings}>Back to settings</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p> : null}
      <GlassCard className="max-w-lg space-y-4">
        <div className="space-y-2">
          <Label>Profile visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="MEMBERS">Members only</SelectItem>
              <SelectItem value="HIDDEN">Hidden from discovery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span>Birth details encrypted at rest</span>
            <Badge>Always on</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>AI never invents chart scores</span>
            <Badge>Always on</Badge>
          </div>
        </div>
        <Button type="button" onClick={() => void save()} disabled={loading}>
          {loading ? "Saving…" : "Save privacy"}
        </Button>
      </GlassCard>
    </div>
  );
}
