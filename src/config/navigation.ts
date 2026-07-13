import { routes } from "@/lib/constants/routes";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
  group?: string;
};

export const mainNav: NavItem[] = [
  { title: "Product", href: "/#features", description: "Platform capabilities" },
  { title: "Compatibility", href: "/#compatibility", description: "Guna Milan & AI" },
  { title: "Pricing", href: routes.pricing, description: "Membership plans" },
  { title: "Stories", href: "/#stories", description: "Success stories" },
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

export const dashboardNav: NavItem[] = [
  { title: "Overview", href: routes.dashboard, group: "Home" },
  { title: "Matches", href: routes.matches, group: "Discover" },
  { title: "Search", href: routes.search, group: "Discover" },
  { title: "Shortlisted", href: routes.shortlisted, group: "Discover" },
  { title: "Kundli", href: routes.kundli, group: "Vedic" },
  { title: "Horoscope", href: routes.horoscope, group: "Vedic" },
  { title: "Compatibility", href: routes.compatibility, group: "Vedic" },
  { title: "AI Insights", href: routes.aiInsights, group: "Intelligence" },
  { title: "Messages", href: routes.chat, group: "Connect" },
  { title: "Consultation", href: routes.consultation, group: "Connect" },
  { title: "Premium", href: routes.premium, group: "Account" },
  { title: "Reports", href: routes.reports, group: "Account" },
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
