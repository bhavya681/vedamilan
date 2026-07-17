"use client";

import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const sizes = {
  sm: { mark: 32, text: "text-lg" },
  md: { mark: 40, text: "text-xl sm:text-2xl" },
  lg: { mark: 56, text: "text-3xl" },
  xl: { mark: 80, text: "text-5xl" },
} as const;

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
        "focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      aria-label={`${brand.name} home`}
    >
      <Image
        src={brand.logo.mark}
        alt=""
        width={dim.mark}
        height={dim.mark}
        priority={priority}
        className="shrink-0 object-contain"
        aria-hidden
      />
      {showWordmark ? (
        <span className={cn("font-display truncate tracking-wide", dim.text)}>
          <span className="text-brand-gold">{brand.shortName}</span>
          <span className="text-muted-foreground ml-1 align-middle text-[0.62em] font-semibold tracking-[0.14em]">
            AI
          </span>
        </span>
      ) : (
        <span className="sr-only">{brand.name}</span>
      )}
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
