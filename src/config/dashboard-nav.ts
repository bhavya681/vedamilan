import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  Compass,
  Crown,
  Heart,
  Home,
  Link2,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Stars,
  UserRound,
  Users,
  Bookmark,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";

/** Icons for dashboard navigation — keyed by href for sidebar / sheets. */
export const dashboardNavIcons: Record<string, LucideIcon> = {
  [routes.dashboard]: Home,
  [routes.matches]: Heart,
  [routes.connections]: Link2,
  [routes.chat]: MessageCircle,
  [routes.kundli]: Stars,
  [routes.search]: Search,
  [routes.compatibility]: Compass,
  [routes.horoscope]: Sparkles,
  [routes.calendar]: CalendarDays,
  [routes.profile]: UserRound,
  [routes.shortlisted]: Bookmark,
  [routes.premium]: Crown,
  [routes.consultation]: Users,
  [routes.notifications]: Bell,
  [routes.settings]: Settings,
};

export function isDashboardNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === routes.dashboard) return false;
  if (href === routes.matches && pathname.startsWith(routes.matches)) return true;
  if (
    href === routes.chat &&
    (pathname.startsWith(routes.chat) || pathname.startsWith(routes.messages))
  ) {
    return true;
  }
  return pathname.startsWith(`${href}/`) || pathname.startsWith(href);
}
