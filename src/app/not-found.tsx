import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function NotFound() {
  return (
    <main className="bg-navy text-ivory flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-gold text-sm tracking-[0.2em] uppercase">404</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">This path is unwritten</h1>
      <p className="text-ivory/75 mt-4 max-w-md">
        The page you seek does not exist. Return home and continue your journey with intention.
      </p>
      <Button asChild className="mt-8">
        <Link href={routes.home}>Return home</Link>
      </Button>
    </main>
  );
}
