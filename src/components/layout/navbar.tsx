"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Heart,
  Menu,
  MessageCircle,
  Palette,
  Search,
  Sparkles,
  Stars,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { useT } from "@/components/i18n/i18n-provider";
import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDashboardMenu } from "@/components/layout/mobile-dashboard-menu";
import { UserAvatar } from "@/components/layout/user-avatar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { mainNav } from "@/config/navigation";
import { useWorkspaceModeOptional } from "@/components/providers/workspace-mode-provider";
import { navTitleKey } from "@/lib/i18n/nav-labels";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/lib/auth/client";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notifications/events";

const MATRIMONY_QUICK = [
  { href: routes.matches, labelKey: "navigation.matches", icon: Heart },
  { href: routes.chat, labelKey: "navigation.messages", icon: MessageCircle },
  { href: routes.search, labelKey: "navigation.search", icon: Search },
] as const;

const ASTROLOGY_QUICK = [
  { href: routes.kundli, labelKey: "navigation.kundli", icon: Stars },
  { href: routes.dasha, labelKey: "navigation.dashas", icon: CalendarDays },
  { href: routes.rajaYogas, labelKey: "navigation.rajaYogas", icon: Sparkles },
] as const;

const WISDOM_QUICK = [
  { href: routes.vedicWisdom, labelKey: "navigation.vedicWisdom", icon: BookOpen },
  { href: routes.askTheSages, labelKey: "navigation.askTheSages", icon: Sparkles },
  { href: routes.wisdomJournal, labelKey: "navigation.wisdomJournal", icon: BookOpen },
] as const;

export function Navbar({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "overlay";
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);
  const isOverlay = variant === "overlay";
  const pathname = useAppPathname();
  const t = useT();
  const { data: session, isPending } = useSession();
  const workspace = useWorkspaceModeOptional();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthed = Boolean(session?.user);
  const homeHref = workspace?.homeHref ?? routes.dashboard;
  const dashQuick =
    workspace?.mode === "astrology"
      ? ASTROLOGY_QUICK
      : workspace?.mode === "wisdom"
        ? WISDOM_QUICK
        : MATRIMONY_QUICK;

  useEffect(() => {
    if (!isOverlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOverlay]);

  useEffect(() => {
    if (!isDashboard || !isAuthed) return;
    let cancelled = false;

    async function refreshUnread() {
      try {
        const r = await fetch("/api/notifications");
        const json = await r.json();
        if (!cancelled && json.success) {
          setUnread(Number(json.data?.unread || 0));
        }
      } catch {
        /* ignore */
      }
    }

    void refreshUnread();

    function onUpdated(event: Event) {
      const detail = (event as CustomEvent<{ unread?: number }>).detail;
      if (typeof detail?.unread === "number") {
        setUnread(detail.unread);
        return;
      }
      void refreshUnread();
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
    };
  }, [isDashboard, isAuthed, pathname]);

  const floating = isOverlay && !scrolled;
  const userName = session?.user?.name?.trim() || t("pages.you");

  return (
    <header
      className={cn(
        "z-40 transition-all duration-300",
        isOverlay ? "fixed inset-x-0 top-0" : "relative",
        floating
          ? "border-transparent bg-transparent"
          : "border-border/40 bg-background/85 dark:bg-background/80 border-b backdrop-blur-2xl",
        isDashboard &&
          !floating &&
          "bg-card/70 dark:bg-card/50 shadow-[0_1px_0_rgba(20,17,14,0.03)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 w-full items-center justify-between gap-3 px-3 sm:h-16 sm:px-5 lg:px-6",
          !isDashboard && "mx-auto max-w-7xl lg:px-8",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isDashboard ? <MobileDashboardMenu /> : null}
          <BrandLogo
            href={isAuthed ? homeHref : routes.home}
            size="md"
            priority
            className={cn(floating ? "[&_span]:text-ivory" : undefined, isDashboard && "md:hidden")}
          />
        </div>

        {!isDashboard ? (
          <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Primary">
            {mainNav.map((item) => (
              <LocaleLink
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  floating
                    ? "text-ivory/80 hover:text-ivory"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.href === "/#how"
                  ? t("navigation.howItWorks")
                  : item.href === "/#compatibility"
                    ? t("navigation.compatibility")
                    : t(navTitleKey(item.href, item.title))}
              </LocaleLink>
            ))}
          </nav>
        ) : (
          <nav
            className="bg-muted/40 dark:bg-muted/25 border-border/40 hidden items-center gap-1 rounded-full border p-1 md:flex"
            aria-label="Quick"
          >
            {dashQuick.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <LocaleLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all lg:px-3.5",
                    active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active && "text-gold")} aria-hidden />
                  <span className="hidden lg:inline">{t(item.labelKey)}</span>
                  <span className="sr-only lg:hidden">{t(item.labelKey)}</span>
                </LocaleLink>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <LanguageSelector
            compact
            variant="ghost"
            className={cn(
              "hidden sm:inline-flex",
              floating && "text-ivory hover:bg-ivory/10 hover:text-ivory",
            )}
          />
          <ThemeToggle
            className={cn(floating && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
          />

          {isPending ? null : isAuthed ? (
            <>
              {isDashboard ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground relative"
                  >
                    <Link href={routes.notifications} aria-label={t("navigation.notifications")}>
                      <Bell className="h-4 w-4" />
                      {unread > 0 ? (
                        <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                  <Link
                    href={routes.profile}
                    className="border-border/60 hover:border-gold/40 hidden items-center gap-2 rounded-full border py-1 pr-2.5 pl-1 transition-colors sm:inline-flex"
                    aria-label="My profile"
                  >
                    <UserAvatar name={userName} size="sm" />
                    <span className="max-w-[7rem] truncate text-sm font-medium">{userName}</span>
                  </Link>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hidden lg:inline-flex"
                  >
                    <Link href={routes.appearance} aria-label="Appearance settings">
                      <Palette className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="shadow-gold hidden sm:inline-flex">
                  <Link href={routes.dashboard}>{t("navigation.dashboard")}</Link>
                </Button>
              )}
              <SignOutButton
                className={cn(
                  "hidden lg:inline-flex",
                  floating && "border-ivory/30 text-ivory hover:bg-ivory/10 bg-transparent",
                  isDashboard && "lg:hidden",
                )}
                variant="outline"
                size="sm"
                redirectTo={routes.home}
              />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "hidden sm:inline-flex",
                  floating && "text-ivory hover:bg-ivory/10 hover:text-ivory",
                )}
              >
                <Link href={routes.login}>Sign in</Link>
              </Button>
              <Button asChild className="shadow-gold hidden sm:inline-flex">
                <Link href={routes.register}>Begin journey</Link>
              </Button>
            </>
          )}

          {!isDashboard ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "md:hidden",
                    floating && "border-ivory/30 text-ivory hover:bg-ivory/10 bg-transparent",
                  )}
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background p-0">
                <SheetHeader className="border-border/50 border-b p-4 text-left">
                  <SheetTitle>
                    <BrandLogo href={routes.home} size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <MobileNav onNavigate={() => setOpen(false)} authed={isAuthed} />
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>
    </header>
  );
}
