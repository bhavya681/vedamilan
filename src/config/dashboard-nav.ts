import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Baby,
  CalendarClock,
  CalendarRange,
  Compass,
  Crown,
  Grid3X3,
  Heart,
  HeartHandshake,
  Home,
  Hourglass,
  Link2,
  ListChecks,
  MessageCircle,
  MoonStar,
  Orbit,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Stars,
  SunMedium,
  UserRound,
  Users,
  Bookmark,
  BookOpen,
  ScrollText,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";

/** Icons for dashboard navigation — keyed by href for sidebar / sheets. */
export const dashboardNavIcons: Record<string, LucideIcon> = {
  [routes.dashboard]: Home,
  [routes.astrology]: Stars,
  [routes.matrimony]: Heart,
  [routes.matches]: Heart,
  [routes.connections]: Link2,
  [routes.yourConnection]: HeartHandshake,
  [routes.chat]: MessageCircle,
  [routes.kundli]: Stars,
  [routes.grahaKatha]: ScrollText,
  [routes.dasha]: Hourglass,
  [routes.search]: Search,
  [routes.compatibility]: Compass,
  [routes.situationalAlignment]: ListChecks,
  [routes.preferences]: SlidersHorizontal,
  [routes.horoscope]: SunMedium,
  [routes.gochar]: Orbit,
  [routes.predictions]: Sparkles,
  [routes.lalKitab]: BookOpen,
  [routes.yogas]: MoonStar,
  [routes.rajaYogas]: Crown,
  [routes.natalProfile]: UserRound,
  [routes.divisionalCharts]: Grid3X3,
  [routes.ashtakavarga]: CalendarClock,
  [routes.calendar]: CalendarRange,
  [routes.aiInsights]: MessageCircle,
  [routes.vedicWisdom]: BookOpen,
  [routes.askTheSages]: Users,
  [routes.wisdomJournal]: Bookmark,
  [routes.birthDetails]: Baby,
  [routes.profile]: UserRound,
  [routes.shortlisted]: Bookmark,
  [routes.premium]: Crown,
  [routes.consultation]: Users,
  [routes.notifications]: Bell,
  [routes.settings]: Settings,
};

/** Kundli sub-routes that have their own sidebar entries — parent “My Kundli” stays inactive on these. */
const KUNDLI_NAV_CHILDREN = [
  routes.grahaKatha,
  routes.dasha,
  routes.divisionalCharts,
  routes.ashtakavarga,
  routes.natalProfile,
  routes.rajaYogas,
  routes.yogas,
  routes.gochar,
] as const;

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isDashboardNavActive(pathname: string, href: string) {
  if (pathname === href) return true;

  // Mode / hub homes: exact match only (already handled above).
  if (
    href === routes.dashboard ||
    href === routes.astrology ||
    href === routes.matrimony ||
    href === routes.vedicWisdom
  ) {
    return false;
  }

  // My Kundli: active on the hub itself, or on kundli pages that are not separate nav tabs.
  if (href === routes.kundli) {
    if (!pathname.startsWith(`${routes.kundli}/`)) return false;
    return !KUNDLI_NAV_CHILDREN.some((child) => matchesPath(pathname, child));
  }

  if (href === routes.matches) return matchesPath(pathname, routes.matches);
  if (href === routes.chat) {
    return matchesPath(pathname, routes.chat) || matchesPath(pathname, routes.messages);
  }
  if (href === routes.aiInsights) return matchesPath(pathname, routes.aiInsights);
  if (href === routes.compatibility) return matchesPath(pathname, routes.compatibility);
  if (href === routes.settings) return matchesPath(pathname, routes.settings);
  if (href === routes.profile) return matchesPath(pathname, routes.profile);
  if (href === routes.consultation) return matchesPath(pathname, routes.consultation);
  if (href === routes.search) return matchesPath(pathname, routes.search);
  if (href === routes.premium) return matchesPath(pathname, routes.premium);
  if (href === routes.askTheSages) return matchesPath(pathname, routes.askTheSages);
  if (href === routes.wisdomJournal) return matchesPath(pathname, routes.wisdomJournal);

  // Partner preferences vs Situational quiz share a path prefix — keep tabs exclusive.
  if (href === routes.preferences) {
    return pathname === routes.preferences;
  }
  if (href === routes.situationalAlignment) {
    return matchesPath(pathname, routes.situationalAlignment);
  }
  if (href === routes.grahaKatha) {
    return matchesPath(pathname, routes.grahaKatha);
  }

  // Default: require a path segment boundary so /kundli does not match /kundli/dasha via bare prefix.
  return pathname.startsWith(`${href}/`);
}
