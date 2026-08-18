"use client";

import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { DashboardNavList } from "@/components/layout/dashboard-nav-list";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { UserAvatar } from "@/components/layout/user-avatar";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/lib/auth/client";

export function MobileDashboardMenu({ triggerClassName }: { triggerClassName?: string }) {
  const pathname = useAppPathname();
  const t = useT();
  const { mode, homeHref } = useWorkspaceMode();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const userName = session?.user?.name?.trim() || t("pages.member");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet direction="left" open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("border-border/60 bg-card/80 rounded-xl md:hidden", triggerClassName)}
          aria-label={t("navigation.dashboard")}
          aria-expanded={open}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-background flex h-dvh max-h-dvh w-[min(100%,20rem)] flex-col overflow-hidden p-0"
      >
        <SheetHeader className="border-border/50 from-card to-background shrink-0 border-b bg-gradient-to-b p-4 text-left">
          <SheetTitle className="sr-only">{t("navigation.dashboard")}</SheetTitle>
          <BrandLogo href={homeHref} size="sm" />
          <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
            {mode === "astrology"
              ? t("navigation.modeAstrologySubtitle")
              : mode === "wisdom"
                ? t("navigation.modeRishiSageSubtitle")
                : t("navigation.modeMatrimonySubtitle")}
          </p>
          <div className="mt-3 w-full">
            <ModeSwitcher className="w-full" />
          </div>
        </SheetHeader>
        <div className="border-border/50 flex shrink-0 items-center justify-end border-b px-4 py-2.5">
          <Button asChild variant="outline" size="icon" className="shrink-0 rounded-xl">
            <LocaleLink href={routes.notifications} aria-label={t("navigation.notifications")}>
              <Bell className="h-4 w-4" />
            </LocaleLink>
          </Button>
        </div>
        <div className="scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <DashboardNavList onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-border/50 bg-background/80 shrink-0 space-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <LocaleLink
            href={routes.profile}
            className="border-border/50 hover:border-gold/30 hover:bg-muted/40 bg-card/80 flex items-center gap-3 rounded-2xl border px-2.5 py-2.5 transition-colors"
          >
            <UserAvatar name={userName} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{userName}</span>
              <span className="text-muted-foreground block text-[11px]">
                {t("navigation.viewProfile")}
              </span>
            </span>
          </LocaleLink>
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
