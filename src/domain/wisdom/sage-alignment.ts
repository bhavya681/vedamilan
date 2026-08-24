/**
 * Deterministic sage suggestions from life need + already-computed chart tags.
 * Does not calculate astrology. Chart fields are read-only facts from the engine.
 */

import { getWisdomGuide, listWisdomGuides, type WisdomGuide } from "@/domain/wisdom/guides";

export type LifeNeedId = "relationship" | "career" | "inner" | "duty" | "inquiry" | "astrology";

export type AlignmentContext = {
  hasChart: boolean;
  moonSign?: string;
  nakshatra?: string;
  moonLord?: string;
  gana?: string;
  varna?: string;
  currentMaha?: string | null;
  currentAntar?: string | null;
  yogaCategories?: string[];
  manglik?: string | null;
  profession?: string | null;
  maritalStatus?: string | null;
};

export type SageSuggestion = {
  guideId: string;
  score: number;
  reasons: string[];
};

export const LIFE_NEEDS: Array<{ id: LifeNeedId; label: string; hint: string }> = [
  { id: "relationship", label: "Relationship", hint: "Partnership, speech, family warmth" },
  { id: "career", label: "Work & decisions", hint: "Duty in the world, strategy" },
  { id: "inner", label: "Inner calm", hint: "Peace, fear, the mind" },
  { id: "duty", label: "Family duty", hint: "Parents, vows, responsibility" },
  { id: "inquiry", label: "Self-inquiry", hint: "Meaning, witness, knowledge" },
  { id: "astrology", label: "Jyotisha reflection", hint: "Time, alignment, self-knowledge" },
];

const NEED_GUIDES: Record<LifeNeedId, string[]> = {
  relationship: ["krishna", "vidura", "vasistha", "valmiki", "narada", "thiruvalluvar", "atri"],
  career: [
    "chanakya",
    "brihaspati",
    "vishwamitra",
    "agastya",
    "swami-vivekananda",
    "thiruvalluvar",
  ],
  inner: [
    "patanjali",
    "ramana-maharshi",
    "yajnavalkya",
    "ashtavakra",
    "paramahansa-yogananda",
    "kapila",
  ],
  duty: ["bhishma", "vyasa", "vasistha", "tulsidas", "gautama", "vidura"],
  inquiry: [
    "yajnavalkya",
    "ashtavakra",
    "adi-shankaracharya",
    "ramana-maharshi",
    "kapila",
    "sri-aurobindo",
  ],
  astrology: ["parashara", "bhrigu", "brihaspati", "vasistha", "vyasa"],
};

const DASHA_GUIDES: Record<string, string[]> = {
  Sun: ["swami-vivekananda", "brihaspati", "krishna"],
  Moon: ["vasistha", "valmiki", "narada"],
  Mars: ["vishwamitra", "agastya", "chanakya"],
  Mercury: ["narada", "brihaspati", "thiruvalluvar"],
  Jupiter: ["vyasa", "parashara", "yajnavalkya", "brihaspati"],
  Venus: ["mirabai", "krishna", "valmiki"],
  Saturn: ["patanjali", "chanakya", "gautama", "bhishma"],
  Rahu: ["vishwamitra", "kabir", "sri-aurobindo"],
  Ketu: ["ashtavakra", "ramana-maharshi", "kapila"],
};

const GANA_GUIDES: Record<string, string[]> = {
  Deva: ["patanjali", "ramana-maharshi", "yajnavalkya"],
  Manushya: ["vidura", "vasistha", "thiruvalluvar"],
  Rakshasa: ["vishwamitra", "chanakya", "agastya"],
};

const VARNA_GUIDES: Record<string, string[]> = {
  Brahmin: ["yajnavalkya", "adi-shankaracharya", "vyasa"],
  Kshatriya: ["bhishma", "krishna", "chanakya"],
  Vaishya: ["chanakya", "thiruvalluvar", "agastya"],
  Shudra: ["swami-vivekananda", "kabir", "tulsidas"],
};

const YOGA_NEED: Record<string, LifeNeedId> = {
  MARRIAGE: "relationship",
  CAREER: "career",
  WEALTH: "career",
  HEALTH: "inner",
  GENERAL: "inquiry",
};

