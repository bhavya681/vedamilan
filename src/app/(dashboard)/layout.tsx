import { redirect } from "next/navigation";

import { PageTransition } from "@/components/animations/motion";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { OnboardingRedirect } from "@/features/onboarding/onboarding-redirect";
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
    <div className="bg-background flex h-dvh max-h-dvh overflow-hidden">
      <OnboardingRedirect />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar className="shrink-0" />
        <main
          id="main-content"
          className="scrollbar-premium bg-background/50 min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain px-3 py-4 pb-[calc(var(--dashboard-bottom-nav-h)+0.75rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-5 md:px-5 md:py-6 md:pb-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-6xl min-w-0 overflow-x-clip 2xl:max-w-[90rem]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
