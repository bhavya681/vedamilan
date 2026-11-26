"use client";

import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const sizes = {
  sm: { mark: 32, full: 104 },
  md: { mark: 40, full: 144 },
  lg: { mark: 56, full: 208 },
  xl: { mark: 80, full: 288 },
} as const;

const FULL_LOGO_HEIGHT_RATIO = 432 / 1294;

export function BrandLogo({
  href = routes.home,
  size = "md",
  showWordmark = true,
  className,
  priority = false,
}: {
  href?: string;
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const dim = sizes[size];

  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:ring-ring inline-flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none sm:gap-2.5",
        className,
      )}
      aria-label={`${brand.name} home`}
    >
      <Image
        src={showWordmark ? brand.logo.full : brand.logo.mark}
        alt=""
        width={showWordmark ? dim.full : dim.mark}
        height={
          showWordmark ? Math.round(dim.full * FULL_LOGO_HEIGHT_RATIO) : dim.mark
        }
        priority={priority}
        className={cn("h-auto max-w-full object-contain", !showWordmark && "shrink-0")}
        aria-hidden
      />
      {!showWordmark ? <span className="sr-only">{brand.name}</span> : null}
    </Link>
  );
}

export function BrandMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      src={brand.logo.mark}
      alt={brand.name}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
