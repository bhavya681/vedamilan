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
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.25),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_70%)] blur-2xl" />
        <div className="mandala-bg absolute inset-0 opacity-15 mix-blend-soft-light" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-gold text-[11px] font-semibold tracking-[0.22em] uppercase">
              Begin with clarity
            </p>
            <h2
              id="final-cta-heading"
              className="font-display text-ivory mt-4 text-3xl text-balance sm:text-4xl lg:text-5xl"
            >
              Your relationship intelligence workspace awaits
            </h2>
            <p className="text-ivory/70 mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
              Create a private profile, unlock Vedic charts, and receive explainable matches—crafted
              for modern seekers and families.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12">
                <Link href={routes.register}>
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ivory/30 text-ivory hover:bg-ivory/10 h-12 bg-transparent"
              >
                <Link href={routes.login}>Sign in</Link>
              </Button>
            </div>
            <p className="text-ivory/50 mt-6 text-xs">
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
