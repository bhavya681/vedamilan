"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageTransition } from "@/components/animations/motion";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { adminNav } from "@/config/navigation";
import { brand } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

/** Preserves existing admin chrome; auth gating happens in the server layout. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex min-h-screen">
      <aside className="border-border/60 bg-card/40 hidden w-64 shrink-0 border-r p-4 md:block">
        <p className="font-display text-primary text-xl">{brand.name}</p>
        <p className="text-muted-foreground text-xs">Admin console</p>
        <nav className="mt-8 space-y-1" aria-label="Admin">
          {adminNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border/50 flex h-14 items-center justify-between border-b px-4">
          <p className="text-sm font-medium md:hidden">Admin</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
