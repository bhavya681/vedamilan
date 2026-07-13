"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/navigation";
import { routes } from "@/lib/constants/routes";

export function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
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
        <Button asChild variant="outline" onClick={onNavigate}>
          <Link href={routes.login}>Sign in</Link>
        </Button>
        <Button asChild onClick={onNavigate}>
          <Link href={routes.register}>Begin journey</Link>
        </Button>
      </div>
    </nav>
  );
}
