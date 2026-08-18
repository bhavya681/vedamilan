"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { navForMode, navGroupsForMode } from "@/config/navigation";
import { dashboardNavIcons, isDashboardNavActive } from "@/config/dashboard-nav";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { navGroupKey, navTitleKey } from "@/lib/i18n/nav-labels";
import { cn } from "@/lib/utils/cn";

/** Same grouped destinations as the desktop sidebar, for mobile sheets. */
export function DashboardNavList({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = useAppPathname();
  const t = useT();
  const { mode } = useWorkspaceMode();
  const items = navForMode(mode);
  const groups = navGroupsForMode(mode);

  return (
    <nav className={cn("space-y-5", className)} aria-label={t("navigation.dashboard")}>
      {groups.map((group) => (
        <div key={group}>
          <p className="text-muted-foreground/80 mb-2 px-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
            {t(navGroupKey(group))}
          </p>
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
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/12 text-foreground dark:bg-primary/16 shadow-[inset_0_0_0_1px_rgba(196,122,26,0.16)]"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0",
                          active ? "text-gold" : undefined,
                        )}
                        aria-hidden
                      />
                    ) : null}
                    <span className="min-w-0 flex-1 leading-snug break-words">{label}</span>
                  </LocaleLink>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}
