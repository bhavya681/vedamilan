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
 * Shared items (no `modes`) appear in every mode.
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
  {
    title: "Rishi Sage home",
    href: routes.vedicWisdom,
    group: "Main",
    modes: ["wisdom"],
  },
  { title: "Horoscope", href: routes.horoscope, group: "Today", modes: ["astrology"] },
  { title: "Panchanga", href: routes.astrologyPanchanga, group: "Today", modes: ["astrology"] },
  { title: "Calendar", href: routes.calendar, group: "Today", modes: ["astrology"] },
  { title: "Gochar", href: routes.astrologyGochar, group: "Today", modes: ["astrology"] },

  { title: "My Kundli", href: routes.kundli, group: "Chart", modes: ["astrology"] },
  { title: "Dashas", href: routes.astrologyDasha, group: "Chart", modes: ["astrology"] },
  {
    title: "Charts",
    href: routes.astrologyDivisionalCharts,
    group: "Chart",
    modes: ["astrology"],
  },
  { title: "Predictions", href: routes.predictions, group: "Chart", modes: ["astrology"] },
  { title: "Yogas", href: routes.astrologyYogas, group: "Chart", modes: ["astrology"] },
  { title: "Nakshatra", href: routes.astrologyNakshatra, group: "Chart", modes: ["astrology"] },

  {
    title: "Planet Strength",
    href: routes.astrologyPlanetStrength,
    group: "Analysis",
    modes: ["astrology"],
  },
  {
    title: "Shadbala",
    href: routes.astrologyShadbala,
    group: "Analysis",
    modes: ["astrology"],
  },
  {
    title: "Ashtakavarga",
    href: routes.astrologyAshtakavarga,
    group: "Analysis",
    modes: ["astrology"],
  },
  {
    title: "Jaimini Karakas",
    href: routes.astrologyJaimini,
    group: "Analysis",
    modes: ["astrology"],
  },
  {
    title: "BNN",
    href: routes.astrologyBnn,
    group: "Analysis",
    modes: ["astrology"],
  },
  {
    title: "Marriage Intelligence",
    href: routes.astrologyMarriageIntelligence,
    group: "Analysis",
    modes: ["astrology"],
  },
  { title: "Varna & Gana", href: routes.natalProfile, group: "Analysis", modes: ["astrology"] },

  { title: "AI Guru", href: routes.aiInsights, group: "Guidance", modes: ["astrology"] },
  {
    title: "Consultation",
    href: routes.consultation,
    group: "Guidance",
    modes: ["astrology"],
  },
  { title: "Muhurta", href: routes.astrologyMuhurta, group: "Guidance", modes: ["astrology"] },
  { title: "Lal Kitab", href: routes.lalKitab, group: "Guidance", modes: ["astrology"] },
  {
    title: "Graha Katha",
    href: routes.grahaKatha,
    group: "Guidance",
    modes: ["astrology"],
  },
  {
    title: "Numerology",
    href: routes.numerology,
    group: "Guidance",
    modes: ["astrology"],
  },
  { title: "Birth details", href: routes.birthDetails, group: "Guidance", modes: ["astrology"] },

  { title: "Matches", href: routes.matches, group: "Discover", modes: ["matrimony"] },
  { title: "Search", href: routes.search, group: "Discover", modes: ["matrimony"] },
  { title: "Compatibility", href: routes.compatibility, group: "Discover", modes: ["matrimony"] },
  {
    title: "Marriage AI Guru",
    href: routes.marriageGuru,
    group: "Discover",
    modes: ["matrimony"],
  },
  {
    title: "Partner preferences",
    href: routes.preferences,
    group: "Discover",
    modes: ["matrimony"],
  },
  {
    title: "Situational quiz",
    href: routes.situationalAlignment,
    group: "Discover",
    modes: ["matrimony"],
  },

  { title: "Messages", href: routes.chat, group: "Connect", modes: ["matrimony"] },
  { title: "Connections", href: routes.connections, group: "Connect", modes: ["matrimony"] },
  { title: "Shortlist", href: routes.shortlisted, group: "Connect", modes: ["matrimony"] },
  { title: "Your Connection", href: routes.yourConnection, group: "Connect", modes: ["matrimony"] },

  { title: "Ask the Sages", href: routes.askTheSages, group: "Wisdom", modes: ["wisdom"] },
  { title: "Wisdom Journal", href: routes.wisdomJournal, group: "Wisdom", modes: ["wisdom"] },

  { title: "My profile", href: routes.profile, group: "Account" },
  { title: "Notifications", href: routes.notifications, group: "Account" },
  { title: "Premium", href: routes.premium, group: "Account" },
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
