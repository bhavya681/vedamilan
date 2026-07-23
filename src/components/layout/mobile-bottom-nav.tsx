"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, MessageCircle, MoreHorizontal, Stars } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { dashboardNav } from "@/config/navigation";
import { dashboardNavIcons, isDashboardNavActive } from "@/config/dashboard-nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";

const items = [
  { href: routes.dashboard, label: "Home", icon: LayoutDashboard },
  { href: routes.matches, label: "Matches", icon: Heart },
  { href: routes.kundli, label: "Kundli", icon: Stars },
  { href: routes.chat, label: "Chat", icon: MessageCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const groups = [...new Set(dashboardNav.map((item) => item.group ?? "Menu"))];

  return (
    <>
      <nav
        className="border-border/40 bg-background/92 dark:bg-background/88 fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-10px_36px_rgba(20,17,14,0.08)] backdrop-blur-2xl md:hidden dark:shadow-[0_-10px_36px_rgba(0,0,0,0.4)]"
        aria-label="Primary workspace"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== routes.dashboard && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-primary/14 text-gold" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                  </span>
                  {item.label}
                  {active ? (
                    <span
                      className="bg-gold absolute bottom-0.5 h-1 w-1 rounded-full"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              className={cn(
                "relative flex w-full flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2",
                moreOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMoreOpen(true)}
              aria-label="More dashboard links"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  moreOpen ? "bg-primary/14 text-gold" : "bg-transparent",
                )}
              >
                <MoreHorizontal className="h-[1.15rem] w-[1.15rem]" aria-hidden />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="bg-background border-border/50 scrollbar-premium max-h-[min(80vh,36rem)] overflow-y-auto rounded-t-3xl pb-8"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="font-display">Workspace</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  {group}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {dashboardNav
                    .filter((item) => (item.group ?? "Menu") === group)
                    .map((item) => {
                      const active = isDashboardNavActive(pathname, item.href);
                      const Icon = dashboardNavIcons[item.href];
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/12 text-foreground dark:bg-primary/18"
                              : "bg-muted/50 hover:bg-muted text-foreground/90 dark:bg-muted/40",
                          )}
                        >
                          {Icon ? (
                            <Icon
                              className={cn("h-4 w-4 shrink-0", active && "text-gold")}
                              aria-hidden
                            />
                          ) : null}
                          {item.title}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
            <SignOutButton
              className="w-full"
              redirectTo={routes.home}
              onSignedOut={() => setMoreOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
