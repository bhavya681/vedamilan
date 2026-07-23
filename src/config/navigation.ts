import { routes } from "@/lib/constants/routes";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
  group?: string;
};

/** Keep landing nav short — product-first, like top matrimony apps */
export const mainNav: NavItem[] = [
  { title: "How it works", href: "/#features", description: "Platform capabilities" },
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

/** Primary: people & connection. Secondary: Vedic depth & account. */
export const dashboardNav: NavItem[] = [
  { title: "Home", href: routes.dashboard, group: "Main" },
  { title: "Matches", href: routes.matches, group: "Main" },
  { title: "Connections", href: routes.connections, group: "Main" },
  { title: "Messages", href: routes.chat, group: "Main" },
  { title: "My Kundli", href: routes.kundli, group: "Main" },
  { title: "Search", href: routes.search, group: "Discover" },
  { title: "Compatibility", href: routes.compatibility, group: "Discover" },
  { title: "Horoscope", href: routes.horoscope, group: "Discover" },
  { title: "Calendar", href: routes.calendar, group: "Discover" },
  { title: "My profile", href: routes.profile, group: "Account" },
  { title: "Shortlist", href: routes.shortlisted, group: "Account" },
  { title: "Premium", href: routes.premium, group: "Account" },
  { title: "Consultation", href: routes.consultation, group: "Account" },
  { title: "Notifications", href: routes.notifications, group: "Account" },
  { title: "Settings", href: routes.settings, group: "Account" },
];

export const adminNav: NavItem[] = [
  { title: "Overview", href: routes.admin },
  { title: "Users", href: routes.adminUsers },
  { title: "Reports", href: routes.adminReports },
  { title: "Payments", href: routes.adminPayments },
  { title: "AI Usage", href: routes.adminAi },
  { title: "Analytics", href: routes.adminAnalytics },
  { title: "CMS", href: routes.adminCms },
];
