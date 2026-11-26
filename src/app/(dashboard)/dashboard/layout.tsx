import { KundlivWelcome } from "@/features/onboarding/kundliv-welcome";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <KundlivWelcome />
    </>
  );
}
