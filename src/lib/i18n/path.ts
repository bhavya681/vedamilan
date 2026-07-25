import { APP_LOCALES, DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/i18n/locales";

/** Paths that never receive a locale prefix (APIs, assets, health). */
export const LOCALE_PATH_EXEMPT_PREFIXES = [
  "/api",
  "/_next",
  "/favicon",
  "/brand",
  "/demo-portraits",
  "/og-",
  "/robots",
  "/sitemap",
  "/manifest",
  "/maintenance",
] as const;

export function isLocaleExemptPath(pathname: string): boolean {
  if (pathname.includes(".")) {
    // Static files like /og-default.svg, /apple-touch-icon.png
    const last = pathname.split("/").pop() || "";
    if (last.includes(".")) return true;
  }
  return LOCALE_PATH_EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function stripLocaleFromPathname(pathname: string): {
  locale: AppLocale | null;
  pathname: string;
} {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { locale: null, pathname: "/" };
  const maybe = parts[0];
  if (!isAppLocale(maybe)) return { locale: null, pathname: pathname || "/" };
  const rest = parts.slice(1).join("/");
  return { locale: maybe, pathname: rest ? `/${rest}` : "/" };
}

export function withLocalePrefix(locale: AppLocale, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export function negotiateBrowserLocale(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: (tag || "").toLowerCase(), q: qPart ? Number(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const base = tag.split("-")[0];
    if (isAppLocale(base)) return base;
    // pt-BR → pt, en-US → en, etc.
    const match = APP_LOCALES.find((l) => tag.startsWith(l));
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
