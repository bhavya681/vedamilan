import { NAKSHATRAS, SIGNS, VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS } from "./vedic-constants";

export type NakshatraDetail = {
  deity: string;
  symbol: string;
  gana: string;
  yoni: string;
  element: string;
  motivation: string;
  qualities: string[];
  effect: string;
};

export const PADA_PURUSHARTHA = ["Dharma", "Artha", "Kama", "Moksha"] as const;

export const NAKSHATRA_DETAILS: Record<string, NakshatraDetail> = {
  Ashwini: {
    deity: "Ashwini Kumaras",
    symbol: "Horse head",
    gana: "Deva",
    yoni: "Horse",
    element: "Earth",
    motivation: "Dharma",
    qualities: ["Swift", "Healing", "Pioneering"],
    effect:
      "Grants speed, healing ability, and initiative. Favors new beginnings and compassionate action.",
  },
  Bharani: {
    deity: "Yama",
    symbol: "Womb / Elephant",
    gana: "Manushya",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Nurturing", "Disciplined", "Transformative"],
    effect:
      "Carries the weight of restraint and creative nurture. Can manifest as intense responsibility or artistic purification.",
  },
  Krittika: {
    deity: "Agni",
    symbol: "Flame / Axe",
    gana: "Rakshasa",
    yoni: "Goat",
    element: "Fire",
    motivation: "Kama",
    qualities: ["Fiery", "Critical", "Purifying"],
    effect:
      "Agni burns away impurity. Sharp intellect, but may incline toward criticism or inner friction.",
  },
  Rohini: {
    deity: "Brahma",
    symbol: "Chariot / Temple",
    gana: "Manushya",
    yoni: "Serpent",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Creative", "Grounded", "Fertile"],
    effect:
      "Most fertile nakshatra. Supports growth, beauty, material prosperity, and creative expression.",
  },
  Mrigashira: {
    deity: "Soma",
    symbol: "Deer head",
    gana: "Deva",
    yoni: "Serpent",
    element: "Air",
    motivation: "Kama",
    qualities: ["Curious", "Gentle", "Seeking"],
    effect:
      "Seeks, researches, and wanders. Favors discovery, communication, and subtle intuition.",
  },
  Ardra: {
    deity: "Rudra",
    symbol: "Teardrop / Diamond",
    gana: "Manushya",
    yoni: "Dog",
    element: "Air",
    motivation: "Kama",
    qualities: ["Intense", "Transformative", "Stormy"],
    effect: "Storms clear the sky. Can bring upheaval followed by profound clarity and reform.",
  },
  Punarvasu: {
    deity: "Aditi",
    symbol: "Bow / Quiver",
    gana: "Deva",
    yoni: "Cat",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Renewing", "Nurturing", "Adaptable"],
    effect:
      "Returns and restores. Favors return of lost things, renewed energy, and adaptable wisdom.",
  },
  Pushya: {
    deity: "Brihaspati",
    symbol: "Lotus / Arrow",
    gana: "Deva",
    yoni: "Goat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Nourishing", "Protective", "Wise"],
    effect:
      "Most auspicious for nourishment, learning, and spiritual nourishment. Strengthens dharma.",
  },
  Ashlesha: {
    deity: "Nagas",
    symbol: "Coiled serpent",
    gana: "Rakshasa",
    yoni: "Cat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Mysterious", "Clinging", "Wise"],
    effect:
      "Kundalini-like intensity. Can bring wisdom through mystery, but also warns against poison or entanglement.",
  },
  Magha: {
    deity: "Pitris",
    symbol: "Royal throne",
    gana: "Rakshasa",
    yoni: "Rat",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Dignified", "Lineage", "Ambitious"],
    effect: "Honors ancestors and authority. Favors leadership, legacy, and dignified power.",
  },
  "Purva Phalguni": {
    deity: "Aryaman",
    symbol: "Blanket / Hammock",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Warm", "Social", "Creative"],
    effect:
      "Supports marriage, creativity, and social bonds. Favors enjoyment and artistic expression.",
  },
  "Uttara Phalguni": {
    deity: "Bhaga",
    symbol: "Small bed / Couch",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Stable", "Loyal", "Supportive"],
    effect:
      "Firm in friendship and partnership. Favors steady growth, loyalty, and lasting unions.",
  },
  Hasta: {
    deity: "Savitar",
    symbol: "Hand / Conch",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Kama",
    qualities: ["Skillful", "Clever", "Serviceful"],
    effect:
      "Skill of the hands and mind. Favors craftsmanship, healing touch, and practical magic.",
  },
  Chitra: {
    deity: "Tvastar",
    symbol: "Bright jewel / Pearl",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Earth",
    motivation: "Kama",
    qualities: ["Artistic", "Charming", "Vain"],
    effect: "Architect of beauty. Favors art, design, and charisma, but warns against vanity.",
  },
  Swati: {
    deity: "Vayu",
    symbol: "Coral / Sword",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Dharma",
    qualities: ["Independent", "Flexible", "Diplomatic"],
    effect: "Wind of change. Favors independence, adaptability, and diplomatic skill.",
  },
  Vishakha: {
    deity: "Indra-Agni",
    symbol: "Archway / Triumphal gate",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Air",
    motivation: "Artha",
    qualities: ["Determined", "Goal-oriented", "Intense"],
    effect:
      "Triumphant but tested. Strong drive for achievement; may face obstacles before success.",
  },
  Anuradha: {
    deity: "Mitra",
    symbol: "Lotus / Staff",
    gana: "Deva",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Devoted", "Loyal", "Balanced"],
    effect:
      "Friendship and devotion. Favors loyalty, balanced relationships, and following one's path.",
  },
  Jyeshtha: {
    deity: "Indra",
    symbol: "Earring / Umbrella",
    gana: "Rakshasa",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Senior", "Protective", "Responsible"],
    effect: "Senior, protective, and responsible. May carry burdens of leadership or elder duty.",
  },
  Mula: {
    deity: "Nirriti",
    symbol: "Bunch of roots / Elephant goad",
    gana: "Rakshasa",
    yoni: "Dog",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Rooted", "Investigative", "Destructive"],
    effect:
      "Destroys to rebuild at the root. Favors deep research, occult knowledge, and radical transformation.",
  },
  "Purva Ashadha": {
    deity: "Aja Ekapada",
    symbol: "Back legs of cot / Fan",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Initiating", "Bold", "Energetic"],
    effect:
      "Invincible beginning. Favors early vigor, purification through effort, and invincible resolve.",
  },
  "Uttara Ashadha": {
    deity: "Ahir Budhnya",
    symbol: "Small bed / Snake",
    gana: "Manushya",
    yoni: "Mongoose",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Patient", "Loyal", "Organized"],
    effect: "Slow but permanent victory. Favors patience, integrity, and lasting achievement.",
  },
  Shravana: {
    deity: "Vishnu",
    symbol: "Ear / Footprint",
    gana: "Deva",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Learning", "Listening", "Travel"],
    effect: "Sacred hearing and learning. Favors teaching, travel for wisdom, and dharma.",
  },
  Dhanishta: {
    deity: "Vasus",
    symbol: "Drum / Flute",
    gana: "Rakshasa",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Musical", "Generous", "Rhythmic"],
    effect: "Rhythm of prosperity. Favors music, wealth, and rhythmical skill.",
  },
  Shatabhisha: {
    deity: "Varuna",
    symbol: "Circle / Thousand stars",
    gana: "Rakshasa",
    yoni: "Horse",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Healing", "Mystical", "Independent"],
    effect:
      "Cosmic healing and secrecy. Favors medicine, mysticism, and independent healing paths.",
  },
  "Purva Bhadrapada": {
    deity: "Aja Ekapada",
    symbol: "Sword / Two legs of cot",
    gana: "Manushya",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Fierce", "Passionate", "Courageous"],
    effect:
      "Fiery sacrifice. Favors intense spirituality, transformation through fire, and courage.",
  },
  "Uttara Bhadrapada": {
    deity: "Ahir Budhnya",
    symbol: "Serpent / Cot",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Compassionate", "Wise", "Serviceful"],
    effect: "Deep compassion and wisdom. Favors moksha, service, and secret spiritual knowledge.",
  },
  Revati: {
    deity: "Pushan",
    symbol: "Fish / Drum",
    gana: "Deva",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Nurturing", "Protective", "Abundant"],
    effect:
      "Guides the journey home. Favors safe travels, nourishment, and abundance at life's transitions.",
  },
};

