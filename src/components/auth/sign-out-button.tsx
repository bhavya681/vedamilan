"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function SignOutButton({
  className,
  variant = "outline",
  size = "default",
  redirectTo = routes.home,
  label = "Sign out",
  onSignedOut,
}: {
  className?: string;
  variant?: "outline" | "ghost" | "secondary" | "default" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  redirectTo?: string;
  label?: string;
  onSignedOut?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    try {
      await authClient.signOut();
    } finally {
      setLoading(false);
      onSignedOut?.();
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={loading}
      onClick={() => void onSignOut()}
    >
      {loading ? "Signing out…" : label}
    </Button>
  );
}
