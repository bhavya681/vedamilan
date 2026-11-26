import { MarketingPageShell } from "@/components/layout/landing-section";
import { ContactStudio } from "@/features/landing/components/contact-studio";

export const metadata = {
  title: "Contact",
  description: "Write to the KUNDLIV care team. We usually reply within one business day.",
};

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <ContactStudio />
    </MarketingPageShell>
  );
}
