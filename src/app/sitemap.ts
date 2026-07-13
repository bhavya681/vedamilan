import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
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

  return publicPaths.map((path, index) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
