import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <CheckCircle2 className="text-primary h-14 w-14" aria-hidden="true" />
      <h1 className="font-display mt-4 text-3xl">Payment successful</h1>
      <p className="text-muted-foreground mt-2">
        Mock confirmation. Your premium features would unlock here in later phases.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href={routes.dashboard}>Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.invoice}>View invoice</Link>
        </Button>
      </div>
    </div>
  );
}
