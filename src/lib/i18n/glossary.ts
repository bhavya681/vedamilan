/**
 * Controlled Vedic glossary — keep canonical terms; localize explanations only.
 * Astrology engines must never depend on these strings.
 */

export type VedicTermId =
  | "kundli"
  | "nakshatra"
  | "dasha"
  | "graha"
  | "lagna"
  | "rashi"
  | "gunaMilan"
  | "ashtaKoota"
  | "shukraMilan"
  | "gochar"
  | "yoga"
  | "dosha";

type GlossaryEntry = {
  canonical: string;
  explanations: Record<string, string>;
};

export const VEDIC_GLOSSARY: Record<VedicTermId, GlossaryEntry> = {
  kundli: {
    canonical: "Kundli",
    explanations: {
      en: "Vedic birth chart",
      hi: "जन्म कुंडली",
      sa: "जन्मकुण्डली",
      mr: "जन्म कुंडली",
      es: "Carta natal védica",
      pt: "Mapa natal védico",
      fr: "Thème natal védique",
      ar: "خريطة الميلاد الفيدية",
      de: "Vedisches Geburtshoroskop",
      bn: "জন্ম কুণ্ডলী",
      ta: "பிறப்பு குண்டலி",
    },
  },
  nakshatra: {
    canonical: "Nakshatra",
    explanations: {
      en: "Lunar mansion",
      hi: "नक्षत्र",
      sa: "नक्षत्रम्",
      mr: "नक्षत्र",
      es: "Mansión lunar",
      pt: "Mansão lunar",
      fr: "Maison lunaire",
      ar: "المنزلة القمرية",
      de: "Mondhaus",
      bn: "নক্ষত্র",
      ta: "நட்சத்திரம்",
    },
  },
  dasha: {
    canonical: "Dasha",
    explanations: {
      en: "Planetary period",
      hi: "दशा काल",
      mr: "दशा काळ",
      es: "Periodo planetario",
      pt: "Período planetário",
      fr: "Période planétaire",
      ar: "الفترة الكوكبية",
      de: "Planetenperiode",
      bn: "দশাকাল",
      ta: "தசை காலம்",
    },
  },
  graha: {
    canonical: "Graha",
    explanations: {
      en: "Planet (Vedic)",
      hi: "ग्रह",
      mr: "ग्रह",
      es: "Planeta védico",
      pt: "Planeta védico",
      fr: "Planète védique",
      ar: "كوكب فيدي",
      de: "Vedischer Planet",
      bn: "গ্রহ",
      ta: "கிரகம்",
    },
  },
  lagna: {
    canonical: "Lagna",
    explanations: {
      en: "Ascendant / rising sign",
      hi: "लग्न (उदय राशि)",
      mr: "लग्न (उदय राशि)",
      es: "Ascendente",
      pt: "Ascendente",
      fr: "Ascendant",
      ar: "الطالع",
      de: "Aszendent",
      bn: "লগ্ন",
      ta: "லக்னம்",
    },
  },
  rashi: {
    canonical: "Rashi",
    explanations: {
      en: "Zodiac sign",
      hi: "राशि",
      mr: "राशी",
      es: "Signo zodiacal",
      pt: "Signo do zodíaco",
      fr: "Signe zodiacal",
      ar: "البرج",
      de: "Tierkreiszeichen",
      bn: "রাশি",
      ta: "ராசி",
    },
  },
  gunaMilan: {
    canonical: "Guna Milan",
    explanations: {
      en: "Classical point-based match",
      hi: "गुण मिलान",
      mr: "गुण मिलान",
      es: "Compatibilidad clásica por puntos",
      pt: "Compatibilidade clássica por pontos",
      fr: "Compatibilité classique par points",
      ar: "توافق كلاسيكي بالنقاط",
      de: "Klassischer Punkte-Abgleich",
      bn: "গুণ মিলন",
      ta: "குண மிலன்",
    },
  },
  ashtaKoota: {
    canonical: "Ashta Koota",
    explanations: {
      en: "Eight-fold compatibility framework",
      hi: "अष्ट कूट",
      mr: "अष्ट कूट",
      es: "Marco de compatibilidad de ocho factores",
      pt: "Estrutura de compatibilidade em oito fatores",
      fr: "Cadre de compatibilité à huit facteurs",
      ar: "إطار التوافق الثماني",
      de: "Achtfacher Kompatibilitätsrahmen",
      bn: "অষ্ট কূট",
      ta: "அஷ்ட கூடம்",
    },
  },
  shukraMilan: {
    canonical: "Shukra Milan",
    explanations: {
      en: "Venus-based relationship harmony",
      hi: "शुक्र मिलान",
      mr: "शुक्र मिलान",
      es: "Armonía relacional según Venus",
      pt: "Harmonia relacional segundo Vênus",
      fr: "Harmonie relationnelle selon Vénus",
      ar: "انسجام علائقي وفق الزهرة",
      de: "Beziehungsharmonie nach Venus",
      bn: "শুক্র মিলন",
      ta: "சுக்ர மிலன்",
    },
  },
  gochar: {
    canonical: "Gochar",
    explanations: {
      en: "Planetary transits",
      hi: "गोचर",
      mr: "गोचर",
      es: "Tránsitos planetarios",
      pt: "Trânsitos planetários",
      fr: "Transits planétaires",
      ar: "الانتقالات الكوكبية",
      de: "Planetentransite",
      bn: "গোচর",
      ta: "கோசரம்",
    },
  },
  yoga: {
    canonical: "Yoga",
    explanations: {
      en: "Planetary combination",
      hi: "योग",
      mr: "योग",
      es: "Combinación planetaria",
      pt: "Combinação planetária",
      fr: "Combinaison planétaire",
      ar: "تركيبة كوكبية",
      de: "Planetenkombination",
      bn: "যোগ",
      ta: "யோகம்",
    },
  },
  dosha: {
    canonical: "Dosha",
    explanations: {
      en: "Astrological affliction to discuss thoughtfully",
      hi: "दोष",
      mr: "दोष",
      es: "Aflicción astrológica (para conversar con cuidado)",
      pt: "Aflição astrológica (para discutir com cuidado)",
      fr: "Affliction astrologique (à aborder avec nuance)",
      ar: "عارض فلكي للنقاش بهدوء",
      de: "Astrologische Belastung (sorgfältig zu besprechen)",
      bn: "দোষ",
      ta: "தோஷம்",
    },
  },
};

export function formatVedicTerm(termId: VedicTermId, locale: string): string {
  const entry = VEDIC_GLOSSARY[termId];
  const explanation = entry.explanations[locale] || entry.explanations.en;
  return `${entry.canonical} — ${explanation}`;
}
