import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_Devanagari, Plus_Jakarta_Sans } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/config/site";
import { getMessages } from "@/lib/i18n/get-messages";
import { APP_LOCALES, getLocaleMeta, type AppLocale } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { withLocalePrefix } from "@/lib/i18n/path";

import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Required for Sanskrit / Hindi / Marathi UI — Latin-only body fonts omit Devanagari glyphs. */
const indic = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-indic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const DEVANAGARI_LOCALES = new Set<AppLocale>(["sa", "hi", "mr"]);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const messages = await getMessages(locale);
  const title =
    typeof messages.marketing.seoTitle === "string"
      ? messages.marketing.seoTitle
      : `${siteConfig.name} · ${siteConfig.tagline}`;
  const description =
    typeof messages.marketing.seoDescription === "string"
      ? messages.marketing.seoDescription
      : siteConfig.description;

  const languages = Object.fromEntries(
    APP_LOCALES.map((code) => [code, `${siteConfig.url}${withLocalePrefix(code, "/")}`]),
  ) as Record<string, string>;
  languages["x-default"] = `${siteConfig.url}${withLocalePrefix("en", "/")}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s · ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    icons: {
      icon: [{ url: "/brand/favicon.png", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    keywords: [
      "VedaMilan AI",
      "Vedic matchmaking",
      "AI kundli",
      "guna milan",
      "marriage timing",
      "relationship intelligence",
      "horoscope compatibility",
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: `${siteConfig.url}${withLocalePrefix(locale, "/")}`,
      title: siteConfig.name,
      description,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description,
      images: [siteConfig.ogImage],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}${withLocalePrefix(locale, "/")}`,
      languages,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const messages = await getMessages(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description:
      typeof messages.marketing.seoDescription === "string"
        ? messages.marketing.seoDescription
        : siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: meta.bcp47,
    offers: { "@type": "Offer", price: "999", priceCurrency: "INR" },
  };

  return (
    <html
      lang={meta.bcp47}
      dir={meta.dir}
      suppressHydrationWarning
      data-locale={locale}
      data-script={DEVANAGARI_LOCALES.has(locale) ? "devanagari" : "latin"}
      className={`${display.variable} ${body.variable} ${indic.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem("vedamilan.appearance.v1");if(!r)return;var p=JSON.parse(r);var d=document.documentElement;if(p.theme)d.setAttribute("data-theme",p.theme);if(p.expression)d.setAttribute("data-expression",p.expression);if(p.borderIntensity)d.setAttribute("data-border",p.borderIntensity);if(p.accentOverride)d.setAttribute("data-accent",p.accentOverride);if(p.reducedMotion)d.setAttribute("data-reduced-motion","true");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
