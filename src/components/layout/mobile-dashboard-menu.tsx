"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { dashboardNav } from "@/config/navigation";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function MobileDashboardMenu({ triggerClassName }: { triggerClassName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = [...new Set(dashboardNav.map((item) => item.group ?? "Menu"))];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("lg:hidden", triggerClassName)}
          aria-label="Open dashboard menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto p-0">
        <SheetHeader className="border-border/60 border-b p-4 text-left">
          <SheetTitle className="font-display text-primary">{brand.shortName}</SheetTitle>
        </SheetHeader>
        <nav className="space-y-5 p-4" aria-label="Dashboard">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-muted-foreground mb-2 px-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                {group}
              </p>
              <div className="space-y-1">
                {dashboardNav
                  .filter((item) => (item.group ?? "Menu") === group)
                  .map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
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
              </div>
            </div>
          ))}
          <SignOutButton
            className="w-full"
            redirectTo={routes.home}
            onSignedOut={() => setOpen(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
