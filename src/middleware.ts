import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_EXPLICIT_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/locales";
import {
  isLocaleExemptPath,
  negotiateBrowserLocale,
  stripLocaleFromPathname,
  withLocalePrefix,
} from "@/lib/i18n/path";

function resolveLocale(request: NextRequest, urlLocale: AppLocale | null): AppLocale {
  if (urlLocale) return urlLocale;

  const explicit = request.cookies.get(LOCALE_EXPLICIT_COOKIE)?.value === "1";
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (explicit && isAppLocale(cookieLocale)) return cookieLocale;
  if (isAppLocale(cookieLocale)) return cookieLocale;

  return negotiateBrowserLocale(request.headers.get("accept-language"));
}

function applyLocaleCookies(response: NextResponse, locale: AppLocale, explicit: boolean) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  if (explicit) {
    response.cookies.set(LOCALE_EXPLICIT_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}

export function middleware(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const { pathname } = request.nextUrl;

  if (
    maintenanceMode &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  if (isLocaleExemptPath(pathname)) {
    return NextResponse.next();
  }

  const { locale: urlLocale, pathname: barePath } = stripLocaleFromPathname(pathname);
  const locale = resolveLocale(request, urlLocale);
  const explicitFromUrl =
    Boolean(urlLocale) && request.cookies.get(LOCALE_EXPLICIT_COOKIE)?.value === "1";

  // Always serve under /{locale}/... for pages (SEO + consistent deep links).
  if (!urlLocale) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix(locale, barePath === "/" ? "/" : barePath);
    const response = NextResponse.redirect(url);
    applyLocaleCookies(response, locale, false);
    return response;
  }

  // Rewrite /hi/dashboard → /dashboard while keeping the locale in the browser URL.
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath === "" ? "/" : barePath;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const sessionCookie = getSessionCookie(request);
  const hasSessionCookie = Boolean(sessionCookie);
  const isDashboard = barePath === "/dashboard" || barePath.startsWith("/dashboard/");
  const isAdmin = barePath === "/admin" || barePath.startsWith("/admin/");

  if ((isDashboard || isAdmin) && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix(locale, "/login");
    url.searchParams.set("next", barePath);
    const response = NextResponse.redirect(url);
    applyLocaleCookies(response, locale, explicitFromUrl || Boolean(urlLocale));
    return response;
  }

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  applyLocaleCookies(response, locale, request.cookies.get(LOCALE_EXPLICIT_COOKIE)?.value === "1");
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
