"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#0B1426] px-4 text-center text-[#FAF6F0]">
        <p className="text-sm tracking-[0.2em] text-[#C9A227] uppercase">Critical error</p>
        <h1 className="mt-3 font-serif text-4xl">We need a moment</h1>
        <p className="mt-4 max-w-md text-[#FAF6F0]/80">
          {error.message || "A critical application error occurred."}
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>Reload</Button>
          <Button asChild variant="outline" className="border-ivory/30 text-ivory">
            <Link href={routes.home}>Home</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
