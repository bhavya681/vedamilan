import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Scale,
  Gem,
  Sunrise,
  Sun,
  MoonStar,
  Coins,
  RefreshCw,
  Star,
  Heart,
  Sparkles,
  Shield,
  Wand,
  Zap,
  Award,
  Medal,
  Trophy,
  Diamond,
  BookOpen,
  Layers,
  Flower2,
  Infinity,
  Circle,
  Hexagon,
  Orbit,
  Network,
} from "lucide-react";

export type YogaCategory =
  | "RAJA_YOGA"
  | "DHARMA_KARMADHIPATI"
  | "GAJAKESARI"
  | "PANCHA_MAHAPURUSHA"
  | "NEECHA_BHANGA"
  | "BUDHADITYA"
  | "CHANDRA_MANGAL"
  | "DHANA_YOGA"
  | "VIPAREETA_RAJA"
  | "HARSHA"
  | "SARALA"
  | "VIMALA"
  | "RUCHAKA"
  | "BHADRA"
  | "HAMSA"
  | "MALAVYA"
  | "SHASHA"
  | "ADHI"
  | "SUNAPHA"
  | "ANAPHA"
  | "DURUDHARA"
  | "KEMADRUMA"
  | "VASI"
  | "VESI"
  | "UBHAYACHARI"
  | "SARASWATI"
  | "LAKSHMI"
  | "PARIVARTANA"
  | "AMALA"
  | "PUSHKALA"
  | "SHUBHA_KARTARI"
  | "PAPA_KARTARI"
  | "NABHASA_ASHRAYA"
  | "NABHASA_DALA"
  | "NABHASA_AKRITI"
  | "NABHASA_SANKHYA"
  | "NAKSHATRA_PARIVARTANA"
  | "NAKSHATRA_DISPOSITOR_STRENGTH"
  | "CHANDRA_NAKSHATRA_LORD_STRENGTH"
  | "TARA_BALA_AUSPICIOUS"
  | "TARA_BALA_INAUSPICIOUS"
  | "PUSHKARA_NAKSHATRA"
  | "NAKSHATRA_LORD_CONJUNCTION"
  | "ATMAKARAKA_PUSHKARA"
  | "JAIMINI_AK_AMK_SAMBANDHA"
  | "JAIMINI_AK_IN_ARUDHA_LAGNA"
  | "JAIMINI_AK_ASPECT_ARUDHA_LAGNA"
  | "JAIMINI_AMK_IN_10TH_FROM_AL"
  | "JAIMINI_PK_IN_5TH_FROM_AL"
  | "JAIMINI_DK_IN_7TH_FROM_AL"
  | "JAIMINI_KARAKAS_IN_KENDRA_AL"
  | "JAIMINI_AK_IN_OWN_SIGN"
  | "GENERAL";

export const YOGA_ICON_MAP: Record<YogaCategory, LucideIcon> = {
  RAJA_YOGA: Crown,
  DHARMA_KARMADHIPATI: Scale,
  GAJAKESARI: Star,
  PANCHA_MAHAPURUSHA: Gem,
  NEECHA_BHANGA: Sunrise,
  BUDHADITYA: Sun,
  CHANDRA_MANGAL: MoonStar,
  DHANA_YOGA: Coins,
  VIPAREETA_RAJA: RefreshCw,
  HARSHA: Shield,
  SARALA: Wand,
  VIMALA: Diamond,
  RUCHAKA: Zap,
  BHADRA: Heart,
  HAMSA: Award,
  MALAVYA: Medal,
  SHASHA: Trophy,
  ADHI: Crown,
  SUNAPHA: MoonStar,
  ANAPHA: MoonStar,
  DURUDHARA: Gem,
  KEMADRUMA: Shield,
  VASI: Sun,
  VESI: Sun,
  UBHAYACHARI: Star,
  SARASWATI: BookOpen,
  LAKSHMI: Diamond,
  PARIVARTANA: RefreshCw,
  AMALA: Award,
  PUSHKALA: Crown,
  SHUBHA_KARTARI: Flower2,
  PAPA_KARTARI: Shield,
  NABHASA_ASHRAYA: Layers,
  NABHASA_DALA: Infinity,
  NABHASA_AKRITI: Hexagon,
  NABHASA_SANKHYA: Circle,
  NAKSHATRA_PARIVARTANA: Orbit,
  NAKSHATRA_DISPOSITOR_STRENGTH: Orbit,
  CHANDRA_NAKSHATRA_LORD_STRENGTH: MoonStar,
  TARA_BALA_AUSPICIOUS: Star,
  TARA_BALA_INAUSPICIOUS: Shield,
  PUSHKARA_NAKSHATRA: Sparkles,
  NAKSHATRA_LORD_CONJUNCTION: RefreshCw,
  ATMAKARAKA_PUSHKARA: Crown,
  JAIMINI_AK_AMK_SAMBANDHA: Network,
  JAIMINI_AK_IN_ARUDHA_LAGNA: Crown,
  JAIMINI_AK_ASPECT_ARUDHA_LAGNA: Star,
  JAIMINI_AMK_IN_10TH_FROM_AL: Award,
  JAIMINI_PK_IN_5TH_FROM_AL: Heart,
  JAIMINI_DK_IN_7TH_FROM_AL: Medal,
  JAIMINI_KARAKAS_IN_KENDRA_AL: Layers,
  JAIMINI_AK_IN_OWN_SIGN: Gem,
  GENERAL: Sparkles,
};

