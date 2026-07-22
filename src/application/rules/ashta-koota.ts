import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";

export type GunaItem = {
  koota: string;
  score: number;
  max: number;
  note: string;
  /** Subtle visual cue for UI */
  emoji?: string;
  /** Extra label — e.g. Yoni animal pair */
  visual?: string;
};

export type CompatibilityInput = {
  moonSignA: string;
  moonSignB: string;
  nakshatraA: string;
  nakshatraB: string;
  manglikA: string;
  manglikB: string;
};

export type YoniAnimal = {
  name: string;
  emoji: string;
  energy: string;
};

/** Classical nakshatra → Yoni animal mapping */
const YONI_BY_NAKSHATRA: YoniAnimal[] = [
  { name: "Horse", emoji: "🐴", energy: "Swift & pioneering" }, // Ashwini
  { name: "Elephant", emoji: "🐘", energy: "Steady & enduring" }, // Bharani
  { name: "Sheep", emoji: "🐑", energy: "Gentle & protective" }, // Krittika
  { name: "Serpent", emoji: "🐍", energy: "Intense & magnetic" }, // Rohini
  { name: "Serpent", emoji: "🐍", energy: "Curious & searching" }, // Mrigashira
  { name: "Dog", emoji: "🐕", energy: "Loyal & fierce" }, // Ardra
  { name: "Cat", emoji: "🐈", energy: "Independent & soft" }, // Punarvasu
  { name: "Goat", emoji: "🐐", energy: "Nurturing & sure-footed" }, // Pushya
  { name: "Cat", emoji: "🐈", energy: "Intuitive & private" }, // Ashlesha
  { name: "Rat", emoji: "🐀", energy: "Resourceful & quick" }, // Magha
  { name: "Rat", emoji: "🐀", energy: "Playful & social" }, // Purva Phalguni
  { name: "Cow", emoji: "🐄", energy: "Grounded & giving" }, // Uttara Phalguni
  { name: "Buffalo", emoji: "🐃", energy: "Strong & skilled" }, // Hasta
  { name: "Tiger", emoji: "🐅", energy: "Bold & creative" }, // Chitra
  { name: "Buffalo", emoji: "🐃", energy: "Independent & airy" }, // Swati
  { name: "Tiger", emoji: "🐅", energy: "Goal-driven & vivid" }, // Vishakha
  { name: "Deer", emoji: "🦌", energy: "Sensitive & devoted" }, // Anuradha
  { name: "Deer", emoji: "🦌", energy: "Protective & deep" }, // Jyeshtha
  { name: "Dog", emoji: "🐕", energy: "Investigative & bold" }, // Mula
  { name: "Monkey", emoji: "🐒", energy: "Adaptive & lively" }, // Purva Ashadha
  { name: "Mongoose", emoji: "🦡", energy: "Courageous & clear" }, // Uttara Ashadha
  { name: "Monkey", emoji: "🐒", energy: "Wise & connecting" }, // Shravana
  { name: "Lion", emoji: "🦁", energy: "Proud & rhythmic" }, // Dhanishta
  { name: "Horse", emoji: "🐴", energy: "Visionary & free" }, // Shatabhisha
  { name: "Lion", emoji: "🦁", energy: "Fiery & purposeful" }, // Purva Bhadrapada
  { name: "Cow", emoji: "🐄", energy: "Calm & compassionate" }, // Uttara Bhadrapada
  { name: "Elephant", emoji: "🐘", energy: "Complete & nurturing" }, // Revati
];

/** Same-animal friend pairs / enemies simplified for harmony language */
const YONI_FRIENDS: Record<string, string[]> = {
  Horse: ["Horse", "Sheep"],
  Elephant: ["Elephant", "Sheep"],
  Sheep: ["Sheep", "Horse", "Elephant", "Cow"],
  Serpent: ["Serpent"],
  Dog: ["Dog"],
  Cat: ["Cat"],
  Goat: ["Goat", "Monkey"],
  Rat: ["Rat"],
  Cow: ["Cow", "Sheep", "Tiger"],
  Buffalo: ["Buffalo"],
  Tiger: ["Tiger", "Cow"],
  Deer: ["Deer", "Dog"],
  Monkey: ["Monkey", "Goat", "Sheep"],
  Mongoose: ["Mongoose"],
  Lion: ["Lion", "Elephant"],
};

