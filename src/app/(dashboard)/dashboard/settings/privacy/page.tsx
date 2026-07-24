"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/lib/constants/routes";

type PrivacyState = {
  showAge: boolean;
  showMoonSign: boolean;
  showLagna: boolean;
  showManglik: boolean;
  showNakshatra: boolean;
  acceptInterests: boolean;
  showOnlineStatus: boolean;
};

const DEFAULT_PRIVACY: PrivacyState = {
  showAge: true,
  showMoonSign: true,
  showLagna: true,
  showManglik: true,
  showNakshatra: true,
  acceptInterests: true,
  showOnlineStatus: false,
};

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="border-border/50 flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-3 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">{hint}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[var(--gold)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export default function PrivacySettingsPage() {
  const [visibility, setVisibility] = useState("MEMBERS");
  const [privacy, setPrivacy] = useState<PrivacyState>(DEFAULT_PRIVACY);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load");
          return;
        }
        setVisibility(json.data.profile?.visibility || "MEMBERS");
        const p = json.data.profile?.privacy || {};
        setPrivacy({
          showAge: p.showAge !== false,
          showMoonSign: p.showMoonSign !== false,
          showLagna: p.showLagna !== false,
          showManglik: p.showManglik !== false,
          showNakshatra: p.showNakshatra !== false,
          acceptInterests: p.acceptInterests !== false,
          showOnlineStatus: Boolean(p.showOnlineStatus),
        });
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
      body: JSON.stringify({ visibility, privacy }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message || "Save failed");
      return;
    }
    setMessage("Privacy settings saved");
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Privacy"
        description="Control discovery visibility and what others can see. Birth date, time, and place are never exposed on public profiles."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.settings}>Back to settings</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p> : null}

      <GlassCard className="max-w-xl space-y-4">
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

        <div className="space-y-2">
          <p className="text-sm font-medium">Compatibility snapshot fields</p>
          <ToggleRow
            label="Show age"
            hint="Derived from date of birth — raw birth date stays private"
            checked={privacy.showAge}
            onChange={(showAge) => setPrivacy((p) => ({ ...p, showAge }))}
          />
          <ToggleRow
            label="Show Moon sign"
            hint="Used in soft compatibility snapshot"
            checked={privacy.showMoonSign}
            onChange={(showMoonSign) => setPrivacy((p) => ({ ...p, showMoonSign }))}
          />
          <ToggleRow
            label="Show Lagna"
            hint="Ascendant sign on your public snapshot"
            checked={privacy.showLagna}
            onChange={(showLagna) => setPrivacy((p) => ({ ...p, showLagna }))}
          />
          <ToggleRow
            label="Show Nakshatra"
            hint="Moon nakshatra label for discovery"
            checked={privacy.showNakshatra}
            onChange={(showNakshatra) => setPrivacy((p) => ({ ...p, showNakshatra }))}
          />
          <ToggleRow
            label="Show Manglik status"
            hint="High-level manglik flag only — not full chart math"
            checked={privacy.showManglik}
            onChange={(showManglik) => setPrivacy((p) => ({ ...p, showManglik }))}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Interest & presence</p>
          <ToggleRow
            label="Accept interest"
            hint="When off, others cannot send soft Interest signals"
            checked={privacy.acceptInterests}
            onChange={(acceptInterests) => setPrivacy((p) => ({ ...p, acceptInterests }))}
          />
          <ToggleRow
            label="Show online status"
            hint="Coming soon — presence infrastructure is not live yet"
            checked={privacy.showOnlineStatus}
            onChange={(showOnlineStatus) => setPrivacy((p) => ({ ...p, showOnlineStatus }))}
            disabled
          />
        </div>

        <Button type="button" onClick={() => void save()} disabled={loading}>
          {loading ? "Saving…" : "Save privacy"}
        </Button>
        <Button asChild variant="outline" className="ml-2">
          <Link href={routes.blocked}>Blocked members</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
