import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function PaymentFailurePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <XCircle className="text-destructive h-14 w-14" aria-hidden="true" />
      <h1 className="font-display mt-4 text-3xl">Payment failed</h1>
      <p className="text-muted-foreground mt-2">
        Mock failure state for UX validation. Retry or choose another method later.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href={routes.checkout}>Try again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.payments}>Back to billing</Link>
        </Button>
      </div>
    </div>
  );
}
