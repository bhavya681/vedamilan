import { routes } from "@/lib/constants/routes";

/** href → navigation.* translation key */
export const NAV_HREF_KEYS: Record<string, string> = {
  [routes.dashboard]: "navigation.home",
  [routes.astrology]: "navigation.astrologyHome",
  [routes.matrimony]: "navigation.matrimonyHome",
  [routes.vedicWisdom]: "navigation.rishiSageHome",
  [routes.kundli]: "navigation.myKundli",
  [routes.grahaKatha]: "navigation.grahaKatha",
  [routes.dasha]: "navigation.dashas",
  [routes.divisionalCharts]: "navigation.charts",
  [routes.ashtakavarga]: "navigation.ashtakavarga",
  [routes.natalProfile]: "navigation.varnaGana",
  [routes.rajaYogas]: "navigation.rajaYogas",
  [routes.yogas]: "navigation.yogasDoshas",
  [routes.lalKitab]: "navigation.lalKitab",
  [routes.predictions]: "navigation.predictions",
  [routes.gochar]: "navigation.gochar",
  [routes.horoscope]: "navigation.horoscope",
  [routes.calendar]: "navigation.calendar",
  [routes.aiInsights]: "navigation.aiInsights",
  [routes.askTheSages]: "navigation.askTheSages",
  [routes.wisdomJournal]: "navigation.wisdomJournal",
  [routes.birthDetails]: "navigation.birthDetails",
  [routes.matches]: "navigation.matches",
  [routes.search]: "navigation.search",
  [routes.connections]: "navigation.connections",
  [routes.yourConnection]: "navigation.yourConnection",
  [routes.chat]: "navigation.messages",
  [routes.shortlisted]: "navigation.shortlisted",
  [routes.compatibility]: "navigation.compatibility",
  [routes.profile]: "navigation.profile",
  [routes.premium]: "navigation.premium",
  [routes.consultation]: "navigation.consultation",
  [routes.notifications]: "navigation.notifications",
  [routes.settings]: "navigation.settings",
  [routes.languageRegion]: "navigation.languageRegion",
  [routes.pricing]: "navigation.pricing",
  [routes.faq]: "navigation.faq",
  [routes.about]: "navigation.about",
  [routes.blog]: "navigation.blog",
  [routes.contact]: "navigation.contact",
  [routes.help]: "navigation.help",
  [routes.privacy]: "navigation.privacy",
  [routes.terms]: "navigation.terms",
  [routes.cookies]: "navigation.cookies",
  [routes.admin]: "navigation.adminOverview",
  [routes.adminUsers]: "navigation.adminUsers",
  [routes.adminReports]: "navigation.adminReports",
  [routes.adminPayments]: "navigation.adminPayments",
  [routes.adminAi]: "navigation.adminAi",
  [routes.adminAnalytics]: "navigation.adminAnalytics",
  [routes.adminCms]: "navigation.adminCms",
};

export const NAV_GROUP_KEYS: Record<string, string> = {
  Main: "navigation.groupMain",
  Astrology: "navigation.groupAstrology",
  Discover: "navigation.groupDiscover",
  Connect: "navigation.groupConnect",
  Shared: "navigation.groupShared",
  Wisdom: "navigation.groupWisdom",
  Account: "navigation.groupAccount",
  Menu: "navigation.groupMenu",
  Product: "navigation.product",
  Company: "navigation.company",
  Legal: "navigation.legal",
};

export function navTitleKey(href: string, fallbackTitle?: string): string {
  return NAV_HREF_KEYS[href] || (fallbackTitle ? fallbackTitle : "navigation.home");
}

export function navGroupKey(group: string): string {
  return NAV_GROUP_KEYS[group] || "navigation.groupMenu";
}
