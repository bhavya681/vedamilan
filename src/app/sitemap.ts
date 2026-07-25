import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { APP_LOCALES } from "@/lib/i18n/locales";
import { withLocalePrefix } from "@/lib/i18n/path";
import { routes } from "@/lib/constants/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const publicPaths = [
    routes.home,
    routes.about,
    routes.pricing,
    routes.blog,
    routes.faq,
    routes.contact,
    routes.help,
    routes.support,
    routes.terms,
    routes.privacy,
    routes.cookies,
    routes.login,
    routes.register,
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of publicPaths) {
    for (const locale of APP_LOCALES) {
      const localized = withLocalePrefix(locale, path);
      const languages = Object.fromEntries(
        APP_LOCALES.map((code) => [code, `${base}${withLocalePrefix(code, path)}`]),
      ) as Record<string, string>;
      languages["x-default"] = `${base}${withLocalePrefix("en", path)}`;

      entries.push({
        url: `${base}${localized}`,
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