export function inferDefaultNeed(ctx: AlignmentContext): LifeNeedId {
  const yogas = ctx.yogaCategories ?? [];
  if (yogas.includes("MARRIAGE") || ctx.manglik === "MANGLIK" || ctx.manglik === "PARTIAL") {
    return "relationship";
  }
  if (yogas.includes("CAREER") || yogas.includes("WEALTH") || Boolean(ctx.profession)) {
    return "career";
  }
  const dasha = ctx.currentMaha || "";
  if (dasha === "Ketu" || dasha === "Jupiter") return "inquiry";
  if (dasha === "Saturn" || dasha === "Rahu") return "inner";
  if (dasha === "Mars" || dasha === "Sun") return "career";
  if (ctx.gana === "Deva") return "inner";
  if (ctx.gana === "Rakshasa") return "career";
  if (ctx.maritalStatus === "NEVER_MARRIED") return "relationship";
  return "duty";
}

function addScore(
  scores: Map<string, { score: number; reasons: Set<string> }>,
  guideId: string,
  points: number,
  reason: string,
) {
  if (!getWisdomGuide(guideId)) return;
  const current = scores.get(guideId) ?? { score: 0, reasons: new Set<string>() };
  current.score += points;
  if (reason) current.reasons.add(reason);
  scores.set(guideId, current);
}

export function suggestSages(ctx: AlignmentContext, need: LifeNeedId, limit = 3): SageSuggestion[] {
  const scores = new Map<string, { score: number; reasons: Set<string> }>();
  const needLabel = LIFE_NEEDS.find((item) => item.id === need)?.label || "this need";

  for (const [index, guideId] of (NEED_GUIDES[need] ?? []).entries()) {
    addScore(scores, guideId, 8 - Math.min(index, 5), `Strong for ${needLabel.toLowerCase()}`);
  }

  const dasha = ctx.currentMaha || "";
  for (const [index, guideId] of (DASHA_GUIDES[dasha] ?? []).entries()) {
    addScore(
      scores,
      guideId,
      5 - Math.min(index, 3),
      `${dasha} Mahadasha — traditionally a time for this counsel`,
    );
  }

  const antar = ctx.currentAntar || "";
  if (antar && antar !== dasha) {
    for (const guideId of (DASHA_GUIDES[antar] ?? []).slice(0, 2)) {
      addScore(scores, guideId, 2, `${antar} Antardasha — a supporting theme`);
    }
  }

  const gana = ctx.gana || "";
  for (const guideId of GANA_GUIDES[gana] ?? []) {
    addScore(scores, guideId, 3, `${gana} gana — temperament match`);
  }

  const varna = ctx.varna || "";
  for (const guideId of VARNA_GUIDES[varna] ?? []) {
    addScore(scores, guideId, 2, `${varna} varna — path of expression`);
  }

  for (const category of ctx.yogaCategories ?? []) {
    const yogaNeed = YOGA_NEED[category];
    if (!yogaNeed) continue;
    const first = NEED_GUIDES[yogaNeed]?.[0];
    if (first) addScore(scores, first, 2, `${category.toLowerCase()} yoga theme in the chart`);
  }

  if (ctx.moonLord) {
    const lordGuides = DASHA_GUIDES[ctx.moonLord] ?? [];
    const first = lordGuides[0];
    if (first) {
      addScore(scores, first, 2, `Moon lord ${ctx.moonLord} — emotional style`);
    }
  }

  if (!ctx.hasChart) {
    addScore(scores, "vasistha", 1, "A steady starting counsellor");
    addScore(scores, "krishna", 1, "Clear on action and relationship");
  } else {
    addScore(scores, "parashara", 1, "Jyotisha reflection — not prediction");
  }

  const ranked = [...scores.entries()]
    .map(([guideId, value]) => ({
      guideId,
      score: value.score,
      reasons: [...value.reasons].slice(0, 2),
    }))
    .sort((a, b) => b.score - a.score || a.guideId.localeCompare(b.guideId));

  const picked: SageSuggestion[] = [];
  for (const row of ranked) {
    if (picked.length >= limit) break;
    picked.push(row);
  }

  if (picked.length < limit) {
    for (const guide of listWisdomGuides()) {
      if (picked.some((row) => row.guideId === guide.id)) continue;
      picked.push({
        guideId: guide.id,
        score: 1,
        reasons: ["From the sabha library"],
      });
      if (picked.length >= limit) break;
    }
  }

  return picked;
}

export function suggestionGuides(
  suggestions: SageSuggestion[],
): Array<SageSuggestion & { guide: WisdomGuide }> {
  return suggestions.flatMap((row) => {
    const guide = getWisdomGuide(row.guideId);
    return guide ? [{ ...row, guide }] : [];
  });
}
