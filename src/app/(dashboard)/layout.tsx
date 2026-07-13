import { PageTransition } from "@/components/animations/motion";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main-content" className="flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
