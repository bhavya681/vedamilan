"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/lib/constants/routes";
import { authClient, useSession } from "@/lib/auth/client";

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Could not update password");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password updated. Other sessions were signed out.");
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Security"
        description="Password and sessions"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.settings}>Back to settings</Link>
          </Button>
        }
      />
      <GlassCard className="max-w-lg space-y-4">
        <p className="text-muted-foreground text-sm">Signed in as {session?.user?.email || "…"}</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              className="mt-1"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <Label htmlFor="next">New password</Label>
            <Input
              id="next"
              type="password"
              className="mt-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {message ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.forgotPassword}>Forgot password instead?</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
