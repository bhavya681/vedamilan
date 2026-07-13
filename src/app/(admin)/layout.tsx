import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { getSession, isAdmin } from "@/lib/auth/session";
import { routes } from "@/lib/constants/routes";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect(routes.login);
  }
  if (!isAdmin(session.user)) {
    redirect(routes.dashboard);
  }

  return <AdminShell>{children}</AdminShell>;
}
