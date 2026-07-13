import Link from "next/link";

import { brand } from "@/lib/constants/brand";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <main className="bg-navy text-ivory flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-gold text-3xl">{brand.name}</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Briefly under maintenance</h1>
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
