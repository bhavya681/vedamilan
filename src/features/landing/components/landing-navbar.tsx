"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const pathname = useAppPathname();
  const { data: session, isPending } = useSession();
  const isHome = pathname === "/";
  const isAuthed = Boolean(session?.user);
  const compact = scrolled || !isHome;
  const overHero = isHome && !compact;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const element = noticeRef.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = bannerVisible ? Math.ceil(element.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty("--landing-notice", `${height}px`);
      });
    };

    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.setProperty("--landing-notice", "0px");
    };
  }, [bannerVisible]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div ref={noticeRef} className="pointer-events-auto">
        <LandingNoticeBanner onVisibilityChange={setBannerVisible} />
      </div>
      <div
        className={cn(
          "landing-container",
          bannerVisible ? "pt-2" : "pt-[max(0.5rem,env(safe-area-inset-top,0px))]",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto relative z-50 flex items-center justify-between gap-3 transition-[background,box-shadow,height] duration-300",
            compact
              ? "border-border bg-background/90 shadow-elevated h-12 rounded-full border px-3 backdrop-blur-xl sm:h-14"
              : "h-14 bg-transparent px-1 sm:h-16",
          )}
        >
          <BrandLogo
            href={isAuthed ? routes.dashboard : routes.home}
            size="sm"
            priority
            className={cn(overHero && "[&_.text-muted-foreground]:text-foreground/70")}
          />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {landingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium tracking-wide transition-colors duration-200",
                  overHero
                    ? "text-foreground/80 hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle
              className={cn(
                overHero && "text-foreground hover:bg-foreground/10 hover:text-foreground",
              )}
            />
            <LanguageSelector
              compact
              variant="ghost"
              className={cn(
                "hidden sm:inline-flex",
                overHero && "text-foreground hover:bg-foreground/10 hover:text-foreground",
              )}
            />
            {mounted && !isPending && isAuthed ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href={routes.dashboard}>Dashboard</Link>
              </Button>
            ) : mounted && !isPending && !isAuthed ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hidden sm:inline-flex",
                    overHero && "text-foreground hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  <Link href={landingCta.login.href}>{landingCta.login.label}</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href={landingCta.getStarted.href}>{landingCta.getStarted.label}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hidden sm:inline-flex",
                    overHero && "text-foreground hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  <Link href={landingCta.login.href}>{landingCta.login.label}</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href={landingCta.getStarted.href}>{landingCta.getStarted.label}</Link>
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-11 w-11 lg:hidden",
                overHero &&
                  "border-border/60 text-foreground hover:bg-foreground/10 bg-transparent",
                compact && "rounded-full",
              )}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="landing-mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="landing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          className="bg-background text-foreground pointer-events-auto fixed inset-0 z-[60] flex flex-col px-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[env(safe-area-inset-bottom,1rem)] lg:hidden"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="border-border/40 mb-4 flex items-center justify-between gap-3 border-b pb-4">
            <BrandLogo href={isAuthed ? routes.dashboard : routes.home} size="sm" priority />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                <SignOutButton
                  className="w-full"
                  redirectTo={routes.home}
                  onSignedOut={() => setOpen(false)}
                />
              </>
            ) : (
              <>
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href={landingCta.getStarted.href}>{landingCta.getStarted.label}</Link>
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
