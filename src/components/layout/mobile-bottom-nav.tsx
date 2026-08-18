"use client";

import {
  BrainCircuit,
  Compass,
  Heart,
  Home,
  Library,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  NotebookPen,
  PieChart,
  Stars,
  Sunrise,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { DashboardNavList } from "@/components/layout/dashboard-nav-list";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isDashboardNavActive } from "@/config/dashboard-nav";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function MobileBottomNav() {
  const pathname = useAppPathname();
  const t = useT();
  const { mode, homeHref } = useWorkspaceMode();
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = useMemo(() => {
    if (mode === "astrology") {
      return [
        { href: homeHref, labelKey: "navigation.home", icon: Stars },
        { href: routes.horoscope, labelKey: "navigation.horoscope", icon: Sunrise },
        { href: routes.kundli, labelKey: "navigation.kundli", icon: PieChart },
        { href: routes.aiInsights, labelKey: "navigation.aiInsights", icon: BrainCircuit },
      ];
    }
    if (mode === "wisdom") {
      return [
        { href: homeHref, labelKey: "navigation.home", icon: Library },
        { href: routes.askTheSages, labelKey: "navigation.askTheSages", icon: MessagesSquare },
        { href: routes.wisdomJournal, labelKey: "navigation.wisdomJournal", icon: NotebookPen },
        { href: routes.profile, labelKey: "navigation.profile", icon: UserRound },
      ];
    }
    return [
      { href: homeHref, labelKey: "navigation.home", icon: Home },
      { href: routes.matches, labelKey: "navigation.matches", icon: Heart },
      { href: routes.chat, labelKey: "navigation.messages", icon: MessageCircle },
      { href: routes.compatibility, labelKey: "navigation.compatibility", icon: Compass },
    ];
  }, [mode, homeHref]);

  const primaryActive = primary.some((item) => isDashboardNavActive(pathname, item.href));
  const moreActive = moreOpen || !primaryActive;

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="border-border/40 bg-background/92 dark:bg-background/88 fixed inset-x-0 bottom-0 z-40 border-t px-1.5 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-10px_36px_rgba(20,17,14,0.08)] backdrop-blur-2xl sm:px-2 md:hidden dark:shadow-[0_-10px_36px_rgba(0,0,0,0.4)]"
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
                    "relative flex max-w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] leading-tight font-medium transition-colors sm:px-2",
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
                  <span className="max-w-full truncate px-0.5 text-center">{t(item.labelKey)}</span>
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
                moreActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMoreOpen(true)}
              aria-label={t("navigation.more")}
              aria-expanded={moreOpen}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  moreActive ? "bg-primary/14 text-gold" : "bg-transparent",
                )}
              >
                <MoreHorizontal className="h-[1.15rem] w-[1.15rem]" aria-hidden />
              </span>
              <span className="max-w-full truncate px-0.5 text-center">{t("navigation.more")}</span>
              {moreActive ? (
                <span className="bg-gold absolute bottom-0.5 h-1 w-1 rounded-full" aria-hidden />
              ) : null}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} shouldScaleBackground={false}>
        <SheetContent
          side="bottom"
          className="flex h-[min(92dvh,46rem)] flex-col overflow-hidden rounded-t-3xl px-0 pb-0"
        >
          <SheetHeader className="shrink-0 px-4 text-left">
            <SheetTitle>{t("navigation.more")}</SheetTitle>
          </SheetHeader>
          <div className="shrink-0 px-4">
            <ModeSwitcher className="mt-1 w-full" />
          </div>
          <div className="scrollbar-premium mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
            <DashboardNavList onNavigate={() => setMoreOpen(false)} />
          </div>
          <div className="border-border/50 shrink-0 border-t px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
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
