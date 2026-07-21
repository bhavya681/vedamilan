import { redirect } from "next/navigation";

import { PageTransition } from "@/components/animations/motion";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSession } from "@/lib/auth/session";
import { routes } from "@/lib/constants/routes";

/** Session check uses MongoDB — skip static prerender during Vercel build */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    // Cookie present but session invalid — clear via route handler, then login.
    redirect(`/api/auth/clear-session?next=${encodeURIComponent(routes.dashboard)}`);
  }

  return (
    <div className="bg-background flex h-dvh max-h-dvh flex-col overflow-hidden">
      <Navbar className="shrink-0" />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main
            id="main-content"
            className="scrollbar-premium min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24 sm:p-5 md:p-6 md:pb-6 lg:p-8"
          >
            <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
