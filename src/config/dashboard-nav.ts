import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  BotMessageSquare,
  BrainCircuit,
  Cake,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Clock,
  Compass,
  Crown,
  Eclipse,
  Flame,
  Gauge,
  GitBranch,
  GitCompare,
  Hash,
  Headphones,
  Heart,
  HeartHandshake,
  Home,
  Hourglass,
  IdCard,
  LayoutDashboard,
  LayoutGrid,
  Library,
  MessageCircle,
  MessagesSquare,
  MoonStar,
  NotebookPen,
  Orbit,
  PieChart,
  Scale,
  ScanHeart,
  ScrollText,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stars,
  Sunrise,
  Table2,
  Telescope,
  UserRound,
  UsersRound,
  Waypoints,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";

/**
 * Sidebar / sheet icons — one unique Lucide glyph per destination.
 * Same feature on two routes (e.g. Gochar) may share an icon; different tabs never do.
 */
export const dashboardNavIcons: Record<string, LucideIcon> = {
  [routes.dashboard]: LayoutDashboard,
  [routes.astrology]: Stars,
  [routes.matrimony]: Home,
  [routes.vedicWisdom]: Library,

  [routes.horoscope]: Sunrise,
  [routes.astrologyPanchanga]: CalendarDays,
  [routes.astrologyNorthHorizon]: Eclipse,
  [routes.calendar]: CalendarRange,
  [routes.gochar]: Orbit,
  [routes.astrologyGochar]: Orbit,

  [routes.kundli]: PieChart,
  [routes.dasha]: Hourglass,
  [routes.astrologyDasha]: Hourglass,
  [routes.divisionalCharts]: LayoutGrid,
  [routes.astrologyDivisionalCharts]: LayoutGrid,
  [routes.predictions]: Telescope,
  [routes.astrologyYogas]: Sparkles,
  [routes.astrologyNakshatra]: MoonStar,

  [routes.astrologyPlanetStrength]: Gauge,
  [routes.astrologyShadbala]: Scale,
  [routes.astrologyAshtakavarga]: Table2,
  [routes.astrologyJaimini]: Waypoints,
  [routes.astrologyBnn]: GitBranch,
  [routes.astrologyMarriageIntelligence]: ScanHeart,
  [routes.natalProfile]: IdCard,
  [routes.astrologyChartComparison]: GitCompare,

  [routes.aiInsights]: BrainCircuit,
  [routes.consultation]: Headphones,
  [routes.astrologyMuhurta]: Clock,
  [routes.lalKitab]: BookOpen,
  [routes.grahaKatha]: ScrollText,
  [routes.numerology]: Hash,
  [routes.birthDetails]: Cake,
  [routes.astrologySpiritualJourney]: Flame,

  [routes.matches]: Heart,
  [routes.search]: Search,
  [routes.compatibility]: Compass,
  [routes.marriageGuru]: BotMessageSquare,
  [routes.preferences]: SlidersHorizontal,
  [routes.situationalAlignment]: ClipboardCheck,
  [routes.chat]: MessageCircle,
  [routes.connections]: UsersRound,
  [routes.shortlisted]: Star,
  [routes.yourConnection]: HeartHandshake,

  [routes.askTheSages]: MessagesSquare,
  [routes.wisdomJournal]: NotebookPen,

  [routes.profile]: UserRound,
  [routes.notifications]: Bell,
  [routes.premium]: Crown,
  [routes.settings]: Settings,
};

/** Kundli sub-routes that have their own sidebar entries — parent “My Kundli” stays inactive on these. */
const KUNDLI_NAV_CHILDREN = [
  routes.grahaKatha,
  routes.dasha,
  routes.divisionalCharts,
  routes.astrologyAshtakavarga,
  routes.natalProfile,
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
  if (href === routes.numerology) return matchesPath(pathname, routes.numerology);
  if (href === routes.astrologyYogas) return matchesPath(pathname, routes.astrologyYogas);
  if (href === routes.astrologyNakshatra) return matchesPath(pathname, routes.astrologyNakshatra);
  if (href === routes.astrologyDasha) return matchesPath(pathname, routes.astrologyDasha);
  if (href === routes.astrologyDivisionalCharts)
    return matchesPath(pathname, routes.astrologyDivisionalCharts);
  if (href === routes.astrologyMuhurta) return matchesPath(pathname, routes.astrologyMuhurta);
  if (href === routes.astrologyRemedies) return matchesPath(pathname, routes.astrologyRemedies);
  if (href === routes.astrologySpiritualJourney)
    return matchesPath(pathname, routes.astrologySpiritualJourney);
  if (href === routes.astrologyPanchanga) return matchesPath(pathname, routes.astrologyPanchanga);
  if (href === routes.astrologyNorthHorizon)
    return matchesPath(pathname, routes.astrologyNorthHorizon);
  if (href === routes.astrologyPlanetStrength)
    return matchesPath(pathname, routes.astrologyPlanetStrength);
  if (href === routes.astrologyShadbala) return matchesPath(pathname, routes.astrologyShadbala);
  if (href === routes.astrologyJaimini) return matchesPath(pathname, routes.astrologyJaimini);
  if (href === routes.astrologyBnn) return matchesPath(pathname, routes.astrologyBnn);
  if (href === routes.astrologyMarriageIntelligence)
    return matchesPath(pathname, routes.astrologyMarriageIntelligence);
  if (href === routes.astrologyChartComparison)
    return matchesPath(pathname, routes.astrologyChartComparison);
  if (href === routes.astrologyAshtakavarga)
    return matchesPath(pathname, routes.astrologyAshtakavarga);
  if (href === routes.astrologyGochar) return matchesPath(pathname, routes.astrologyGochar);

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
