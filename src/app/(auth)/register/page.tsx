"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const password = String(form.get("password") || "");

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: routes.dashboard,
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message || "Unable to create account");
      return;
    }

    // Persist phone on profile via upcoming Module 3; store hint locally for verify flow.
    if (phone) {
      sessionStorage.setItem("vedamilan.pendingPhone", phone);
    }
    router.push(routes.verifyEmail);
    router.refresh();
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
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
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
