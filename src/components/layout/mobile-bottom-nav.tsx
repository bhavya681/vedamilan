"use client";

import {
  BookOpen,
  Heart,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Stars,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navForMode, navGroupsForMode } from "@/config/navigation";
import { dashboardNavIcons, isDashboardNavActive } from "@/config/dashboard-nav";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { navGroupKey, navTitleKey } from "@/lib/i18n/nav-labels";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function MobileBottomNav() {
  const pathname = useAppPathname();
  const t = useT();
  const { mode, homeHref } = useWorkspaceMode();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = navForMode(mode);
  const groups = navGroupsForMode(mode);

  const primary = useMemo(() => {
    if (mode === "astrology") {
      return [
        { href: homeHref, labelKey: "navigation.home", icon: LayoutDashboard },
        { href: routes.kundli, labelKey: "navigation.kundli", icon: Stars },
        { href: routes.dasha, labelKey: "navigation.dashas", icon: BookOpen },
        { href: routes.aiInsights, labelKey: "navigation.aiInsights", icon: MessageCircle },
      ];
    }
    if (mode === "wisdom") {
      return [
        { href: homeHref, labelKey: "navigation.home", icon: LayoutDashboard },
        { href: routes.askTheSages, labelKey: "navigation.askTheSages", icon: Stars },
        { href: routes.wisdomJournal, labelKey: "navigation.wisdomJournal", icon: BookOpen },
        { href: routes.aiInsights, labelKey: "navigation.aiInsights", icon: MessageCircle },
      ];
    }
    return [
      { href: homeHref, labelKey: "navigation.home", icon: LayoutDashboard },
      { href: routes.matches, labelKey: "navigation.matches", icon: Heart },
      { href: routes.compatibility, labelKey: "navigation.compatibility", icon: BookOpen },
      { href: routes.chat, labelKey: "navigation.messages", icon: MessageCircle },
    ];
  }, [mode, homeHref]);

  return (
    <>
      <nav
        className="border-border/40 bg-background/92 dark:bg-background/88 fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-10px_36px_rgba(20,17,14,0.08)] backdrop-blur-2xl md:hidden dark:shadow-[0_-10px_36px_rgba(0,0,0,0.4)]"
        aria-label={t("navigation.workspaceMode")}
        data-mode={mode}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {primary.map((item) => {
            const active = isDashboardNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <LocaleLink
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
                  {t(item.labelKey)}
                  {active ? (
                    <span
                      className="bg-gold absolute bottom-0.5 h-1 w-1 rounded-full"
                      aria-hidden
                    />
                  ) : null}
                </LocaleLink>
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
              aria-label={t("navigation.more")}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  moreOpen ? "bg-primary/14 text-gold" : "bg-transparent",
                )}
              >
                <MoreHorizontal className="h-[1.15rem] w-[1.15rem]" aria-hidden />
              </span>
              {t("navigation.more")}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("navigation.more")}</SheetTitle>
          </SheetHeader>
          <ModeSwitcher className="mt-4 w-full" />
          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  {t(navGroupKey(group))}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {items
                    .filter((item) => (item.group ?? "Menu") === group)
                    .map((item) => {
                      const active = isDashboardNavActive(pathname, item.href);
                      const Icon = dashboardNavIcons[item.href];
                      return (
                        <LocaleLink
                          key={`${item.group}-${item.href}`}
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
                          {t(navTitleKey(item.href, item.title))}
                        </LocaleLink>
                      );
                    })}
                </div>
              </div>
            ))}
            <SignOutButton
              className="w-full"
              label={t("navigation.signOut")}
              redirectTo={routes.home}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