export function yoniAnimalForNakshatra(nakshatra: string): YoniAnimal {
  const idx = NAKSHATRAS.indexOf(nakshatra as (typeof NAKSHATRAS)[number]);
  return YONI_BY_NAKSHATRA[idx >= 0 ? idx : 0] ?? YONI_BY_NAKSHATRA[0]!;
}

function yoniPairScore(a: YoniAnimal, b: YoniAnimal): number {
  if (a.name === b.name) return 4;
  if (YONI_FRIENDS[a.name]?.includes(b.name) || YONI_FRIENDS[b.name]?.includes(a.name)) return 3;
  // Soft opposition patterns (classical-inspired simplifications)
  const opposed = new Set([
    "Horse|Buffalo",
    "Elephant|Lion",
    "Cat|Rat",
    "Dog|Deer",
    "Serpent|Mongoose",
    "Tiger|Cow",
  ]);
  const key = [a.name, b.name].sort().join("|");
  if (opposed.has(key)) return 1;
  return 2;
}

function signIndex(sign: string): number {
  const idx = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return idx >= 0 ? idx : 0;
}

function nakIndex(name: string): number {
  const idx = NAKSHATRAS.indexOf(name as (typeof NAKSHATRAS)[number]);
  return idx >= 0 ? idx : 0;
}

