"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get("email") || "");
    const { error: resetError } = await authClient.forgetPassword({
      email,
      redirectTo: routes.resetPassword,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Unable to send reset link");
      return;
    }
    setMessage(
      "If that email exists, a reset link has been sent. Check your inbox (and server logs in development).",
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Forgot password</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Enter your email and we will send a reset link.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href={routes.login} className="text-primary hover:underline">
          Return to sign in
        </Link>
      </p>
    </div>
  );
}
