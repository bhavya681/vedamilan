"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { LocaleLink } from "@/components/i18n/locale-navigation";
import { useT } from "@/components/i18n/i18n-provider";
import { footerNav } from "@/config/navigation";
import { brand } from "@/lib/constants/brand";
import { navTitleKey } from "@/lib/i18n/nav-labels";
import { routes } from "@/lib/constants/routes";

function footerItemLabel(t: (k: string) => string, href: string, title: string) {
  if (href === "/#features") return t("navigation.aiMatchmaking");
  return t(navTitleKey(href, title));
}

export function Footer() {
  const year = new Date().getFullYear();
  const t = useT();

  return (
    <footer className="border-border/40 bg-navy text-ivory border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="md:col-span-2 lg:col-span-1">
          <BrandLogo href={routes.home} size="md" className="[&_span]:text-ivory" />
          <p className="text-ivory/70 mt-4 max-w-sm text-sm leading-relaxed">
            {t("marketing.tagline")}
          </p>
          <p className="text-ivory/60 mt-4 text-sm">
            <a className="hover:text-ivory" href={`mailto:${brand.supportEmail}`}>
              {brand.supportEmail}
            </a>
          </p>
          <div className="mt-6">
            <p className="text-ivory/70 mb-2 text-xs tracking-[0.14em] uppercase">
              {t("marketing.chooseLanguage")}
            </p>
            <LanguageSelector
              variant="secondary"
              className="bg-ivory/10 text-ivory border-ivory/20"
            />
          </div>
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
              {section === "Product"
                ? t("navigation.product")
                : section === "Company"
                  ? t("navigation.company")
                  : t("navigation.legal")}
            </h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.title}>
                  <LocaleLink
                    href={item.href}
                    className="text-ivory/75 hover:text-ivory text-sm transition-colors"
                    {...(item.external ? { rel: "noopener noreferrer" } : {})}
                  >
                    {footerItemLabel(t, item.href, item.title)}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-ivory/10 text-ivory/50 border-t px-4 py-6 text-center text-xs sm:px-6 lg:px-8">
        © {year} {brand.legalName}. {t("marketing.footerRights")}
      </div>
    </footer>
  );
}
