"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { dashboardNav } from "@/config/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/dashboard/matches" && pathname.startsWith("/dashboard/matches")) return true;
  return pathname.startsWith(`${href}/`);
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const groups = [...new Set(dashboardNav.map((item) => item.group ?? "Menu"))];

  return (
    <aside
      className={cn(
        "border-border/50 bg-card/90 dark:bg-card/95 hidden h-full w-[15.5rem] shrink-0 flex-col border-r backdrop-blur-xl md:flex xl:w-64",
        className,
      )}
      aria-label="Dashboard sidebar"
    >
      <div className="border-border/40 shrink-0 border-b px-4 py-4 xl:px-5">
        <BrandLogo href={routes.dashboard} size="sm" />
        <p className="text-muted-foreground mt-1.5 text-[11px] tracking-wide">
          Relationship intelligence
        </p>
      </div>

      <nav className="scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 xl:px-3.5">
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-muted-foreground/80 mb-2 px-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                {group}
              </p>
              <div className="space-y-0.5">
                {dashboardNav
                  .filter((item) => (item.group ?? "Menu") === group)
                  .map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative block rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/12 text-foreground dark:bg-primary/18"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/60",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-border/40 bg-background/40 dark:bg-background/30 shrink-0 border-t px-3 py-3 xl:px-3.5">
        <SignOutButton className="w-full" size="sm" redirectTo={routes.home} />
      </div>
    </aside>
  );
}
