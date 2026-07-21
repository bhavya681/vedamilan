"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageTransition } from "@/components/animations/motion";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { adminNav } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

/** Preserves existing admin chrome; auth gating happens in the server layout. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex h-dvh max-h-dvh flex-col overflow-hidden md:flex-row">
      <aside className="border-border/50 bg-card/90 dark:bg-card/95 hidden h-full w-[15.5rem] shrink-0 flex-col border-r backdrop-blur-xl md:flex xl:w-64">
        <div className="border-border/40 shrink-0 border-b px-4 py-4">
          <BrandLogo href="/admin" size="sm" />
          <p className="text-muted-foreground mt-1.5 text-[11px]">Admin console</p>
        </div>
        <nav
          className="scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
          aria-label="Admin"
        >
          <div className="space-y-0.5">
            {adminNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative block rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/12 text-foreground shadow-soft before:bg-primary dark:bg-primary/18 before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-border/50 bg-background/90 dark:bg-background/85 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-xl sm:h-16 sm:px-5">
          <p className="text-sm font-medium md:hidden">Admin</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main
          id="main-content"
          className="scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
