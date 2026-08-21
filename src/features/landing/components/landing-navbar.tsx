"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { useAppPathname } from "@/components/i18n/locale-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { landingCta, landingNav } from "@/features/landing/lib/nav";
import { LandingNoticeBanner } from "@/features/landing/components/landing-notice";
import { useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const pathname = useAppPathname();
  const { data: session, isPending } = useSession();
  const isHome = pathname === "/";
  const isAuthed = Boolean(session?.user);
  const compact = scrolled || !isHome;
  const overHero = isHome && !compact;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--landing-notice",
      bannerVisible ? "3.25rem" : "0px",
    );
    return () => {
      document.documentElement.style.setProperty("--landing-notice", "0px");
    };
  }, [bannerVisible]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto">
        <LandingNoticeBanner onVisibilityChange={setBannerVisible} />
      </div>
      <div
        className={cn(
          "px-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]",
          bannerVisible
            ? "pt-2"
            : "pt-[max(0.5rem,env(safe-area-inset-top,0px))]",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto relative z-50 mx-auto flex max-w-6xl items-center justify-between gap-3 transition-[background,box-shadow,height] duration-300",
            compact
              ? "border-border/40 bg-ivory/85 h-12 rounded-full border px-3 shadow-[0_8px_30px_rgba(20,17,14,0.08)] backdrop-blur-xl sm:h-14 dark:bg-[#14110E]/80"
              : "h-14 bg-transparent px-1 sm:h-16",
          )}
        >
          <BrandLogo
            href={isAuthed ? routes.dashboard : routes.home}
            size="sm"
            priority
            className={cn(overHero && "[&_span]:text-ivory [&_.text-muted-foreground]:text-ivory/70")}
          />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {landingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium tracking-wide transition-colors duration-200",
                  overHero
                    ? "text-ivory/80 hover:text-ivory"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle
              className={cn(overHero && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
            />
            <LanguageSelector
              compact
              variant="ghost"
              className={cn("hidden sm:inline-flex", overHero && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
            />
            {isPending ? null : isAuthed ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href={routes.dashboard}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn("hidden sm:inline-flex", overHero && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
                >
                  <Link href={landingCta.login.href}>{landingCta.login.label}</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "lg:hidden h-11 w-11",
                overHero && "border-ivory/30 text-ivory hover:bg-ivory/10 bg-transparent",
                compact && "rounded-full",
              )}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="bg-ivory pointer-events-auto fixed inset-0 z-[60] flex flex-col px-6 pt-[calc(5.5rem+var(--landing-notice,0px))] pb-[env(safe-area-inset-bottom,1rem)] lg:hidden dark:bg-[#14110E]">
          <nav className="flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
            {landingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display hover:text-secondary border-border/40 border-b py-3.5 text-2xl sm:py-4 sm:text-3xl"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pb-4">
            {isAuthed ? (
              <>
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href={routes.dashboard}>Open dashboard</Link>
                </Button>
                <SignOutButton className="w-full" redirectTo={routes.home} onSignedOut={() => setOpen(false)} />
              </>
            ) : (
              <>
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" onClick={() => setOpen(false)}>
                  <Link href={landingCta.login.href}>{landingCta.login.label}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
