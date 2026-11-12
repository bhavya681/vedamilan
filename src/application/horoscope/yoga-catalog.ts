import { LucideIcon } from "lucide-react";

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
  | "GENERAL";

export type YogaSource = "BPHS" | "Phaladeepika" | "Saravali" | "Jataka_Parijata" | "Brihat_Jataka" | "Multiple" | "Classical";

export interface YogaCatalogEntry {
  code: string;
  name: string;
  alternativeNames: string[];
  category: "Raja Yoga" | "Dhana Yoga" | "Pancha Mahapurusha" | "Lunar Yoga" | "Solar Yoga" | "Nabhasa Yoga" | "Planetary Yoga" | "Other";
  icon: LucideIcon;
  description: string;
  classicalReferences: {
    text: YogaSource;
    chapter?: string;
    verse?: string;
    note?: string;
  }[];
  conditions: {
    required: string[];
    planets: string[];
    houses: number[];
    signs?: string[];
    specialConditions?: string[];
  };
  cancellationConditions?: string[];
  applicableAscendants?: string[];
  calculationSupported: boolean;
  implementationStatus: "implemented" | "partial" | "planned" | "not_implemented";
  strengthFactors: string[];
  interpretation: string;
  lifeAreas: string[];
}

export const YOGA_CATALOG: YogaCatalogEntry[] = [
  {
    code: "RAJA_YOGA",
    name: "Raja Yoga (Kendra-Trikona)",
    alternativeNames: ["Kendra-Trikona Raja Yoga", "Kendra Trikona Yoga"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Association between Kendra lords (1, 4, 7, 10) and Trikona lords (1, 5, 9) through conjunction, mutual aspect, exchange, or Kendra-Trikona placement.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "1-3", note: "Kendra lord and Trikona lord association forms Raja Yoga" },
      { text: "Phaladeepika", chapter: "6", verse: "13", note: "Raja Yoga from Kendra-Trikona lords" },
    ],
    conditions: {
      required: ["Kendra lord associates with Trikona lord"],
      planets: ["Variable"],
      houses: [1, 4, 5, 7, 9, 10],
      specialConditions: ["Conjunction", "Mutual aspect", "Parivartana", "Kendra-Trikona relationship"],
    },
    cancellationConditions: ["Debilitation of either lord without cancellation", "Combustion", "Placement in dusthana with affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Conjunction in Kendra/Trikona", "Mutual aspect", "Exchange (Parivartana)", "Own sign/exaltation of lords"],
    interpretation: "Supports recognition, authority, leadership, and life elevation when dasha supports.",
    lifeAreas: ["Career", "Status", "Leadership", "Public Recognition"],
  },
  {
    code: "DHARMA_KARMADHIPATI",
    name: "Dharma-Karmadhipati Yoga",
    alternativeNames: ["9th-10th Lord Yoga", "Dharma Karma Adhipati Yoga"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Association between the 9th lord (dharma, fortune) and 10th lord (karma, profession) connecting life purpose with vocation.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "33", note: "9th and 10th lord association forms Dharma-Karmadhipati Yoga" },
      { text: "Phaladeepika", chapter: "6", verse: "20", note: "9th and 10th lords give Raj Yoga" },
    ],
    conditions: {
      required: ["9th lord associates with 10th lord"],
      planets: ["Variable"],
      houses: [9, 10],
      specialConditions: ["Conjunction", "Mutual aspect", "Parivartana", "Kendra-Trikona relationship"],
    },
    cancellationConditions: ["Either lord debilitated without cancellation", "Affliction by malefics"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Conjunction in Kendra/Trikona", "Exchange", "Mutual aspect", "Both lords strong"],
    interpretation: "Connects fortune, dharma, and profession — supports purposeful vocation and public standing.",
    lifeAreas: ["Career", "Dharma", "Fortune", "Vocation"],
  },
  {
    code: "GAJAKESARI",
    name: "Gaja Kesari Yoga",
    alternativeNames: ["Gajakesari Yoga"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Jupiter in Kendra (1, 4, 7, 10) from Moon. Favors wisdom, reputation, prosperity, and dignified speech.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "1-2", note: "Jupiter in Kendra from Moon" },
      { text: "Phaladeepika", chapter: "6", verse: "13", note: "Gaja Kesari gives wealth and wisdom" },
      { text: "Saravali", chapter: "35", verse: "1", note: "Jupiter in Kendra from Moon" },
    ],
    conditions: {
      required: ["Jupiter in Kendra from Moon (houses 1, 4, 7, 10 from Moon)"],
      planets: ["Moon", "Jupiter"],
      houses: [1, 4, 7, 10],
    },
    cancellationConditions: ["Jupiter debilitated without Neecha Bhanga", "Jupiter combust", "Jupiter in enemy sign with affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Close degree conjunction with Moon", "Jupiter exalted/own sign", "Moon strong", "Jupiter not retrograde"],
    interpretation: "Favors wisdom, reputation, prosperity, and dignified speech. Strong during Jupiter/Moon dashas.",
    lifeAreas: ["Wealth", "Wisdom", "Reputation", "Education"],
  },
  {
    code: "BUDHADITYA",
    name: "Budhaditya Yoga",
    alternativeNames: ["Sun-Mercury Yoga"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "Sun-Mercury conjunction — intellect, communication, and analytical skill themes. Best when Mercury is not combust.",
    classicalReferences: [
      { text: "BPHS", chapter: "31", verse: "1-3", note: "Sun-Mercury conjunction" },
      { text: "Phaladeepika", chapter: "6", verse: "28", note: "Budhaditya Yoga" },
    ],
    conditions: {
      required: ["Sun and Mercury conjunct (same house)"],
      planets: ["Sun", "Mercury"], houses: [],
      specialConditions: ["Not combust (preferably >14° from Sun)"],
    },
    cancellationConditions: ["Mercury combust (within 14° of Sun)", "Mercury debilitated without cancellation"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Tight conjunction (<5°)", "Mercury not combust", "Mercury in own/exalted sign", "In Kendra/Trikona"],
    interpretation: "Supports intellect, communication, analytical skill, and professional clarity.",
    lifeAreas: ["Career", "Intellect", "Communication", "Education"],
  },
  {
    code: "CHANDRA_MANGAL",
    name: "Chandra-Mangal Yoga",
    alternativeNames: ["Moon-Mars Yoga"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "Moon and Mars association through conjunction, mutual aspect, or Kendra-Trikona relationship — supports wealth acquisition and entrepreneurship.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "5", note: "Moon-Mars association gives wealth" },
      { text: "Phaladeepika", chapter: "6", verse: "25", note: "Chandra Mangala Yoga" },
    ],
    conditions: {
      required: ["Moon and Mars associate"],
      planets: ["Moon", "Mars"], houses: [],
      specialConditions: ["Conjunction", "Mutual aspect", "Kendra-Trikona relationship"],
    },
    cancellationConditions: ["Mars debilitated without cancellation", "Moon weak (waning, debilitated)"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Conjunction in Kendra/Trikona", "Both planets strong", "Mutual aspect"],
    interpretation: "Supports wealth acquisition, entrepreneurship, property gains, and material success.",
    lifeAreas: ["Wealth", "Property", "Enterprise", "Courage"],
  },
  {
    code: "RUCHAKA",
    name: "Ruchaka Yoga",
    alternativeNames: [],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "Mars in own sign (Aries/Scorpio) or exalted (Capricorn) AND in Kendra (1, 4, 7, 10). Bestows courage, leadership, victory.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "14-15", note: "Mars in own/exalted in Kendra" },
      { text: "Phaladeepika", chapter: "6", verse: "15", note: "Ruchaka Yoga" },
      { text: "Saravali", chapter: "35", verse: "10", note: "Pancha Mahapurusha" },
    ],
    conditions: {
      required: ["Mars in Aries/Scorpio/Capricorn AND in house 1, 4, 7, or 10"],
      planets: ["Mars"],
      houses: [1, 4, 7, 10],
      signs: ["Aries", "Scorpio", "Capricorn"],
    },
    cancellationConditions: ["Mars combust", "Mars retrograde (mild)", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Mars exalted in Capricorn", "Mars in own sign", "Mars not combust", "Mars direct"],
    interpretation: "Bestows courage, leadership, victory in competition, and physical prowess.",
    lifeAreas: ["Courage", "Leadership", "Sports", "Defense", "Surgery"],
  },
  {
    code: "BHADRA",
    name: "Bhadra Yoga",
    alternativeNames: [],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "Mercury in own sign (Gemini/Virgo) or exalted (Virgo) AND in Kendra. Bestows intelligence, communication mastery, commercial success.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "16-17", note: "Mercury in own/exalted in Kendra" },
      { text: "Phaladeepika", chapter: "6", verse: "16", note: "Bhadra Yoga" },
    ],
    conditions: {
      required: ["Mercury in Gemini/Virgo AND in house 1, 4, 7, or 10"],
      planets: ["Mercury"],
      houses: [1, 4, 7, 10],
      signs: ["Gemini", "Virgo"],
    },
    cancellationConditions: ["Mercury combust", "Mercury retrograde (mild)", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Mercury exalted in Virgo", "Mercury in own sign", "Mercury not combust", "Mercury direct"],
    interpretation: "Bestows intelligence, communication mastery, commercial success, and analytical brilliance.",
    lifeAreas: ["Intellect", "Commerce", "Communication", "Education", "Writing"],
  },
  {
    code: "HAMSA",
    name: "Hamsa Yoga",
    alternativeNames: [],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "Jupiter in own sign (Sagittarius/Pisces) or exalted (Cancer) AND in Kendra. Bestows wisdom, spirituality, prosperity, righteous living.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "18-19", note: "Jupiter in own/exalted in Kendra" },
      { text: "Phaladeepika", chapter: "6", verse: "17", note: "Hamsa Yoga" },
    ],
    conditions: {
      required: ["Jupiter in Sagittarius/Pisces/Cancer AND in house 1, 4, 7, or 10"],
      planets: ["Jupiter"],
      houses: [1, 4, 7, 10],
      signs: ["Sagittarius", "Pisces", "Cancer"],
    },
    cancellationConditions: ["Jupiter combust", "Jupiter retrograde (mild)", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Jupiter exalted in Cancer", "Jupiter in own sign", "Jupiter not combust", "Jupiter direct"],
    interpretation: "Bestows wisdom, spirituality, prosperity, righteous living, and respected counsel.",
    lifeAreas: ["Wisdom", "Spirituality", "Prosperity", "Counsel", "Teaching"],
  },
  {
    code: "MALAVYA",
    name: "Malavya Yoga",
    alternativeNames: [],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "Venus in own sign (Taurus/Libra) or exalted (Pisces) AND in Kendra. Bestows luxury, beauty, artistic talent, harmonious relationships.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "20-21", note: "Venus in own/exalted in Kendra" },
      { text: "Phaladeepika", chapter: "6", verse: "18", note: "Malavya Yoga" },
    ],
    conditions: {
      required: ["Venus in Taurus/Libra/Pisces AND in house 1, 4, 7, or 10"],
      planets: ["Venus"],
      houses: [1, 4, 7, 10],
      signs: ["Taurus", "Libra", "Pisces"],
    },
    cancellationConditions: ["Venus combust", "Venus retrograde (mild)", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Venus exalted in Pisces", "Venus in own sign", "Venus not combust", "Venus direct"],
    interpretation: "Bestows luxury, beauty, artistic talent, harmonious relationships, and enjoyment of comforts.",
    lifeAreas: ["Luxury", "Arts", "Relationships", "Beauty", "Creativity"],
  },
  {
    code: "SHASHA",
    name: "Shasha Yoga",
    alternativeNames: [],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "Saturn in own sign (Capricorn/Aquarius) or exalted (Libra) AND in Kendra. Bestows discipline, longevity, authority through hard work.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "22-23", note: "Saturn in own/exalted in Kendra" },
      { text: "Phaladeepika", chapter: "6", verse: "19", note: "Shasha Yoga" },
    ],
    conditions: {
      required: ["Saturn in Capricorn/Aquarius/Libra AND in house 1, 4, 7, or 10"],
      planets: ["Saturn"],
      houses: [1, 4, 7, 10],
      signs: ["Capricorn", "Aquarius", "Libra"],
    },
    cancellationConditions: ["Saturn combust", "Saturn retrograde (mild - Saturn retrograde is actually strong)", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Saturn exalted in Libra", "Saturn in own sign", "Saturn retrograde (strong)", "Saturn not combust"],
    interpretation: "Bestows discipline, longevity, authority through hard work, spiritual detachment, and mastery over time.",
    lifeAreas: ["Discipline", "Authority", "Longevity", "Karma", "Real Estate"],
  },
  {
    code: "PANCHA_MAHAPURUSHA",
    name: "Pancha Mahapurusha Yogas",
    alternativeNames: ["Five Great Person Yogas"],
    category: "Pancha Mahapurusha",
    icon: {} as LucideIcon,
    description: "The five great yogas formed by Mars, Mercury, Jupiter, Venus, Saturn in their own/exalted signs in Kendra houses.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "14-23", note: "All five Mahapurusha yogas" },
      { text: "Phaladeepika", chapter: "6", verse: "15-19", note: "Pancha Mahapurusha" },
      { text: "Saravali", chapter: "35", note: "Five Mahapurusha yogas" },
    ],
    conditions: {
      required: ["Any of the five planets in own/exalted sign in Kendra"],
      planets: ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"],
      houses: [1, 4, 7, 10],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Exalted planet", "Own sign planet", "Multiple Mahapurusha yogas"],
    interpretation: "Exceptional qualities related to the planet's significations.",
    lifeAreas: ["Overall Excellence"],
  },
  {
    code: "NEECHA_BHANGA",
    name: "Neecha Bhanga Raja Yoga",
    alternativeNames: ["Cancellation of Debilitation"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Debilitation cancelled by specific conditions: sign/exaltation lord in Kendra from Lagna/Moon, conjunction with exalted planet, or debilitated planet itself in Kendra.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "24-30", note: "Neecha Bhanga conditions" },
      { text: "Phaladeepika", chapter: "6", verse: "30-35", note: "Neecha Bhanga Raja Yoga" },
      { text: "Saravali", chapter: "35", verse: "15-20", note: "Cancellation of debilitation" },
    ],
    conditions: {
      required: ["Planet debilitated AND one cancellation condition met"],
      planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"], houses: [],
      specialConditions: [
        "Debilitated planet's sign lord in Kendra from Lagna",
        "Debilitated planet's sign lord in Kendra from Moon",
        "Debilitated planet's exaltation lord in Kendra from Lagna",
        "Debilitated planet's exaltation lord in Kendra from Moon",
        "Debilitated planet conjunct exalted planet",
        "Debilitated planet itself in Kendra from Lagna",
        "Debilitated planet itself in Kendra from Moon",
        "Debilitated planet's sign lord aspects the debilitated planet",
      ],
    },
    cancellationConditions: [],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Exaltation lord in Kendra", "Sign lord in Kendra", "Conjunction with exalted planet", "Debilitated planet in Kendra"],
    interpretation: "Debilitation transformed into Raja Yoga giving exceptional results during the planet's dasha.",
    lifeAreas: ["Career", "Transformation", "Unexpected Success", "Reversal of Fortune"],
  },
  {
    code: "HARSHA",
    name: "Harsha Yoga",
    alternativeNames: ["Vipareeta Harsha"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "6th lord placed in 6th, 8th, or 12th house — transforms obstacles, enemies, and debts into victory and healing.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "36-38", note: "6th lord in 6, 8, 12" },
      { text: "Phaladeepika", chapter: "6", verse: "22", note: "Harsha Yoga" },
    ],
    conditions: {
      required: ["6th lord in house 6, 8, or 12"],
      planets: ["Variable (6th lord)"],
      houses: [6, 8, 12],
    },
    cancellationConditions: ["6th lord strong in own/exalted sign in dusthana (actually strengthens)"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["6th lord exalted/own in dusthana", "Benefic 6th lord", "No malefic affliction"],
    interpretation: "Victory over competitors, recovery from illness, resolution of debts, success through overcoming challenges.",
    lifeAreas: ["Health", "Enemies", "Obstacles", "Victory", "Legal"],
  },
  {
    code: "SARALA",
    name: "Sarala Yoga",
    alternativeNames: ["Vipareeta Sarala"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "8th lord placed in 6th, 8th, or 12th house — transforms sudden changes, longevity issues into longevity, inheritance, deep transformation.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "36-38", note: "8th lord in 6, 8, 12" },
      { text: "Phaladeepika", chapter: "6", verse: "23", note: "Sarala Yoga" },
    ],
    conditions: {
      required: ["8th lord in house 6, 8, or 12"],
      planets: ["Variable (8th lord)"],
      houses: [6, 8, 12],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["8th lord exalted/own in dusthana", "Benefic 8th lord", "No malefic affliction"],
    interpretation: "Unexpected inheritances, deep psychological transformation, longevity, gains through research/occult.",
    lifeAreas: ["Longevity", "Inheritance", "Transformation", "Research", "Occult"],
  },
  {
    code: "VIMALA",
    name: "Vimala Yoga",
    alternativeNames: ["Vipareeta Vimala"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "12th lord placed in 6th, 8th, or 12th house — transforms losses, expenses, isolation into spiritual growth, foreign gains.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "36-38", note: "12th lord in 6, 8, 12" },
      { text: "Phaladeepika", chapter: "6", verse: "24", note: "Vimala Yoga" },
    ],
    conditions: {
      required: ["12th lord in house 6, 8, or 12"],
      planets: ["Variable (12th lord)"],
      houses: [6, 8, 12],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["12th lord exalted/own in dusthana", "Benefic 12th lord", "No malefic affliction"],
    interpretation: "Foreign connections, spiritual progress, charitable gains, hospital/healing work, liberation from past karmas.",
    lifeAreas: ["Spirituality", "Foreign", "Charity", "Liberation", "Healing"],
  },
  {
    code: "VIPAREETA_RAJA",
    name: "Vipareeta Raja Yoga",
    alternativeNames: ["Reverse Raja Yoga"],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Dusthana lords (6, 8, 12) placed in dusthana houses (6, 8, 12) — obstacles transform into success. Includes Harsha, Sarala, Vimala.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "36-38", note: "Dusthana lords in dusthana" },
      { text: "Phaladeepika", chapter: "6", verse: "22-24", note: "Vipareeta Raja Yogas" },
      { text: "Saravali", chapter: "35", verse: "25-30", note: "Vipareeta Raja" },
    ],
    conditions: {
      required: ["6th/8th/12th lord in 6th/8th/12th house"],
      planets: ["Variable"],
      houses: [6, 8, 12],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Multiple dusthana lords in dusthana", "Lords in own/exalted signs"],
    interpretation: "Obstacles transform into unexpected success, victory over enemies, and spiritual growth.",
    lifeAreas: ["Transformation", "Victory", "Spiritual Growth"],
  },
  {
    code: "DHANA_YOGA",
    name: "Dhana Yoga",
    alternativeNames: ["Wealth Yoga"],
    category: "Dhana Yoga",
    icon: {} as LucideIcon,
    description: "Association of wealth house lords (2nd, 5th, 9th, 11th) through conjunction, mutual aspect, exchange, or Kendra-Trikona relationship.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "40-45", note: "Dhana Yogas from wealth house lords" },
      { text: "Phaladeepika", chapter: "6", verse: "36-40", note: "Dhana Yogas" },
      { text: "Saravali", chapter: "35", verse: "35-40", note: "Wealth combinations" },
    ],
    conditions: {
      required: ["Wealth house lords associate"],
      planets: ["Variable"],
      houses: [2, 5, 9, 11],
      specialConditions: ["2nd-11th lords", "2nd-5th lords", "2nd-9th lords", "5th-9th lords (Lakshmi)", "11th lord in Kendra/Trikona"],
    },
    cancellationConditions: ["Lords debilitated/afflicted", "Malefic association without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Exchange (Parivartana)", "Conjunction in Kendra/Trikona", "Mutual aspect", "Lords strong in own/exalted signs"],
    interpretation: "Wealth accumulation, financial gains, resource acquisition through multiple channels.",
    lifeAreas: ["Wealth", "Income", "Investments", "Resources", "Financial Gains"],
  },
  {
    code: "ADHI",
    name: "Adhi Yoga",
    alternativeNames: ["Adhi Yoga from Moon"],
    category: "Lunar Yoga",
    icon: {} as LucideIcon,
    description: "Benefic planets (Jupiter, Venus, Mercury) in 6th, 7th, 8th houses from Moon. Gives leadership, prosperity, and comfort.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "10-12", note: "Benefics in 6, 7, 8 from Moon" },
      { text: "Phaladeepika", chapter: "7", verse: "1-3", note: "Adhi Yoga" },
      { text: "Saravali", chapter: "35", verse: "5", note: "Adhi Yoga from Chandra" },
    ],
    conditions: {
      required: ["Jupiter, Venus, Mercury in 6th, 7th, or 8th from Moon (at least two)"],
      planets: ["Jupiter", "Venus", "Mercury"],
      houses: [6, 7, 8],
      specialConditions: ["From Moon's position", "Benefics only"],
    },
    cancellationConditions: ["Benefics debilitated/afflicted", "Malefics in those houses"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["All three benefics present", "Benefics in own/exalted signs", "Moon strong"],
    interpretation: "Leadership, prosperity, comfort, and high status. Like a king's yoga.",
    lifeAreas: ["Leadership", "Prosperity", "Comfort", "Status"],
  },
  {
    code: "SUNAPHA",
    name: "Sunapha Yoga",
    alternativeNames: ["Sunapha Yoga from Moon"],
    category: "Lunar Yoga",
    icon: {} as LucideIcon,
    description: "Planet (except Sun, Rahu, Ketu) in 2nd house from Moon. Gives self-earned wealth, good speech, and happiness.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "3-4", note: "Planet in 2nd from Moon" },
      { text: "Phaladeepika", chapter: "7", verse: "4", note: "Sunapha Yoga" },
      { text: "Saravali", chapter: "35", verse: "2", note: "Sunapha" },
    ],
    conditions: {
      required: ["Planet (not Sun/Rahu/Ketu) in 2nd from Moon"],
      planets: ["Moon", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [2],
      specialConditions: ["From Moon's position"],
    },
    cancellationConditions: ["Planet debilitated", "Malefic planet without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefic planet in 2nd from Moon", "Planet in own/exalted sign"],
    interpretation: "Self-earned wealth, good speech, happiness, and comfortable life.",
    lifeAreas: ["Wealth", "Speech", "Happiness", "Self-effort"],
  },
  {
    code: "ANAPHA",
    name: "Anapha Yoga",
    alternativeNames: ["Anapha Yoga from Moon"],
    category: "Lunar Yoga",
    icon: {} as LucideIcon,
    description: "Planet (except Sun, Rahu, Ketu) in 12th house from Moon. Gives wealth, good reputation, and material comforts.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "5-6", note: "Planet in 12th from Moon" },
      { text: "Phaladeepika", chapter: "7", verse: "5", note: "Anapha Yoga" },
      { text: "Saravali", chapter: "35", verse: "3", note: "Anapha" },
    ],
    conditions: {
      required: ["Planet (not Sun/Rahu/Ketu) in 12th from Moon"],
      planets: ["Moon", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [12],
      specialConditions: ["From Moon's position"],
    },
    cancellationConditions: ["Planet debilitated", "Malefic planet without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefic planet in 12th from Moon", "Planet in own/exalted sign"],
    interpretation: "Wealth, good reputation, material comforts, and peaceful life.",
    lifeAreas: ["Wealth", "Reputation", "Comforts", "Peace"],
  },
  {
    code: "DURUDHARA",
    name: "Durudhara Yoga",
    alternativeNames: ["Durudhara Yoga from Moon"],
    category: "Lunar Yoga",
    icon: {} as LucideIcon,
    description: "Planets (except Sun, Rahu, Ketu) in both 2nd and 12th houses from Moon. Combines Sunapha and Anapha — great wealth and enjoyment.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "7-8", note: "Planets in both 2nd and 12th from Moon" },
      { text: "Phaladeepika", chapter: "7", verse: "6", note: "Durudhara Yoga" },
      { text: "Saravali", chapter: "35", verse: "4", note: "Durudhara" },
    ],
    conditions: {
      required: ["Planets in both 2nd AND 12th from Moon (not Sun/Rahu/Ketu)"],
      planets: ["Moon", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [2, 12],
      specialConditions: ["From Moon's position", "Both sides occupied"],
    },
    cancellationConditions: ["Malefics on both sides without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefics on both sides", "Multiple benefics", "Planets in own/exalted signs"],
    interpretation: "Great wealth, enjoyment, comfort, high status — combination of Sunapha and Anapha.",
    lifeAreas: ["Wealth", "Enjoyment", "Status", "Comfort"],
  },
  {
    code: "KEMADRUMA",
    name: "Kemadruma Yoga",
    alternativeNames: ["Kemadruma Yoga (Absence of Lunar Yogas)"],
    category: "Lunar Yoga",
    icon: {} as LucideIcon,
    description: "No planet (except Sun, Rahu, Ketu) in 2nd or 12th from Moon, and no planet conjunct Moon. Gives struggles, but cancellation possible.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "9", note: "No planets around Moon" },
      { text: "Phaladeepika", chapter: "7", verse: "7", note: "Kemadruma Yoga" },
      { text: "Saravali", chapter: "35", verse: "6", note: "Kemadruma" },
    ],
    conditions: {
      required: ["No planet in 2nd or 12th from Moon, no planet conjunct Moon (excluding Sun/Rahu/Ketu)"],
      planets: ["Moon"],
      houses: [2, 12],
      specialConditions: ["Absence of planets"],
    },
    cancellationConditions: [
      "Moon in Kendra from Lagna",
      "Moon in own/exalted sign",
      "Benefic aspect on Moon",
      "Moon in benefic navamsa",
      "Jupiter/Venus in Kendra from Moon",
    ],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Cancellation conditions present", "Moon strong by sign"],
    interpretation: "Struggles, loneliness, financial difficulty — but cancellations transform it. Check for Neecha Bhanga of Moon.",
    lifeAreas: ["Struggles", "Isolation", "Financial Challenges"],
  },
  {
    code: "VASI",
    name: "Vasi Yoga",
    alternativeNames: ["Vasi Yoga from Sun"],
    category: "Solar Yoga",
    icon: {} as LucideIcon,
    description: "Planet (except Moon, Rahu, Ketu) in 12th house from Sun. Gives intelligence, wealth, and royal favor.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "13-14", note: "Planet in 12th from Sun" },
      { text: "Phaladeepika", chapter: "7", verse: "8", note: "Vasi Yoga" },
      { text: "Saravali", chapter: "35", verse: "7", note: "Vasi" },
    ],
    conditions: {
      required: ["Planet (not Moon/Rahu/Ketu) in 12th from Sun"],
      planets: ["Sun", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [12],
      specialConditions: ["From Sun's position"],
    },
    cancellationConditions: ["Planet debilitated", "Malefic without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefic planet in 12th from Sun", "Planet in own/exalted sign", "Mercury/Jupiter/Venus"],
    interpretation: "Intelligence, wealth, royal favor, and comfortable life.",
    lifeAreas: ["Intelligence", "Wealth", "Royal Favor", "Comfort"],
  },
  {
    code: "VESI",
    name: "Vesi Yoga",
    alternativeNames: ["Vesi Yoga from Sun"],
    category: "Solar Yoga",
    icon: {} as LucideIcon,
    description: "Planet (except Moon, Rahu, Ketu) in 2nd house from Sun. Gives wealth, courage, and charitable nature.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "15-16", note: "Planet in 2nd from Sun" },
      { text: "Phaladeepika", chapter: "7", verse: "9", note: "Vesi Yoga" },
      { text: "Saravali", chapter: "35", verse: "8", note: "Vesi" },
    ],
    conditions: {
      required: ["Planet (not Moon/Rahu/Ketu) in 2nd from Sun"],
      planets: ["Sun", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [2],
      specialConditions: ["From Sun's position"],
    },
    cancellationConditions: ["Planet debilitated", "Malefic without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefic planet in 2nd from Sun", "Planet in own/exalted sign"],
    interpretation: "Wealth, courage, charitable nature, and respected position.",
    lifeAreas: ["Wealth", "Courage", "Charity", "Respect"],
  },
  {
    code: "UBHAYACHARI",
    name: "Ubhayachari Yoga",
    alternativeNames: ["Ubhayachari Yoga from Sun"],
    category: "Solar Yoga",
    icon: {} as LucideIcon,
    description: "Planets (except Moon, Rahu, Ketu) in both 2nd and 12th houses from Sun. Combines Vasi and Vesi — great intelligence and wealth.",
    classicalReferences: [
      { text: "BPHS", chapter: "14", verse: "17-18", note: "Planets in both 2nd and 12th from Sun" },
      { text: "Phaladeepika", chapter: "7", verse: "10", note: "Ubhayachari Yoga" },
      { text: "Saravali", chapter: "35", verse: "9", note: "Ubhayachari" },
    ],
    conditions: {
      required: ["Planets in both 2nd AND 12th from Sun (not Moon/Rahu/Ketu)"],
      planets: ["Sun", "Variable (Mars/Mercury/Jupiter/Venus/Saturn)"],
      houses: [2, 12],
      specialConditions: ["From Sun's position", "Both sides occupied"],
    },
    cancellationConditions: ["Malefics on both sides without benefic support"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Benefics on both sides", "Multiple benefics", "Planets in own/exalted signs"],
    interpretation: "Great intelligence, wealth, high status — combination of Vasi and Vesi.",
    lifeAreas: ["Intelligence", "Wealth", "Status", "Leadership"],
  },
  {
    code: "SARASWATI",
    name: "Saraswati Yoga",
    alternativeNames: ["Sarasvati Yoga"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "Jupiter, Venus, Mercury in Kendra/Trikona from Lagna or Moon, with Jupiter strong. Bestows learning, eloquence, and artistic talent.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "50-52", note: "Jupiter, Venus, Mercury in Kendra/Trikona" },
      { text: "Phaladeepika", chapter: "6", verse: "42", note: "Saraswati Yoga" },
      { text: "Saravali", chapter: "35", verse: "12", note: "Saraswati" },
    ],
    conditions: {
      required: ["Jupiter, Venus, Mercury in Kendra (1,4,7,10) or Trikona (1,5,9) from Lagna or Moon", "Jupiter strong (own/exalted/friendly)"],
      planets: ["Jupiter", "Venus", "Mercury"],
      houses: [1, 4, 5, 7, 9, 10],
      specialConditions: ["From Lagna or Moon", "Jupiter must be strong"],
    },
    cancellationConditions: ["Jupiter debilitated/afflicted", "Mercury combust", "Malefic affliction"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Jupiter exalted/own", "All three in Kendra/Trikona", "Mercury/Venus strong"],
    interpretation: "Learning, eloquence, artistic talent, wisdom, and mastery of arts/sciences.",
    lifeAreas: ["Education", "Arts", "Eloquence", "Wisdom", "Creativity"],
  },
  {
    code: "LAKSHMI",
    name: "Lakshmi Yoga",
    alternativeNames: ["Lakshmi Narayana Yoga"],
    category: "Dhana Yoga",
    icon: {} as LucideIcon,
    description: "9th lord in Kendra/Trikona in own/exalted sign, and Venus in Kendra/Trikona in own/exalted sign. Gives abundant wealth and prosperity.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "46-48", note: "9th lord and Venus in Kendra/Trikona" },
      { text: "Phaladeepika", chapter: "6", verse: "41", note: "Lakshmi Yoga" },
      { text: "Saravali", chapter: "35", verse: "11", note: "Lakshmi" },
    ],
    conditions: {
      required: ["9th lord in Kendra/Trikona in own/exalted sign", "Venus in Kendra/Trikona in own/exalted sign"],
      planets: ["9th lord", "Venus"],
      houses: [1, 4, 5, 7, 9, 10],
      signs: ["Variable (own/exalted of 9th lord)", "Taurus", "Libra", "Pisces"],
    },
    cancellationConditions: ["9th lord or Venus debilitated/afflicted"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Both planets exalted", "Both in Kendra", "Venus in Pisces (exalted)"],
    interpretation: "Abundant wealth, prosperity, luxury, and fulfillment of desires.",
    lifeAreas: ["Wealth", "Prosperity", "Luxury", "Fulfillment"],
  },
  {
    code: "PARIVARTANA",
    name: "Parivartana Yoga",
    alternativeNames: ["Exchange Yoga", "Mutual Exchange"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "Two planets exchange signs — each occupies the other's sign. Creates strong linkage between the houses involved.",
    classicalReferences: [
      { text: "BPHS", chapter: "31", verse: "10-12", note: "Exchange of signs" },
      { text: "Phaladeepika", chapter: "6", verse: "26", note: "Parivartana Yoga" },
      { text: "Saravali", chapter: "35", verse: "20", note: "Parivartana" },
    ],
    conditions: {
      required: ["Planet A in sign ruled by Planet B, Planet B in sign ruled by Planet A"],
      planets: ["Variable (any two planets)"], houses: [],
      specialConditions: ["Mutual exchange of signs"],
    },
    cancellationConditions: ["Either planet debilitated/afflicted without cancellation"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Kendra-Trikona lords exchanging", "Benefic exchange", "Both planets strong"],
    interpretation: "Strong linkage between the two houses — results depend on houses and planets involved.",
    lifeAreas: ["Variable (depends on houses)"],
  },
  {
    code: "AMALA",
    name: "Amala Yoga",
    alternativeNames: ["Amala Yoga from Moon/Lagna"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "Benefic planet in 10th house from Lagna or Moon. Gives pure reputation, lasting fame, and virtuous career.",
    classicalReferences: [
      { text: "BPHS", chapter: "41", verse: "49", note: "Benefic in 10th from Lagna/Moon" },
      { text: "Phaladeepika", chapter: "6", verse: "43", note: "Amala Yoga" },
      { text: "Saravali", chapter: "35", verse: "10", note: "Amala" },
    ],
    conditions: {
      required: ["Benefic (Jupiter, Venus, Mercury, waxing Moon) in 10th from Lagna or Moon"],
      planets: ["Jupiter", "Venus", "Mercury", "Moon"],
      houses: [10],
      specialConditions: ["From Lagna or Moon", "Benefic only"],
    },
    cancellationConditions: ["Benefic debilitated/afflicted", "Malefic in 10th"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Jupiter/Venus in 10th", "Planet exalted/own", "From both Lagna and Moon"],
    interpretation: "Pure reputation, lasting fame, virtuous career, and respect in society.",
    lifeAreas: ["Reputation", "Career", "Virtue", "Fame"],
  },
  {
    code: "PUSHKALA",
    name: "Pushkala Yoga",
    alternativeNames: [],
    category: "Raja Yoga",
    icon: {} as LucideIcon,
    description: "Lagna lord strong, Moon in Kendra/Trikona from Lagna, and at least one benefic in Kendra from Lagna. Gives high status and prosperity.",
    classicalReferences: [
      { text: "Jataka_Parijata", chapter: "12", verse: "5-7", note: "Pushkala Yoga conditions" },
      { text: "Phaladeepika", chapter: "6", verse: "44", note: "Pushkala Yoga" },
    ],
    conditions: {
      required: ["Lagna lord strong (own/exalted/friendly)", "Moon in Kendra/Trikona from Lagna", "At least one benefic in Kendra from Lagna"],
      planets: ["Lagna lord", "Moon", "Benefic (Jupiter/Venus/Mercury)"],
      houses: [1, 4, 5, 7, 9, 10],
      specialConditions: ["Multiple conditions must be met simultaneously"],
    },
    cancellationConditions: ["Lagna lord weak", "Moon afflicted", "No benefic in Kendra"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Lagna lord exalted", "Moon in Kendra", "Multiple benefics in Kendra"],
    interpretation: "High status, prosperity, king-like position, and all-round success.",
    lifeAreas: ["Status", "Prosperity", "Leadership", "Overall Success"],
  },
  {
    code: "SHUBHA_KARTARI",
    name: "Shubha Kartari Yoga",
    alternativeNames: ["Benefic Hemming"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "A house/planet hemmed between benefics (Jupiter, Venus, Mercury, waxing Moon) on both sides. Protects and enhances the house/planet.",
    classicalReferences: [
      { text: "BPHS", chapter: "31", verse: "15-16", note: "Benefic hemming" },
      { text: "Phaladeepika", chapter: "6", verse: "45", note: "Shubha Kartari" },
      { text: "Saravali", chapter: "35", verse: "22", note: "Shubha Kartari" },
    ],
    conditions: {
      required: ["Benefic planets on both sides of a house/planet"],
      planets: ["Jupiter", "Venus", "Mercury", "Moon"], houses: [],
      specialConditions: ["Hemming configuration"],
    },
    cancellationConditions: ["Malefic aspect on the hemmed house/planet"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Strong benefics", "Multiple benefics", "Hemmed planet/house important"],
    interpretation: "Protection and enhancement of the hemmed house/planet's significations.",
    lifeAreas: ["Protection", "Enhancement", "Support"],
  },
  {
    code: "PAPA_KARTARI",
    name: "Papa Kartari Yoga",
    alternativeNames: ["Malefic Hemming"],
    category: "Planetary Yoga",
    icon: {} as LucideIcon,
    description: "A house/planet hemmed between malefics (Sun, Mars, Saturn, Rahu, Ketu) on both sides. Creates stress and challenges for the house/planet.",
    classicalReferences: [
      { text: "BPHS", chapter: "31", verse: "17-18", note: "Malefic hemming" },
      { text: "Phaladeepika", chapter: "6", verse: "46", note: "Papa Kartari" },
      { text: "Saravali", chapter: "35", verse: "23", note: "Papa Kartari" },
    ],
    conditions: {
      required: ["Malefic planets on both sides of a house/planet"],
      planets: ["Sun", "Mars", "Saturn", "Rahu", "Ketu"], houses: [],
      specialConditions: ["Hemming configuration"],
    },
    cancellationConditions: ["Benefic aspect on the hemmed house/planet", "Hemmed planet strong in own/exalted sign"],
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Multiple malefics", "Hemmed planet weak", "Important house hemmed"],
    interpretation: "Stress, challenges, and obstruction for the hemmed house/planet's significations.",
    lifeAreas: ["Challenges", "Obstruction", "Stress"],
  },
  {
    code: "NABHASA_ASHRAYA",
    name: "Nabhasa Ashraya Yogas",
    alternativeNames: ["Ashraya Yogas", "Nabhasa Yogas - Ashraya"],
    category: "Nabhasa Yoga",
    icon: {} as LucideIcon,
    description: "Nabhasa yogas based on planetary concentrations in movable, fixed, or dual signs. Rajju, Musala, Nala.",
    classicalReferences: [
      { text: "BPHS", chapter: "15", verse: "1-20", note: "Ashraya Yogas" },
      { text: "Phaladeepika", chapter: "8", note: "Nabhasa Yogas - Ashraya" },
      { text: "Saravali", chapter: "12", note: "Ashraya Yogas" },
    ],
    conditions: {
      required: ["Planets concentrated in movable/fixed/dual signs"],
      planets: ["All classical planets"], houses: [],
      specialConditions: ["Rajju: All planets in movable signs", "Musala: All planets in fixed signs", "Nala: All planets in dual signs"],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Concentration strength", "Benefic/malefic nature"],
    interpretation: "Ashraya yogas indicate the native's approach to life — movable (active), fixed (stable), dual (adaptable).",
    lifeAreas: ["Life Approach", "Nature", "Adaptability"],
  },
  {
    code: "NABHASA_DALA",
    name: "Nabhasa Dala Yogas",
    alternativeNames: ["Dala Yogas"],
    category: "Nabhasa Yoga",
    icon: {} as LucideIcon,
    description: "Nabhasa yogas based on planetary distribution between two halves of the zodiac. Maala, Sarpa, etc.",
    classicalReferences: [
      { text: "BPHS", chapter: "15", verse: "21-35", note: "Dala Yogas" },
      { text: "Phaladeepika", chapter: "8", note: "Nabhasa Yogas - Dala" },
      { text: "Saravali", chapter: "12", note: "Dala Yogas" },
    ],
    conditions: {
      required: ["Planets distributed in specific patterns across zodiac halves"],
      planets: ["All classical planets"], houses: [],
      specialConditions: ["Maala: Benefics in Kendra, malefics in Kendra", "Sarpa: All malefics in Kendra, benefics in Panaphara/Apoklima", "Yuga: Alternating benefic/malefic"],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Pattern completeness", "Benefic/malefic balance"],
    interpretation: "Dala yogas show the native's life pattern — garland (success), serpent (struggle), or alternating.",
    lifeAreas: ["Life Pattern", "Fortune Pattern"],
  },
  {
    code: "NABHASA_AKRITI",
    name: "Nabhasa Akriti Yogas",
    alternativeNames: ["Akriti Yogas", "Shape Yogas"],
    category: "Nabhasa Yoga",
    icon: {} as LucideIcon,
    description: "Nabhasa yogas based on geometric patterns formed by planets. Gada, Shakata, Paksha, etc.",
    classicalReferences: [
      { text: "BPHS", chapter: "15", verse: "36-50", note: "Akriti Yogas" },
      { text: "Phaladeepika", chapter: "8", note: "Nabhasa Yogas - Akriti" },
      { text: "Saravali", chapter: "12", note: "Akriti Yogas" },
    ],
    conditions: {
      required: ["Planets form specific geometric patterns"],
      planets: ["All classical planets"], houses: [],
      specialConditions: ["Gada: Planets in two adjacent Kendras", "Shakata: Planets in 1st and 7th only", "Paksha: Planets in 1st-6th or 7th-12th", "Shoola: Planets in all three Kendras of one type"],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Pattern completeness", "Benefic/malefic nature of planets involved"],
    interpretation: "Akriti yogas indicate the structural pattern of life — mace (authority), cart (struggle), etc.",
    lifeAreas: ["Life Structure", "Pattern"],
  },
  {
    code: "NABHASA_SANKHYA",
    name: "Nabhasa Sankhya Yogas",
    alternativeNames: ["Sankhya Yogas", "Number Yogas"],
    category: "Nabhasa Yoga",
    icon: {} as LucideIcon,
    description: "Nabhasa yogas based on the number of houses occupied by planets. Veena, Damini, Pasha, etc.",
    classicalReferences: [
      { text: "BPHS", chapter: "15", verse: "51-65", note: "Sankhya Yogas" },
      { text: "Phaladeepika", chapter: "8", note: "Nabhasa Yogas - Sankhya" },
      { text: "Saravali", chapter: "12", note: "Sankhya Yogas" },
    ],
    conditions: {
      required: ["Specific number of houses occupied by planets"],
      planets: ["All classical planets"], houses: [],
      specialConditions: ["Veena: 7 houses occupied", "Damini: 6 houses", "Pasha: 5 houses", "Kedara: 4 houses", "Shula: 3 houses", "Yuga: 2 houses", "Gola: 1 house"],
    },
    calculationSupported: true,
    implementationStatus: "implemented",
    strengthFactors: ["Number of houses", "Benefic concentration"],
    interpretation: "Sankhya yogas show the spread of planetary energy — concentrated (intense) or distributed (varied).",
    lifeAreas: ["Energy Distribution", "Life Spread"],
  },
];

export function getYogaCatalogEntry(code: string): YogaCatalogEntry | undefined {
  return YOGA_CATALOG.find((y) => y.code === code);
}

export function getYogasByCategory(category: YogaCatalogEntry["category"]): YogaCatalogEntry[] {
  return YOGA_CATALOG.filter((y) => y.category === category);
}

export function getImplementedYogas(): YogaCatalogEntry[] {
  return YOGA_CATALOG.filter((y) => y.calculationSupported && y.implementationStatus === "implemented");
}

export function getYogaCategories(): YogaCatalogEntry["category"][] {
  return [...new Set(YOGA_CATALOG.map((y) => y.category))];
}

export const YOGA_CATEGORY_ORDER: YogaCatalogEntry["category"][] = [
  "Raja Yoga",
  "Dhana Yoga",
  "Pancha Mahapurusha",
  "Lunar Yoga",
  "Solar Yoga",
  "Nabhasa Yoga",
  "Planetary Yoga",
  "Other",
];