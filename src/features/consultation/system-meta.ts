import {
  CalendarRange,
  CircleHelp,
  Clock3,
  Compass,
  Flame,
  GitBranch,
  Globe2,
  LayoutGrid,
  Network,
  Orbit,
  RefreshCw,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { AstrologerSystem } from "@/domain/consultation/virtual-astrologers";

export const ASTROLOGER_SYSTEM_META: Record<
  AstrologerSystem,
  { label: string; shortLabel: string; icon: LucideIcon }
> = {
  parashara: { label: "Parashara", shortLabel: "Parashara", icon: Orbit },
  jaimini: { label: "Jaimini", shortLabel: "Jaimini", icon: GitBranch },
  kp: { label: "Krishnamurti Paddhati", shortLabel: "KP", icon: Clock3 },
  nadi: { label: "Nadi", shortLabel: "Nadi", icon: Waves },
  bnn: { label: "Bhrigu Nandi Nadi", shortLabel: "BNN", icon: Network },
  "lal-kitab": { label: "Lal Kitab", shortLabel: "Lal Kitab", icon: Flame },
  tajika: { label: "Tajika / Varshaphala", shortLabel: "Tajika", icon: CalendarRange },
  gochar: { label: "Gochar transits", shortLabel: "Gochar", icon: RefreshCw },
  prashna: { label: "Prashna", shortLabel: "Prashna", icon: CircleHelp },
  remedies: { label: "Remedies", shortLabel: "Remedies", icon: Sparkles },
  chinese: { label: "Chinese astrology", shortLabel: "Chinese", icon: Compass },
  western: { label: "Western astrology", shortLabel: "Western", icon: Globe2 },
};

export const ASTROLOGER_FILTERS: Array<{
  id: "all" | AstrologerSystem;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "all", label: "All traditions", icon: LayoutGrid },
  ...Object.entries(ASTROLOGER_SYSTEM_META).map(([id, meta]) => ({
    id: id as AstrologerSystem,
    label: meta.shortLabel,
    icon: meta.icon,
  })),
];
