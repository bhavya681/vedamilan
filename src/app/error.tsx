"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-saffron text-sm tracking-[0.2em] uppercase">500</p>
      <h1 className="font-display mt-3 text-4xl">Something went astray</h1>
      <p className="text-muted-foreground mt-4 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={routes.home}>Go home</Link>
        </Button>
      </div>
    </main>
  );
}
