"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { authClient, useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");

    const { data, error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
      ...(phone ? { phone } : {}),
      callbackURL: routes.onboarding,
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message || "Unable to create account");
      return;
    }

    if (!data?.user) {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: routes.onboarding,
      });
      if (signInError) {
        setLoading(false);
        setError(signInError.message || "Account created — please sign in");
        router.push(routes.login);
        return;
      }
    }

    setLoading(false);
    router.push(routes.onboarding);
    router.refresh();
  }

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Checking session…</p>;
  }

  if (session?.user) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">You&apos;re already signed in</h1>
        <p className="text-muted-foreground text-sm">
          Signed in as <span className="text-foreground font-medium">{session.user.email}</span>.
          Open your workspace, or sign out to create a different account.
        </p>
        <Button asChild className="w-full">
          <Link href={routes.onboarding}>Continue setup</Link>
        </Button>
        <SignOutButton className="w-full" label="Sign out to register another account" />
        <p className="text-muted-foreground text-center text-sm">
          <Link href={routes.home} className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Begin your journey</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Create your account to unlock relationship intelligence.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href={routes.login} className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
