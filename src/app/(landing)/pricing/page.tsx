import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PricingSection } from "@/features/payments/components/pricing-section";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="flex-1 pt-[calc(4.25rem+env(safe-area-inset-top,0px))]">
      <div className="mx-auto flex max-w-7xl justify-end px-4 pt-4 sm:px-6 lg:px-8">
        <Button asChild variant="outline" size="sm">
          <Link href={routes.home}>Back home</Link>
        </Button>
      </div>
      <PricingSection />
    </main>
  );
}
