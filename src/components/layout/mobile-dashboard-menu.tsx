"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { navForMode, navGroupsForMode } from "@/config/navigation";
import { dashboardNavIcons, isDashboardNavActive } from "@/config/dashboard-nav";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { navGroupKey, navTitleKey } from "@/lib/i18n/nav-labels";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function MobileDashboardMenu({ triggerClassName }: { triggerClassName?: string }) {
  const pathname = useAppPathname();
  const t = useT();
  const { mode, homeHref } = useWorkspaceMode();
  const [open, setOpen] = useState(false);
  const items = navForMode(mode);
  const groups = navGroupsForMode(mode);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "border-border/60 bg-card/80 h-9 w-9 rounded-xl md:hidden",
            triggerClassName,
          )}
          aria-label={t("navigation.more")}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-background border-border/50 scrollbar-premium w-[min(100%,19.5rem)] overflow-y-auto p-0"
      >
        <SheetHeader className="border-border/50 from-card to-background border-b bg-gradient-to-b p-4 text-left">
          <SheetTitle className="sr-only">{t("navigation.dashboard")}</SheetTitle>
          <BrandLogo href={homeHref} size="sm" />
          <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
            {mode === "astrology"
              ? t("navigation.modeAstrologySubtitle")
              : mode === "wisdom"
                ? t("navigation.modeRishiSageSubtitle")
                : t("navigation.modeMatrimonySubtitle")}
          </p>
        </SheetHeader>
        <nav className="space-y-5 p-4" aria-label={t("navigation.dashboard")}>
          {groups.map((group) => (
            <div key={group}>
              <p className="text-muted-foreground mb-2 px-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
                {t(navGroupKey(group))}
              </p>
              <div className="space-y-1">
                {items
                  .filter((item) => (item.group ?? "Menu") === group)
                  .map((item) => {
                    const active = isDashboardNavActive(pathname, item.href);
                    const Icon = dashboardNavIcons[item.href];
                    return (
                      <LocaleLink
                        key={`${item.group}-${item.href}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/12 text-foreground dark:bg-primary/16 shadow-[inset_0_0_0_1px_rgba(196,122,26,0.16)]"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {Icon ? (
                          <Icon
                            className={cn("h-4 w-4 shrink-0", active ? "text-gold" : undefined)}
                            aria-hidden
                          />
                        ) : null}
                        {t(navTitleKey(item.href, item.title))}
                      </LocaleLink>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-border/50 border-t p-4">
          <SignOutButton
            className="w-full"
            label={t("navigation.signOut")}
            redirectTo={routes.home}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
