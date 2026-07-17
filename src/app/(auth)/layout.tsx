import Image from "next/image";

import { BrandLogo, BrandMark } from "@/components/brand/brand-logo";
import { brand } from "@/lib/constants/brand";
import { landingImages } from "@/lib/constants/images";
import { routes } from "@/lib/constants/routes";

void routes;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="bg-navy relative hidden overflow-hidden lg:block">
        <Image
          src={landingImages.hero.src}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-55"
        />
        <div className="from-navy via-navy/75 to-navy/45 absolute inset-0 bg-gradient-to-t" />
        <div className="mandala-bg absolute inset-0 opacity-25 mix-blend-soft-light" />
        <div className="text-ivory relative flex h-full flex-col justify-end p-12">
          <BrandMark size={96} className="mb-5 drop-shadow-lg" />
          <p className="font-display text-brand-gold text-4xl tracking-wide">VedaMilan</p>
          <p className="text-ivory/80 mt-3 max-w-md text-lg leading-relaxed">
            Private by design. Explainable by default. Built for intentional unions.
          </p>
        </div>
      </div>

      <div className="bg-background relative flex items-center justify-center px-4 py-12">
        <div className="mandala-bg absolute inset-0 opacity-20 lg:opacity-10" aria-hidden />
        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <BrandLogo href={routes.home} size="lg" priority />
            <p className="text-muted-foreground mt-2 text-sm">{brand.tagline}</p>
          </div>
          <div className="glass-panel border-gold/15 shadow-elevated rounded-[1.75rem] p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