/** Classical-inspired deterministic Ashta Koota scoring (rule engine — not AI). */
export function scoreAshtaKoota(input: CompatibilityInput): {
  gunaBreakdown: GunaItem[];
  totalGuna: number;
  maxGuna: number;
  nadiDosha: boolean;
  bhakootDosha: boolean;
  manglikCompatibility: string;
  overallScore: number;
  strengths: string[];
  challenges: string[];
  yoni: { you: YoniAnimal; them: YoniAnimal; score: number; harmony: string };
} {
  const sA = signIndex(input.moonSignA);
  const sB = signIndex(input.moonSignB);
  const nA = nakIndex(input.nakshatraA);
  const nB = nakIndex(input.nakshatraB);
  const diff = Math.abs(sA - sB);
  const circ = Math.min(diff, 12 - diff);

  const varnaRank = [1, 2, 3, 4] as const;
  const varnaOf = (i: number) => varnaRank[i % 4] ?? 1;
  const varnaScore = varnaOf(sA) >= varnaOf(sB) ? 1 : 0;

  const vashyaScore = circ <= 3 ? 2 : circ <= 5 ? 1 : 0;

  const taraCount = ((nB - nA + 27) % 27) + 1;
  const taraGroup = ((taraCount - 1) % 9) + 1;
  const taraScore = [1, 2, 4, 6, 8, 9].includes(taraGroup)
    ? 3
    : taraGroup === 3 || taraGroup === 5
      ? 1.5
      : 0;

  const yoniA = yoniAnimalForNakshatra(input.nakshatraA);
  const yoniB = yoniAnimalForNakshatra(input.nakshatraB);
  const yoniScore = yoniPairScore(yoniA, yoniB);
  const yoniHarmony =
    yoniScore >= 4
      ? "Same instinctive nature — natural physical ease"
      : yoniScore >= 3
        ? "Friendly energies — warm attraction potential"
        : yoniScore >= 2
          ? "Different instincts — curiosity with patience"
          : "Contrasting energies — mindful intimacy needed";

  const lords = [
    "Mars",
    "Venus",
    "Mercury",
    "Moon",
    "Sun",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Saturn",
    "Jupiter",
  ];
  const lordA = lords[sA] ?? "Mars";
  const lordB = lords[sB] ?? "Mars";
  const friends: Record<string, string[]> = {
    Sun: ["Moon", "Mars", "Jupiter"],
    Moon: ["Sun", "Mercury"],
    Mars: ["Sun", "Moon", "Jupiter"],
    Mercury: ["Sun", "Venus"],
    Jupiter: ["Sun", "Moon", "Mars"],
    Venus: ["Mercury", "Saturn"],
    Saturn: ["Mercury", "Venus"],
  };
  const grahaScore =
    lordA === lordB
      ? 5
      : (friends[lordA]?.includes(lordB) ?? false)
        ? 4
        : (friends[lordB]?.includes(lordA) ?? false)
          ? 3
          : 1;

  const gana = (i: number) => (i % 3 === 0 ? "D" : i % 3 === 1 ? "M" : "R");
  const gA = gana(nA);
  const gB = gana(nB);
  const ganaScore =
    gA === gB ? 6 : (gA === "D" && gB === "M") || (gA === "M" && gB === "D") ? 5 : 1;
  const ganaLabel =
    gA === "D" && gB === "D"
      ? "Deva ↔ Deva"
      : gA === "M" && gB === "M"
        ? "Manushya ↔ Manushya"
        : gA === "R" && gB === "R"
          ? "Rakshasa ↔ Rakshasa"
          : `${gA === "D" ? "Deva" : gA === "M" ? "Manushya" : "Rakshasa"} ↔ ${gB === "D" ? "Deva" : gB === "M" ? "Manushya" : "Rakshasa"}`;

  const bhakootHostile = circ === 2 || circ === 5 || circ === 6;
  const bhakootScore = bhakootHostile ? 0 : 7;
  const bhakootDosha = bhakootHostile;

  const nadiA = nA % 3;
  const nadiB = nB % 3;
  const nadiDosha = nadiA === nadiB;
  const nadiScore = nadiDosha ? 0 : 8;

  const gunaBreakdown: GunaItem[] = [
    {
      koota: "Varna",
      score: varnaScore,
      max: 1,
      note: "Spiritual temperament alignment.",
      emoji: "🕉️",
    },
    {
      koota: "Vashya",
      score: vashyaScore,
      max: 2,
      note: "Mutual influence balance.",
      emoji: "🤝",
    },
    {
      koota: "Tara",
      score: taraScore,
      max: 3,
      note: "Birth-star harmony.",
      emoji: "⭐",
    },
    {
      koota: "Yoni",
      score: yoniScore,
      max: 4,
      note: `${yoniHarmony}. ${yoniA.name} (${yoniA.energy}) with ${yoniB.name} (${yoniB.energy}).`,
      emoji: `${yoniA.emoji}${yoniB.emoji}`,
      visual: `${yoniA.emoji} ${yoniA.name}  ↔  ${yoniB.emoji} ${yoniB.name}`,
    },
    {
      koota: "Graha Maitri",
      score: grahaScore,
      max: 5,
      note: "Mental friendship of Moon lords.",
      emoji: "🌙",
    },
    {
      koota: "Gana",
      score: ganaScore,
      max: 6,
      note: `Temperament pairing — ${ganaLabel}.`,
      emoji: "🎭",
      visual: ganaLabel,
    },
    {
      koota: "Bhakoot",
      score: bhakootScore,
      max: 7,
      note: bhakootDosha ? "Relative Moon signs need care." : "Relative Moon signs supportive.",
      emoji: "🌕",
    },
    {
      koota: "Nadi",
      score: nadiScore,
      max: 8,
      note: nadiDosha ? "Same Nadi indicated." : "No Nadi dosha indicated.",
      emoji: nadiDosha ? "⚠️" : "💚",
    },
  ];

  const totalGuna = Number(gunaBreakdown.reduce((sum, item) => sum + item.score, 0).toFixed(1));

  let manglikCompatibility = "Compatible";
  if (input.manglikA === "MANGLIK" && input.manglikB === "NON_MANGLIK") {
    manglikCompatibility = "Needs review";
  } else if (input.manglikA === "MANGLIK" && input.manglikB === "MANGLIK") {
    manglikCompatibility = "Both Manglik — traditionally neutralizing";
  } else if (input.manglikA === "PARTIAL" || input.manglikB === "PARTIAL") {
    manglikCompatibility = "Partial Manglik — soft review";
  }

  const strengths: string[] = [];
  const challenges: string[] = [];
  for (const item of gunaBreakdown) {
    if (item.score / item.max >= 0.75) strengths.push(`${item.koota} is strong`);
    if (item.score === 0) challenges.push(`${item.koota} needs attention`);
  }
  if (manglikCompatibility !== "Compatible") challenges.push(`Manglik: ${manglikCompatibility}`);

  const overallScore = Math.round((totalGuna / 36) * 100);

  return {
    gunaBreakdown,
    totalGuna,
    maxGuna: 36,
    nadiDosha,
    bhakootDosha,
    manglikCompatibility,
    overallScore,
    strengths,
    challenges,
    yoni: {
      you: yoniA,
      them: yoniB,
      score: yoniScore,
      harmony: yoniHarmony,
    },
  };
}

export function pairKey(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join(":");
}
