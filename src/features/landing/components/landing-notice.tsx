"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StickyBanner } from "@/components/ui/sticky-banner";
import { useAppPathname } from "@/components/i18n/locale-navigation";
import { routes } from "@/lib/constants/routes";

const NOTICES = [
  {
    kicker: "One platform",
    text: "Kundli, AI Guru and compatibility — explore all three in one place.",
    href: "/#experiences",
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
    kicker: "Begin",
    text: "Start with your Vedic universe. One intelligent experience.",
    href: routes.register,
    cta: "Get started",
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
    setNotice(
      NOTICES[Math.floor(Date.now() / (1000 * 60 * 60 * 8)) % NOTICES.length] ?? NOTICES[0],
    );
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
  }, [onVisibilityChange]);

  if (!allowed) return null;

  return (
    <StickyBanner
      onOpenChange={handleOpenChange}
      onDismiss={handleDismiss}
      className="landing-notice-banner relative pt-[max(0.375rem,env(safe-area-inset-top,0px))] pr-10 pb-1.5 pl-4 sm:px-12 sm:pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:pb-2"
    >
      <p className="landing-notice-text">
        <span className="landing-notice-kicker">{notice.kicker}</span>
        {notice.text}{" "}
        <Link href={notice.href} className="landing-notice-link">
          {notice.cta}
        </Link>
      </p>
    </StickyBanner>
  );
}
