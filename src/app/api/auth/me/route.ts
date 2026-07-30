import { NextResponse } from "next/server";

import { getSession, getUserRoles, isAdmin } from "@/lib/auth/session";
import { handleRouteError } from "@/lib/utils/error-handler";
import { formatPersonName } from "@/lib/utils/person-name";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      emailVerified: boolean;
      role?: string | null;
      phone?: string | null;
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: formatPersonName(user.name, "Member"),
        email: user.email,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        role: user.role ?? null,
        roles: getUserRoles(user),
        isAdmin: isAdmin(user),
        phone: user.phone ?? null,
      },
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
