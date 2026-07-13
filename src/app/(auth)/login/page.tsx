"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: routes.dashboard,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message || "Unable to sign in");
      return;
    }
    router.push(routes.dashboard);
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: routes.dashboard,
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Welcome back</h1>
      <p className="text-muted-foreground mt-2 text-sm">Sign in to your VedaMilan AI workspace.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href={routes.forgotPassword} className="text-primary text-xs hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <Button asChild type="button" variant="outline" className="w-full">
          <Link href={routes.otp}>Sign in with OTP</Link>
        </Button>
        {googleEnabled ? (
          <Button type="button" variant="secondary" className="w-full" onClick={onGoogle}>
            Continue with Google
          </Button>
        ) : null}
      </form>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        New here?{" "}
        <Link href={routes.register} className="text-primary font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
