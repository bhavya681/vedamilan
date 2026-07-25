import { headers } from "next/headers";

import { getAuth } from "@/lib/auth";
import type { UserRoleCode } from "@/infrastructure/database/base";
import { ForbiddenError, UnauthorizedError } from "@/lib/utils/error-handler";
import { assertSameUser } from "@/lib/security/rate-limit";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  role?: string | null;
  roles?: string[];
  phone?: string | null;
  displayName?: string | null;
};

export async function getSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

export function getUserRoles(user: SessionUser | null | undefined): string[] {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (user.role) {
    const mapped =
      user.role === "admin"
        ? "ADMIN"
        : user.role === "super_admin"
          ? "SUPER_ADMIN"
          : user.role.toUpperCase();
    return [mapped];
  }
  return ["MEMBER"];
}

export function hasRole(user: SessionUser | null | undefined, roles: UserRoleCode[]): boolean {
  const current = getUserRoles(user);
  return roles.some((role) => current.includes(role));
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, ["ADMIN", "SUPER_ADMIN"]);
}

/** Authenticated session + one of the allowed roles. */
export async function requireRole(roles: UserRoleCode[]) {
  const session = await requireSession();
  if (!hasRole(session.user as SessionUser, roles)) {
    throw new ForbiddenError("Insufficient role for this action");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole(["ADMIN", "SUPER_ADMIN"]);
}

/** Authenticated caller must own the resource user id. */
export async function requireOwnership(resourceUserId: string) {
  const session = await requireSession();
  assertSameUser(session.user.id, resourceUserId);
  return session;
}
