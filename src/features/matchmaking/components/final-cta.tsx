"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export function FinalCtaSection() {
  return (
    <section
      className="bg-navy text-ivory relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(31,58,95,0.55),transparent_70%)] blur-2xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-brand-gold text-3xl tracking-wide sm:text-4xl">
              {brand.shortName}
              <span className="text-ivory/55 ml-2 text-[0.45em] font-semibold tracking-[0.16em]">
                AI
              </span>
            </p>
            <h2
              id="final-cta-heading"
              className="font-display text-ivory mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl"
            >
              Begin with clarity
            </h2>
            <p className="text-ivory/70 mx-auto mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
              Create a private profile, unlock your kundli, and meet people ranked by real
              compatibility.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="shadow-gold h-12">
                <Link href={routes.register}>
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ivory/25 text-ivory hover:bg-ivory/10 h-12 bg-transparent"
              >
                <Link href={routes.login}>Sign in</Link>
              </Button>
            </div>
            <p className="text-ivory/45 mt-7 text-xs">
              Questions?{" "}
              <a className="text-gold hover:underline" href={`mailto:${brand.supportEmail}`}>
                {brand.supportEmail}
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
