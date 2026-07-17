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
        isOverlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        floating
          ? "border-transparent bg-transparent"
          : "border-border/40 bg-background/75 border-b backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {isDashboard ? <MobileDashboardMenu /> : null}
          <BrandLogo
            href={isAuthed ? routes.dashboard : routes.home}
            size="md"
            priority
            className={floating ? "[&_span]:text-ivory" : undefined}
          />
        </div>

        {!isDashboard ? (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
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
            className="text-muted-foreground hidden items-center gap-4 text-sm md:flex"
            aria-label="Quick"
          >
            <Link href={routes.matches} className="hover:text-foreground">
              Matches
            </Link>
            <Link href={routes.aiInsights} className="hover:text-foreground">
              AI
            </Link>
            <Link href={routes.settings} className="hover:text-foreground">
              Settings
            </Link>
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
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
              <SheetContent side="right" className="p-0">
                <SheetHeader className="border-border/60 border-b p-4 text-left">
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