export function getYogaIcon(code?: string, category?: string): LucideIcon {
  if (code && YOGA_ICON_MAP[code as YogaCategory]) {
    return YOGA_ICON_MAP[code as YogaCategory]!;
  }
  if (category && YOGA_ICON_MAP[category as YogaCategory]) {
    return YOGA_ICON_MAP[category as YogaCategory]!;
  }
  return YOGA_ICON_MAP.GENERAL!;
}

export function getYogaCategoryDisplay(category?: string): string {
  const displayMap: Record<string, string> = {
    RAJA_YOGA: "Raja Yoga",
    DHARMA_KARMADHIPATI: "Dharma-Karmadhipati",
    GAJAKESARI: "Gaja Kesari",
    PANCHA_MAHAPURUSHA: "Pancha Mahapurusha",
    NEECHA_BHANGA: "Neecha Bhanga",
    BUDHADITYA: "Budhaditya",
    CHANDRA_MANGAL: "Chandra-Mangal",
    DHANA_YOGA: "Dhana Yoga",
    VIPAREETA_RAJA: "Vipareeta Raja",
    HARSHA: "Harsha Yoga",
    SARALA: "Sarala Yoga",
    VIMALA: "Vimala Yoga",
    RUCHAKA: "Ruchaka",
    BHADRA: "Bhadra",
    HAMSA: "Hamsa",
    MALAVYA: "Malavya",
    SHASHA: "Shasha",
    ADHI: "Adhi Yoga",
    SUNAPHA: "Sunapha Yoga",
    ANAPHA: "Anapha Yoga",
    DURUDHARA: "Durudhara Yoga",
    KEMADRUMA: "Kemadruma Yoga",
    VASI: "Vasi Yoga",
    VESI: "Vesi Yoga",
    UBHAYACHARI: "Ubhayachari Yoga",
    SARASWATI: "Saraswati Yoga",
    LAKSHMI: "Lakshmi Yoga",
    PARIVARTANA: "Parivartana Yoga",
    AMALA: "Amala Yoga",
    PUSHKALA: "Pushkala Yoga",
    SHUBHA_KARTARI: "Shubha Kartari",
    PAPA_KARTARI: "Papa Kartari",
    NABHASA_ASHRAYA: "Ashraya Yoga",
    NABHASA_DALA: "Dala Yoga",
    NABHASA_AKRITI: "Akriti Yoga",
    NABHASA_SANKHYA: "Sankhya Yoga",
    NAKSHATRA_PARIVARTANA: "Nakshatra Parivartana",
    NAKSHATRA_DISPOSITOR_STRENGTH: "Nakshatra Dispositor Strength",
    CHANDRA_NAKSHATRA_LORD_STRENGTH: "Chandra Nakshatra Lord Strength",
    TARA_BALA_AUSPICIOUS: "Tara Bala Auspicious",
    TARA_BALA_INAUSPICIOUS: "Tara Bala Challenging",
    PUSHKARA_NAKSHATRA: "Pushkara Nakshatra",
    NAKSHATRA_LORD_CONJUNCTION: "Nakshatra Lord Conjunction",
    ATMAKARAKA_PUSHKARA: "Atmakaraka Pushkara",
    CAREER: "Career",
    WEALTH: "Wealth",
    MARRIAGE: "Marriage",
    HEALTH: "Health",
    GENERAL: "General",
  };
  return displayMap[category || ""] || category || "General";
}