"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { LocaleLink } from "@/components/i18n/locale-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { editorial } from "@/features/landing/lib/images";
import { landingCta } from "@/features/landing/lib/nav";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

const ease = [0.22, 1, 0.36, 1] as const;

export function LandingFinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="final-cta-heading">
      <motion.div
        className="absolute inset-0 -z-20"
        initial={reduceMotion ? false : { scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
        aria-hidden
      >
        <Image
          src={editorial.quiet.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,17,14,0.92)_0%,rgba(20,17,14,0.62)_48%,rgba(20,17,14,0.45)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110E] via-transparent to-[#14110E]/40" />
      </motion.div>

      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute top-1/2 right-[8%] hidden h-[22rem] w-[22rem] -translate-y-1/2 text-[#F7F1E3] opacity-[0.12] lg:block"
      >
        <rect x="8" y="8" width="84" height="84" fill="none" stroke="currentColor" />
        <polygon points="50,8 92,50 50,92 8,50" fill="none" stroke="#D4AF37" strokeWidth="1.1" />
        <line x1="8" y1="8" x2="92" y2="92" stroke="currentColor" opacity="0.35" />
        <line x1="92" y1="8" x2="8" y2="92" stroke="currentColor" opacity="0.35" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-end gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="text-ivory/55 text-[11px] font-semibold tracking-[0.2em] uppercase">
            Begin
          </p>
          <h2
            id="final-cta-heading"
            className="font-display text-ivory mt-3 text-[1.75rem] leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem]"
          >
            Your story does not have to begin with a swipe.
          </h2>
          <p className="text-ivory/78 mt-4 text-base sm:text-lg">Start with understanding.</p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full sm:w-auto">
              <Link href={landingCta.match.href}>{landingCta.match.label}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ivory/30 bg-ivory/5 text-ivory hover:bg-ivory/12 h-12 w-full sm:w-auto"
            >
              <Link href={landingCta.compatibility.href}>{landingCta.compatibility.label}</Link>
            </Button>
          </div>

          <ul className="text-ivory/55 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[11px] tracking-[0.14em] uppercase">
            <li>Mutual interest</li>
            <li>Private charts</li>
            <li>Engine calculated</li>
          </ul>
        </div>

        <aside
          className="border-ivory/15 w-full max-w-sm justify-self-end rounded-2xl border bg-[#14110E]/70 p-5 text-[#F7F1E3] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6"
          aria-label="How VedaMilan begins"
        >
          <p className="text-ivory/50 text-[10px] tracking-[0.18em] uppercase">
            Understanding first
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[editorial.you.src, editorial.partner.src].map((src) => (
                <span
                  key={src}
                  className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#14110E]"
                >
                  <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-sm">A match is a beginning. Compatibility is the conversation.</p>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            {[
              ["Interested", "Private until mutual"],
              ["Charts", "Engine, not invention"],
              ["Guidance", "Calm, not a verdict"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between border-t border-white/10 pt-2"
              >
                <dt className="text-ivory/65">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

const COLUMNS = [
  {
    title: "Explore",
    items: [
      { title: "Discover", href: "/#discover" },
      { title: "How it works", href: "/#how" },
      { title: "Compatibility", href: "/#compatibility" },
      { title: "Vedic intelligence", href: "/#vedic" },
      { title: "Membership", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    items: [
      { title: "About", href: routes.about },
      { title: "Contact", href: routes.contact },
      { title: "Blog", href: routes.blog },
      { title: "FAQ", href: routes.faq },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy", href: routes.privacy },
      { title: "Terms", href: routes.terms },
      { title: "Cookies", href: routes.cookies },
      { title: "Help", href: routes.help },
    ],
  },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0c0a08] pb-[env(safe-area-inset-bottom,0px)] text-[#F7F1E3]">
      <p
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-8 left-0 hidden text-[18vw] leading-none text-white/[0.035] select-none lg:block"
      >
        VedaMilan
      </p>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)] lg:gap-16">
          <div>
            <BrandLogo href={routes.home} size="md" className="[&_span]:text-ivory" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#F7F1E3]/70">
              Modern matchmaking. Vedic compatibility. Guidance you can sit with.
            </p>
            <a
              className="mt-5 inline-block text-sm text-[#F7F1E3]/65 transition-colors hover:text-[#D4AF37]"
              href={`mailto:${brand.supportEmail}`}
            >
              {brand.supportEmail}
            </a>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] tracking-[0.16em] uppercase">
              {Object.entries(brand.social).map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  className="text-[#F7F1E3]/55 transition-colors hover:text-[#D4AF37]"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {key}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#F7F1E3]/45 uppercase">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.items.map((item) => (
                    <li key={item.title}>
                      <LocaleLink
                        href={item.href}
                        className="text-sm text-[#F7F1E3]/75 transition-colors hover:text-[#F7F1E3]"
                      >
                        {item.title}
                      </LocaleLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:flex-row sm:items-center sm:px-6 sm:pb-5 lg:px-8">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#F7F1E3]/45">
              © {year} {brand.legalName}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle className="text-ivory hover:bg-ivory/10 hover:text-ivory" />
            <LanguageSelector
              compact
              variant="ghost"
              className="text-ivory hover:bg-ivory/10 hover:text-ivory"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
