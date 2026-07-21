"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, MessageCircle, MoreHorizontal, Stars } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { dashboardNav } from "@/config/navigation";
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
        className="border-border/50 bg-background/95 dark:bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
        aria-label="Primary workspace"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
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
                    "flex flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2",
                    active
                      ? "bg-primary/12 text-foreground dark:bg-primary/18"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2",
                moreOpen
                  ? "bg-primary/12 text-foreground dark:bg-primary/18"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMoreOpen(true)}
              aria-label="More dashboard links"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
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
                      const active =
                        pathname === item.href ||
                        (item.href !== routes.dashboard && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/12 text-foreground dark:bg-primary/18"
                              : "bg-muted/50 hover:bg-muted text-foreground/90 dark:bg-muted/40",
                          )}
                        >
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
