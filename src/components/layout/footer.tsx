import Link from "next/link";

import { footerNav } from "@/config/navigation";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/40 bg-navy text-ivory border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="md:col-span-2 lg:col-span-1">
          <Link href={routes.home} className="font-display text-brand-dual text-2xl">
            {brand.name}
          </Link>
          <p className="text-ivory/70 mt-4 max-w-sm text-sm leading-relaxed">{brand.tagline}</p>
          <p className="text-ivory/60 mt-4 text-sm">
            <a className="hover:text-ivory" href={`mailto:${brand.supportEmail}`}>
              {brand.supportEmail}
            </a>
          </p>
          <div className="text-ivory/65 mt-6 flex flex-wrap gap-3 text-xs">
            {Object.entries(brand.social).map(([key, href]) => (
              <a
                key={key}
                href={href}
                className="border-ivory/20 hover:border-gold/40 hover:text-gold rounded-full border px-3 py-1 capitalize transition-colors"
                rel="noopener noreferrer"
                target="_blank"
              >
                {key}
              </a>
            ))}
          </div>
        </div>

        {Object.entries(footerNav).map(([section, items]) => (
          <div key={section}>
            <h2 className="text-gold text-sm font-semibold tracking-[0.16em] uppercase">
              {section}
            </h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-ivory/75 hover:text-ivory text-sm transition-colors"
                    {...(item.external ? { rel: "noopener noreferrer" } : {})}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-ivory/10 text-ivory/50 border-t px-4 py-6 text-center text-xs sm:px-6 lg:px-8">
        © {year} {brand.legalName}. Crafted with calm intention.
      </div>
    </footer>
  );
}
