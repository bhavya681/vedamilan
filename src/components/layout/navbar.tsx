"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
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

export function Navbar({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "overlay";
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const floating = isOverlay && !scrolled;

  return (
    <header
      className={cn(
        "z-40 transition-all duration-300",
        isOverlay ? "fixed inset-x-0 top-0" : "relative",
        floating
          ? "border-transparent bg-transparent"
          : "border-border/50 bg-background/90 dark:bg-background/85 border-b backdrop-blur-xl",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 w-full items-center justify-between gap-3 px-4 sm:h-16 sm:px-5 lg:px-6",
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
          {isDashboard ? (
            <p className="text-muted-foreground hidden truncate text-sm font-medium md:block">
              Workspace
            </p>
          ) : null}
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
            className="text-muted-foreground hidden items-center gap-4 text-sm lg:flex"
            aria-label="Quick"
          >
            <Link href={routes.matches} className="hover:text-foreground transition-colors">
              Matches
            </Link>
            <Link href={routes.aiInsights} className="hover:text-foreground transition-colors">
              AI Insights
            </Link>
            <Link href={routes.settings} className="hover:text-foreground transition-colors">
              Settings
            </Link>
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle
            className={cn(floating && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
          />
          {isPending ? null : isAuthed ? (
            <>
              {!isDashboard ? (
                <Button asChild className="shadow-gold hidden sm:inline-flex">
                  <Link href={routes.dashboard}>Dashboard</Link>
                </Button>
              ) : null}
              <SignOutButton
                className={cn(
                  "hidden sm:inline-flex",
                  floating && "border-ivory/30 text-ivory hover:bg-ivory/10 bg-transparent",
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
