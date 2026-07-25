import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/locales";
import { negotiateBrowserLocale } from "@/lib/i18n/path";

/**
 * Server-side locale resolution for layouts/pages.
 * Priority: middleware header → cookie → Accept-Language → default.
 * Explicit user choice is encoded in the cookie by the language selector / settings.
 */
export async function getRequestLocale(): Promise<AppLocale> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LOCALE_HEADER);
  if (isAppLocale(fromHeader)) return fromHeader;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isAppLocale(fromCookie)) return fromCookie;

  return negotiateBrowserLocale(headerStore.get("accept-language"));
}

export function resolveLocaleCandidate(candidates: Array<string | null | undefined>): AppLocale {
  for (const value of candidates) {
    if (isAppLocale(value)) return value;
  }
  return DEFAULT_LOCALE;
}
