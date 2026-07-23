"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Heart, Menu, MessageCircle, Palette, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDashboardMenu } from "@/components/layout/mobile-dashboard-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { mainNav } from "@/config/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/lib/auth/client";

const DASH_QUICK = [
  { href: routes.matches, label: "Matches", icon: Heart },
  { href: routes.chat, label: "Messages", icon: MessageCircle },
  { href: routes.search, label: "Search", icon: Search },
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
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthed = Boolean(session?.user);

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
    void fetch("/api/notifications")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) {
          setUnread(Number(json.data?.unread || 0));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isDashboard, isAuthed, pathname]);

  const floating = isOverlay && !scrolled;
  const userName = session?.user?.name?.trim() || "You";
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

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
            href={isAuthed ? routes.dashboard : routes.home}
            size="md"
            priority
            className={cn(floating ? "[&_span]:text-ivory" : undefined, isDashboard && "md:hidden")}
          />
        </div>

        {!isDashboard ? (
          <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Primary">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  floating
                    ? "text-ivory/80 hover:text-ivory"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        ) : (
          <nav
            className="bg-muted/40 dark:bg-muted/25 border-border/40 hidden items-center gap-1 rounded-full border p-1 lg:flex"
            aria-label="Quick"
          >
            {DASH_QUICK.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active && "text-gold")} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
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
                    className="text-muted-foreground hover:text-foreground relative hidden sm:inline-flex"
                  >
                    <Link href={routes.notifications} aria-label="Notifications">
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
                    <span className="bg-navy text-ivory flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold">
                      {initials || "VM"}
                    </span>
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
                  <Link href={routes.dashboard}>Dashboard</Link>
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
          ) : (
            <SignOutButton
              className="sm:hidden"
              variant="outline"
              size="sm"
              redirectTo={routes.home}
            />
          )}
        </div>
      </div>
    </header>
  );
}
