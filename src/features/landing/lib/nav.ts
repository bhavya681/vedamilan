import { routes } from "@/lib/constants/routes";

export const landingNav = [
  { title: "Experiences", href: "/#experiences" },
  { title: "Kundli", href: "/#vedic" },
  { title: "AI Guru", href: "/#gurus" },
  { title: "Compatibility", href: "/#compatibility" },
] as const;

export const landingCta = {
  explore: { href: "/#experiences", label: "Explore KUNDLIV" },
  getStarted: { href: routes.register, label: "Get Started" },
  kundli: { href: routes.kundli, label: "Open your kundli" },
  guru: { href: routes.askTheSages, label: "Ask the Sages" },
  compatibility: { href: routes.compatibility, label: "Explore Compatibility" },
  login: { href: routes.login, label: "Log in" },
} as const;
