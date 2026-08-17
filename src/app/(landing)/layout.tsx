import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar variant="overlay" />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
