import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="focus:bg-background sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <Navbar variant="overlay" />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
