"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { dashboardNav } from "@/config/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const groups = [...new Set(dashboardNav.map((item) => item.group ?? "Menu"))];

  return (
    <aside
      className={cn(
        "border-border/60 bg-card/40 hidden w-64 shrink-0 overflow-y-auto border-r p-4 backdrop-blur-md lg:block",
        className,
      )}
      aria-label="Dashboard sidebar"
    >
      <div className="mb-8 px-2">
        <BrandLogo href={routes.dashboard} size="sm" />
        <p className="text-muted-foreground mt-1.5 text-xs">Relationship intelligence</p>
      </div>
      <nav className="space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <p className="text-muted-foreground mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
              {group}
            </p>
            <div className="space-y-1">
              {dashboardNav
                .filter((item) => (item.group ?? "Menu") === group)
                .map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
                    (item.href === "/dashboard/matches" &&
                      pathname.startsWith("/dashboard/matches"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/15 text-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
      </nav>
      <div className="mt-8 space-y-2 px-2">
        <Link
          href={routes.settings}
          className="text-muted-foreground hover:text-foreground block px-3 text-sm"
        >
          Account settings
        </Link>
        <SignOutButton className="w-full" redirectTo={routes.home} />
      </div>
    </aside>
  );
}
