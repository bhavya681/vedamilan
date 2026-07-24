import { routes } from "@/lib/constants/routes";
import type { WorkspaceMode } from "@/lib/workspace/mode";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
  group?: string;
  /** Which workspace modes show this item. Omit = both (shared). */
  modes?: WorkspaceMode[];
};

/** Keep landing nav short — product-first, like top matrimony apps */
export const mainNav: NavItem[] = [
  { title: "How it works", href: "/#how", description: "Platform capabilities" },
  { title: "Compatibility", href: "/#compatibility", description: "Guna Milan & AI" },
  { title: "Pricing", href: routes.pricing, description: "Membership plans" },
  { title: "FAQ", href: routes.faq, description: "Common questions" },
];

export const footerNav: Record<string, NavItem[]> = {
  Product: [
    { title: "AI Matchmaking", href: "/#features" },
    { title: "Kundli", href: routes.kundli },
    { title: "Compatibility", href: routes.compatibility },
    { title: "Pricing", href: routes.pricing },
  ],
  Company: [
    { title: "About", href: routes.about },
    { title: "Blog", href: routes.blog },
    { title: "Contact", href: routes.contact },
    { title: "Help", href: routes.help },
  ],
  Legal: [
    { title: "Privacy", href: routes.privacy },
    { title: "Terms", href: routes.terms },
    { title: "Cookies", href: routes.cookies },
  ],
};

/**
 * Dashboard nav — filtered by workspace mode in shell components.
 * Shared items (no `modes`) appear in both Astrology and Matrimony.
 */
export const dashboardNav: NavItem[] = [
  {
    title: "Astrology home",
    href: routes.astrology,
    group: "Main",
    modes: ["astrology"],
  },
  {
    title: "Matrimony home",
    href: routes.matrimony,
    group: "Main",
    modes: ["matrimony"],
  },
  { title: "My Kundli", href: routes.kundli, group: "Astrology", modes: ["astrology"] },
  { title: "Charts", href: routes.divisionalCharts, group: "Astrology", modes: ["astrology"] },
  { title: "Ashtakavarga", href: routes.ashtakavarga, group: "Astrology", modes: ["astrology"] },
  { title: "Varna & Gana", href: routes.natalProfile, group: "Astrology", modes: ["astrology"] },
  { title: "Raja Yogas", href: routes.rajaYogas, group: "Astrology", modes: ["astrology"] },
  { title: "Yogas & Doshas", href: routes.yogas, group: "Astrology", modes: ["astrology"] },
  { title: "Lal Kitab", href: routes.lalKitab, group: "Astrology", modes: ["astrology"] },
  { title: "Predictions", href: routes.predictions, group: "Astrology", modes: ["astrology"] },
  { title: "Gochar", href: routes.gochar, group: "Astrology", modes: ["astrology"] },
  { title: "Horoscope", href: routes.horoscope, group: "Astrology", modes: ["astrology"] },
  { title: "Calendar", href: routes.calendar, group: "Astrology", modes: ["astrology"] },
  {
    title: "AI Guru",
    href: routes.aiInsights,
    group: "Astrology",
    modes: ["astrology"],
  },
  { title: "Birth details", href: routes.birthDetails, group: "Astrology", modes: ["astrology"] },

  { title: "Matches", href: routes.matches, group: "Discover", modes: ["matrimony"] },
  { title: "Search", href: routes.search, group: "Discover", modes: ["matrimony"] },
  { title: "Connections", href: routes.connections, group: "Connect", modes: ["matrimony"] },
  { title: "Messages", href: routes.chat, group: "Connect", modes: ["matrimony"] },
  { title: "Shortlist", href: routes.shortlisted, group: "Connect", modes: ["matrimony"] },

  { title: "Compatibility", href: routes.compatibility, group: "Discover", modes: ["matrimony"] },
  { title: "AI Guru", href: routes.aiInsights, group: "Shared", modes: ["matrimony"] },

  { title: "My profile", href: routes.profile, group: "Account" },
  { title: "Premium", href: routes.premium, group: "Account" },
  { title: "Consultation", href: routes.consultation, group: "Account" },
  { title: "Notifications", href: routes.notifications, group: "Account" },
  { title: "Settings", href: routes.settings, group: "Account" },
];

export function navForMode(mode: WorkspaceMode): NavItem[] {
  return dashboardNav.filter((item) => !item.modes || item.modes.includes(mode));
}

export function navGroupsForMode(mode: WorkspaceMode): string[] {
  return [...new Set(navForMode(mode).map((item) => item.group ?? "Menu"))];
}

export const adminNav: NavItem[] = [
  { title: "Overview", href: routes.admin },
  { title: "Users", href: routes.adminUsers },
  { title: "Reports", href: routes.adminReports },
  { title: "Payments", href: routes.adminPayments },
  { title: "AI Usage", href: routes.adminAi },
  { title: "Analytics", href: routes.adminAnalytics },
  { title: "CMS", href: routes.adminCms },
];
