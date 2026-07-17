"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { mainNav } from "@/config/navigation";
import { routes } from "@/lib/constants/routes";

export function MobileNav({
  onNavigate,
  authed = false,
}: {
  onNavigate?: () => void;
  authed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
      {mainNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="text-foreground hover:bg-muted rounded-xl px-3 py-3 text-base font-medium"
        >
          {item.title}
        </Link>
      ))}
      <div className="mt-4 flex flex-col gap-2">
        {authed ? (
          <>
            <Button asChild onClick={onNavigate}>
              <Link href={routes.dashboard}>Open dashboard</Link>
            </Button>
            <SignOutButton className="w-full" redirectTo={routes.home} onSignedOut={onNavigate} />
          </>
        ) : (
          <>
            <Button asChild variant="outline" onClick={onNavigate}>
              <Link href={routes.login}>Sign in</Link>
            </Button>
            <Button asChild onClick={onNavigate}>
              <Link href={routes.register}>Begin journey</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
