import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { routes } from "@/lib/constants/routes";

export const dynamic = "force-dynamic";

/** Clears stale Better Auth cookies, then sends the browser to login. */
export async function GET(request: Request) {
  const store = await cookies();
  for (const cookie of store.getAll()) {
    const name = cookie.name.toLowerCase();
    if (
      name.includes("session") ||
      name.includes("better-auth") ||
      name.startsWith("ba_") ||
      name.includes("__secure-better-auth")
    ) {
      store.delete(cookie.name);
    }
  }

  const url = new URL(request.url);
  const next = url.searchParams.get("next") || routes.dashboard;
  const login = new URL(routes.login, url.origin);
  login.searchParams.set("next", next.startsWith("/") ? next : routes.dashboard);
  return NextResponse.redirect(login);
}
