"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { useLocale } from "@/components/i18n/i18n-provider";
import { LOCALE_COOKIE, LOCALE_EXPLICIT_COOKIE, type AppLocale } from "@/lib/i18n/locales";
import { stripLocaleFromPathname, withLocalePrefix } from "@/lib/i18n/path";

export function useAppPathname() {
  const pathname = usePathname() || "/";
  return stripLocaleFromPathname(pathname).pathname;
}

export function localizedHref(locale: AppLocale, href: string) {
  if (!href.startsWith("/")) return href;
  if (href.startsWith("/api") || href.startsWith("/_next")) return href;
  const { pathname, search, hash } = splitHref(href);
  return `${withLocalePrefix(locale, pathname)}${search}${hash}`;
}

function splitHref(href: string) {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const searchIndex = withoutHash.indexOf("?");
  const search = searchIndex >= 0 ? withoutHash.slice(searchIndex) : "";
  const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;
  return { pathname, search, hash };
}

export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const nextHref = typeof href === "string" ? localizedHref(locale, href) : href;
  return <Link href={nextHref} {...props} />;
}

export function useLocaleRouter() {
  const router = useRouter();
  const locale = useLocale();
  return {
    push: (href: string) => router.push(localizedHref(locale, href)),
    replace: (href: string) => router.replace(localizedHref(locale, href)),
    locale,
  };
}

export function persistLocaleChoice(locale: AppLocale) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `${LOCALE_EXPLICIT_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

export function switchLocale(nextLocale: AppLocale) {
  persistLocaleChoice(nextLocale);
  const { pathname, search, hash } = window.location;
  const stripped = stripLocaleFromPathname(pathname).pathname;
  const target = `${withLocalePrefix(nextLocale, stripped)}${search}${hash}`;
  window.location.assign(target);
}
