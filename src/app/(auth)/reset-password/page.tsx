"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Reset token missing. Request a new link.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Unable to reset password");
      return;
    }
    router.push(routes.login);
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Reset password</h1>
      <p className="text-muted-foreground mt-2 text-sm">Choose a new password for your account.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" minLength={8} required />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href={routes.login} className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
