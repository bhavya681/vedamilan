import { brand } from "@/lib/constants/brand";

export const siteConfig = {
  name: brand.name,
  tagline: brand.tagline,
  description: brand.description,
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-default.svg",
  locale: "en_IN",
  links: brand.social,
  supportEmail: brand.supportEmail,
} as const;

export type SiteConfig = typeof siteConfig;
