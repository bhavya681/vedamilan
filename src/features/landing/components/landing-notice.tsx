"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StickyBanner } from "@/components/ui/sticky-banner";
import { useAppPathname } from "@/components/i18n/locale-navigation";
import { routes } from "@/lib/constants/routes";

const STORAGE_KEY = "vm-landing-notice";

const NOTICES = [
  {
    kicker: "Compatibility",
    text: "Compatibility is more than a number. See how two lives may align.",
    href: "/#compatibility",
    cta: "Explore",
  },
  {
    kicker: "Vedic",
    text: "Charts are engine-calculated. AI explains them — it does not invent the sky.",
    href: "/#vedic",
    cta: "See how",
  },
  {
    kicker: "Connection",
    text: "Conversation opens only when interest is mutual.",
    href: "/#how",
    cta: "How it works",
  },
  {
    kicker: "Matchmaking",
    text: "Find someone who aligns with your life — not only a filter.",
    href: routes.register,
    cta: "Begin",
  },
] as const;

export function LandingNoticeBanner({
  onVisibilityChange,
}: {
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const pathname = useAppPathname();
  const [notice, setNotice] = useState<(typeof NOTICES)[number]>(NOTICES[0]);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setAllowed(false);
      onVisibilityChange?.(false);
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "dismissed") {
        setAllowed(false);
        onVisibilityChange?.(false);
        return;
      }
    } catch {
      /* private mode */
    }
    setNotice(NOTICES[Math.floor(Date.now() / (1000 * 60 * 60 * 8)) % NOTICES.length] ?? NOTICES[0]);
    setAllowed(true);
  }, [pathname, onVisibilityChange]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onVisibilityChange?.(Boolean(allowed && open));
    },
    [allowed, onVisibilityChange],
  );

  const handleDismiss = useCallback(() => {
    onVisibilityChange?.(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* private mode */
    }
  }, [onVisibilityChange]);

  if (!allowed) return null;

  return (
    <StickyBanner
      hideOnScroll
      onOpenChange={handleOpenChange}
      onDismiss={handleDismiss}
      className="bg-navy text-ivory relative px-8 pt-[env(safe-area-inset-top,0px)] sm:px-12"
    >
      <p className="text-ivory mx-0 max-w-[min(42rem,calc(100%-2.5rem))] text-center text-[13px] leading-snug sm:text-sm">
        <span className="text-ivory/55 mr-2 tracking-[0.16em] uppercase">{notice.kicker}</span>
        {notice.text}{" "}
        <Link
          href={notice.href}
          className="text-ivory underline decoration-white/35 underline-offset-4 transition duration-200 hover:decoration-white"
        >
          {notice.cta}
        </Link>
      </p>
    </StickyBanner>
  );
}
