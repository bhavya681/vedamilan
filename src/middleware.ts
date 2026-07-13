import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = [
  "/login",
  "/register",
  "/otp",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

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

  const sessionCookie = getSessionCookie(request);
  const isAuthed = Boolean(sessionCookie);

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if ((isDashboard || isAdmin) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isAuthed && pathname !== "/verify-email" && pathname !== "/reset-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
