import { LandingMotionProvider } from "@/components/providers/landing-motion-provider";
import { LandingFooter } from "@/features/landing/components/close-sections";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

import "@/features/landing/landing.css";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingMotionProvider>
      <div className="landing-shell flex min-h-dvh flex-col overflow-x-clip">
        <LandingNavbar />
        <div className="flex-1">{children}</div>
        <LandingFooter />
      </div>
    </LandingMotionProvider>
  );
}
