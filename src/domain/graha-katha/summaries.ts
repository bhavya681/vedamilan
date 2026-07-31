/**
 * Lightweight library cards — keeps the Graha Katha hub out of the full story/houses bundle.
 */

import type { GrahaAccent, GrahaId } from "@/domain/graha-katha/types";

export type GrahaSummary = {
  id: GrahaId;
  sanskritName: string;
  englishName: string;
  engineName: string;
  archetype: string;
  essence: string;
  accent: GrahaAccent;
  tags: string[];
  searchKeywords: string[];
};

/** Card-level data only (~few KB). Full chapters/houses load per planet via loaders. */
export const GRAHA_SUMMARIES: GrahaSummary[] = [
  {
    id: "surya",
    sanskritName: "सूर्य",
    englishName: "Sun",
    engineName: "Sun",
    archetype: "The Soul & Inner Authority",
    essence: "Lead without losing your integrity.",
    accent: "gold",
    tags: ["atma", "authority", "father", "leadership", "integrity", "power"],
    searchKeywords: [
      "sun",
      "surya",
      "father",
      "authority",
      "leadership",
      "atma",
      "government",
      "integrity",
    ],
  },
  {
    id: "chandra",
    sanskritName: "चन्द्र",
    englishName: "Moon",
    engineName: "Moon",
    archetype: "The Mind & Emotional World",
    essence: "Feel fully — then choose what nourishes.",
    accent: "ivory",
    tags: ["mind", "emotions", "mother", "nakshatra", "nourishment", "security"],
    searchKeywords: [
      "moon",
      "chandra",
      "mind",
      "emotions",
      "mother",
      "nakshatra",
      "rohini",
      "security",
    ],
  },
  {
    id: "mangal",
    sanskritName: "मंगल",
    englishName: "Mars",
    engineName: "Mars",
    archetype: "The Warrior & Willpower",
    essence: "Courage with conscience — action that protects life.",
    accent: "saffron",
    tags: ["courage", "action", "will", "siblings", "land", "crisis"],
    searchKeywords: ["mars", "mangal", "courage", "warrior", "land", "siblings", "anger", "action"],
  },
  {
    id: "budha",
    sanskritName: "बुध",
    englishName: "Mercury",
    engineName: "Mercury",
    archetype: "The Messenger & Intelligence",
    essence: "Curiosity that connects — mind as bridge.",
    accent: "cosmic",
    tags: ["intelligence", "communication", "business", "youth", "learning", "strategy"],
    searchKeywords: [
      "mercury",
      "budha",
      "communication",
      "business",
      "intelligence",
      "learning",
      "speech",
    ],
  },
  {
    id: "guru",
    sanskritName: "गुरु / बृहस्पति",
    englishName: "Jupiter",
    engineName: "Jupiter",
    archetype: "The Teacher & Wisdom",
    essence: "Grow through meaning — expand what is true.",
    accent: "gold",
    tags: ["wisdom", "dharma", "teachers", "expansion", "children", "grace"],
    searchKeywords: [
      "jupiter",
      "guru",
      "brihaspati",
      "wisdom",
      "dharma",
      "teachers",
      "children",
      "expansion",
    ],
  },
  {
    id: "shukra",
    sanskritName: "शुक्र",
    englishName: "Venus",
    engineName: "Venus",
    archetype: "The Guide of Desire, Love & Refinement",
    essence: "Desire refined into devotion, beauty, and healing.",
    accent: "rose",
    tags: ["love", "beauty", "relationships", "art", "healing", "pleasure", "matchmaking"],
    searchKeywords: [
      "venus",
      "shukra",
      "love",
      "marriage",
      "beauty",
      "relationships",
      "art",
      "shukracharya",
      "compatibility",
    ],
  },
  {
    id: "shani",
    sanskritName: "शनि",
    englishName: "Saturn",
    engineName: "Saturn",
    archetype: "The Teacher of Karma, Discipline & Time",
    essence: "What can you sustain — not only what can you win quickly?",
    accent: "charcoal",
    tags: ["karma", "discipline", "time", "responsibility", "patience", "career"],
    searchKeywords: [
      "saturn",
      "shani",
      "karma",
      "discipline",
      "career",
      "10th house",
      "delay",
      "responsibility",
      "time",
      "remedies",
    ],
  },
  {
    id: "rahu",
    sanskritName: "राहु",
    englishName: "Rahu",
    engineName: "Rahu",
    archetype: "The Force of Desire, Ambition & Expansion",
    essence: "Where Rahu is, desire becomes louder — meet it with awareness.",
    accent: "cosmic",
    tags: ["desire", "ambition", "technology", "unconventional", "illusion", "growth"],
    searchKeywords: [
      "rahu",
      "desire",
      "ambition",
      "technology",
      "illusion",
      "eclipse",
      "foreign",
      "obsession",
    ],
  },
  {
    id: "ketu",
    sanskritName: "केतु",
    englishName: "Ketu",
    engineName: "Ketu",
    archetype: "The Path of Detachment & Liberation",
    essence: "Where Ketu is, the soul may already know what the mind is still learning.",
    accent: "charcoal",
    tags: ["detachment", "spirituality", "past-life", "intuition", "liberation", "moksha"],
    searchKeywords: [
      "ketu",
      "detachment",
      "moksha",
      "past life",
      "spirituality",
      "intuition",
      "ganesha",
      "liberation",
    ],
  },
];

export function listGrahaSummaries(): GrahaSummary[] {
  return GRAHA_SUMMARIES;
}

export function getGrahaSummary(id: string): GrahaSummary | null {
  return GRAHA_SUMMARIES.find((g) => g.id === id) ?? null;
}

export function searchGrahaSummaries(query: string): GrahaSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return GRAHA_SUMMARIES;
  return GRAHA_SUMMARIES.filter((g) => {
    const hay = [
      g.id,
      g.sanskritName,
      g.englishName,
      g.archetype,
      g.essence,
      ...g.tags,
      ...g.searchKeywords,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