export function resolveNakshatraName(name: string | undefined | null): string {
  const clean = name?.trim() || "";
  if (clean && clean in NAKSHATRA_DETAILS) return clean;
  const first = clean.split(" ")[0] || "";
  if (first && first in NAKSHATRA_DETAILS) return first;
  const match = NAKSHATRAS.find((n) => n.toLowerCase() === clean.toLowerCase());
  return match || "Ashwini";
}

export function nakshatraIndexOf(name: string | undefined | null): number {
  const resolved = resolveNakshatraName(name);
  const index = NAKSHATRAS.indexOf(resolved as (typeof NAKSHATRAS)[number]);
  return index >= 0 ? index : 0;
}

export function vimshottariLordOf(name: string | undefined | null): string {
  return VIMSHOTTARI_LORDS[nakshatraIndexOf(name) % 9] || "Ketu";
}

export function vimshottariYearsOf(name: string | undefined | null): number {
  const lord = vimshottariLordOf(name) as keyof typeof VIMSHOTTARI_YEARS;
  return VIMSHOTTARI_YEARS[lord] ?? 0;
}

export function nakshatraNadi(name: string | undefined | null): "Adi" | "Madhya" | "Antya" {
  return (["Adi", "Madhya", "Antya"] as const)[nakshatraIndexOf(name) % 3] ?? "Adi";
}

export function padaNavamsa(
  name: string | undefined | null,
  pada: number | undefined | null,
): string {
  const padaIndex = nakshatraIndexOf(name) * 4 + Math.min(4, Math.max(1, pada || 1)) - 1;
  return SIGNS[padaIndex % 12] || "Aries";
}

export function padaPurushartha(pada: number | undefined | null): string {
  return PADA_PURUSHARTHA[Math.min(4, Math.max(1, pada || 1)) - 1] || "Dharma";
}

export function getNakshatraDetails(name: string | undefined | null): NakshatraDetail {
  const resolved = resolveNakshatraName(name);
  return NAKSHATRA_DETAILS[resolved] || NAKSHATRA_DETAILS.Ashwini!;
}
