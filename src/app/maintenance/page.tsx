import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <main className="bg-navy text-ivory flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <BrandLogo href="/" size="lg" className="[&_span]:text-ivory" />
      <h1 className="font-display mt-6 text-4xl sm:text-5xl">Briefly under maintenance</h1>
      <p className="text-ivory/75 mt-4 max-w-lg">
        We are refining the experience for clearer charts, calmer discovery, and stronger
        matchmaking. Please check back shortly.
      </p>
      <Button asChild className="mt-8" variant="secondary">
        <Link href="mailto:support@vedamilan.ai">Contact support</Link>
      </Button>
    </main>
  );
}
