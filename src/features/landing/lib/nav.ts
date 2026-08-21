import { routes } from "@/lib/constants/routes";

export const landingNav = [
  { title: "Discover", href: "/#discover" },
  { title: "How It Works", href: "/#how" },
  { title: "Compatibility", href: "/#compatibility" },
  { title: "Vedic Intelligence", href: "/#vedic" },
] as const;

export const landingCta = {
  match: { href: routes.register, label: "Find Your Match" },
  compatibility: { href: routes.compatibility, label: "Explore Compatibility" },
  login: { href: routes.login, label: "Log in" },
} as const;
