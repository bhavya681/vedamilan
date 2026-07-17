"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { authClient, useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || routes.dashboard;
  const safeNext = nextPath.startsWith("/") ? nextPath : routes.dashboard;
  const { data: session, isPending } = useSession();
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
      callbackURL: safeNext,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message || "Unable to sign in");
      return;
    }
    router.push(safeNext);
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: safeNext,
    });
  }

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Checking session…</p>;
  }

  if (session?.user) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          You&apos;re signed in as{" "}
          <span className="text-foreground font-medium">{session.user.email}</span>.
        </p>
        <Button asChild className="w-full">
          <Link href={safeNext}>Continue to dashboard</Link>
        </Button>
        <SignOutButton className="w-full" label="Sign out" redirectTo={routes.login} />
        <p className="text-muted-foreground text-center text-sm">
          Need a new account? Sign out first, then{" "}
          <Link href={routes.register} className="text-primary font-medium hover:underline">
            register
          </Link>
          .
        </p>
      </div>
    );
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
        {googleEnabled ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => void onGoogle()}
          >
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

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
