"use client";

import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Button } from "@/components/ui/button";
import { navForMode, navGroupsForMode } from "@/config/navigation";
import { dashboardNavIcons, isDashboardNavActive } from "@/config/dashboard-nav";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { navGroupKey, navTitleKey } from "@/lib/i18n/nav-labels";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { authClient, useSession } from "@/lib/auth/client";

const COLLAPSE_KEY = "vedamilan.sidebar.collapsed";

export function Sidebar({ className }: { className?: string }) {
  const pathname = useAppPathname();
  const router = useRouter();
  const t = useT();
  const { mode, homeHref } = useWorkspaceMode();
  const items = navForMode(mode);
  const groups = navGroupsForMode(mode);
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function onSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      setSigningOut(false);
      router.push(routes.home);
      router.refresh();
    }
  }

  const userName = session?.user?.name?.trim() || t("pages.member");

  return (
    <aside
      className={cn(
        "border-border/40 bg-card/95 dark:bg-card/90 relative hidden h-full shrink-0 flex-col border-r backdrop-blur-xl transition-[width] duration-300 md:flex",
        collapsed ? "w-[4.5rem]" : "w-[15.75rem] xl:w-[16.5rem]",
        className,
      )}
      aria-label="Dashboard sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      data-mode={mode}
    >
      <div
        className={cn(
          "border-border/40 relative shrink-0 border-b",
          collapsed ? "px-2.5 py-3" : "px-3 py-3.5 xl:px-4",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col justify-center" : "justify-between",
          )}
        >
          <BrandLogo
            href={homeHref}
            size="sm"
            showWordmark={!collapsed}
            className={collapsed ? "justify-center" : "min-w-0"}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-border/60 h-8 w-8 shrink-0"
            onClick={toggleCollapsed}
            aria-label={collapsed ? t("navigation.expandSidebar") : t("navigation.collapseSidebar")}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!collapsed ? (
          <div className="mt-3 space-y-2">
            <ModeSwitcher className="w-full" />
            <p
              key={mode}
              className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 truncate px-0.5 text-[10px] leading-snug duration-300"
            >
              {mode === "astrology"
                ? t("navigation.modeAstrologySubtitle")
                : t("navigation.modeMatrimonySubtitle")}
            </p>
          </div>
        ) : (
          <div className="mt-3 flex justify-center">
            <ModeSwitcher compact />
          </div>
        )}
      </div>

      <nav
        className={cn(
          "scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain py-4",
          collapsed ? "px-2" : "px-3 xl:px-3.5",
        )}
      >
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group}>
              {!collapsed ? (
                <p className="text-muted-foreground/75 mb-2 px-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  {t(navGroupKey(group))}
                </p>
              ) : (
                <div className="bg-border/60 mx-auto mb-2 h-px w-6" aria-hidden />
              )}
              <div className="space-y-1">
                {items
                  .filter((item) => (item.group ?? "Menu") === group)
                  .map((item) => {
                    const active = isDashboardNavActive(pathname, item.href);
                    const Icon = dashboardNavIcons[item.href];
                    const label = t(navTitleKey(item.href, item.title));
                    return (
                      <LocaleLink
                        key={`${item.group}-${item.href}`}
                        href={item.href}
                        title={collapsed ? label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                          collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5",
                          active
                            ? "bg-primary/12 text-foreground dark:bg-primary/16 shadow-[inset_0_0_0_1px_rgba(196,122,26,0.18)]"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-muted/50",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              "h-[1.15rem] w-[1.15rem] shrink-0 transition-colors",
                              active
                                ? "text-gold"
                                : "text-muted-foreground group-hover:text-foreground/80",
                            )}
                            aria-hidden
                          />
                        ) : null}
                        {!collapsed ? <span className="truncate">{label}</span> : null}
                      </LocaleLink>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          "border-border/40 bg-background/35 dark:bg-background/25 shrink-0 space-y-2 border-t",
          collapsed ? "p-2" : "p-3 xl:p-3.5",
        )}
      >
        <LocaleLink
          href={routes.profile}
          className={cn(
            "border-border/50 hover:border-gold/30 hover:bg-muted/40 bg-card/80 flex items-center gap-3 rounded-2xl border transition-colors",
            collapsed ? "justify-center p-2" : "px-2.5 py-2.5",
          )}
          title={collapsed ? t("navigation.profile") : undefined}
        >
          <UserAvatar name={userName} size="md" />
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{userName}</span>
              <span className="text-muted-foreground block text-[11px]">
                {t("navigation.viewProfile")}
              </span>
            </span>
          ) : null}
        </LocaleLink>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground hover:text-foreground w-full",
            collapsed ? "px-0" : "justify-start",
          )}
          onClick={() => void onSignOut()}
          disabled={signingOut}
          aria-label={t("navigation.signOut")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? (
            <span className="ms-2">{signingOut ? "…" : t("navigation.signOut")}</span>
          ) : null}
        </Button>
      </div>
    </aside>
  );
}
