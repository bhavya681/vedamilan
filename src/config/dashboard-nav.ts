import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  Compass,
  Crown,
  Heart,
  HeartHandshake,
  Home,
  Link2,
  MessageCircle,
  Search,
  Settings,
  Stars,
  UserRound,
  Users,
  Bookmark,
  BookOpen,
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
  [routes.search]: Search,
  [routes.compatibility]: Compass,
  [routes.horoscope]: CalendarDays,
  [routes.gochar]: Compass,
  [routes.predictions]: CalendarDays,
  [routes.lalKitab]: BookOpen,
  [routes.yogas]: Stars,
  [routes.rajaYogas]: Crown,
  [routes.natalProfile]: UserRound,
  [routes.divisionalCharts]: Compass,
  [routes.ashtakavarga]: CalendarDays,
  [routes.calendar]: CalendarDays,
  [routes.aiInsights]: MessageCircle,
  [routes.vedicWisdom]: BookOpen,
  [routes.askTheSages]: Users,
  [routes.wisdomJournal]: Bookmark,
  [routes.birthDetails]: CalendarDays,
  [routes.profile]: UserRound,
  [routes.shortlisted]: Bookmark,
  [routes.premium]: Crown,
  [routes.consultation]: Users,
  [routes.notifications]: Bell,
  [routes.settings]: Settings,
};

export function isDashboardNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === routes.dashboard || href === routes.astrology || href === routes.matrimony) {
    return pathname === href;
  }
  if (href === routes.matches && pathname.startsWith(routes.matches)) return true;
  if (
    href === routes.chat &&
    (pathname.startsWith(routes.chat) || pathname.startsWith(routes.messages))
  ) {
    return true;
  }
  if (href === routes.aiInsights && pathname.startsWith(routes.aiInsights)) return true;
  if (href === routes.vedicWisdom && pathname.startsWith(routes.vedicWisdom)) return true;
  if (href === routes.rajaYogas && pathname.startsWith(routes.rajaYogas)) return true;
  if (href === routes.yogas && pathname === routes.yogas) return true;
  return pathname.startsWith(`${href}/`) || pathname.startsWith(href);
}
