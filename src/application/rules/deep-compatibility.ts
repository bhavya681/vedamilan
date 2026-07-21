import { longitudeToNavamsaSign } from "@/application/horoscope/navamsa";
import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import type { GunaItem } from "./ashta-koota";
import {
  scoreShukraMilan,
  seventhLord,
  type ChartPlanetLite,
  type ShukraMilanResult,
} from "./shukra-milan";

export type AnalysisModule = {
  id: string;
  title: string;
  weight: number;
  observation: string;
  reasoning: string;
  positives: string[];
  challenges: string[];
  manifestation: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  score: number; // 0–100
  confidence: "High" | "Medium" | "Low";
};

export type DeepCompatibilityResult = {
  chartValidation: Record<string, string>;
  modules: AnalysisModule[];
  shukraMilan: ShukraMilanResult;
  categoryScores: Record<string, number>;
  overallScore: number;
  decisionSummary:
    | "Excellent Match"
    | "Very Good Match"
    | "Good Match"
    | "Needs Conscious Effort"
    | "High Challenge"
    | "Not Recommended";
  decisionReason: string;
  topStrengths: string[];
  topChallenges: string[];
  remedies: string[];
  conflicts: Array<{
    topic: string;
    reason: string;
    cause: string;
    example: string;
    solution: string;
  }>;
};

export type DeepChartInput = {
  lagnaSign: string;
  moonSign: string;
  sunSign: string;
  manglikStatus?: string;
  planets: ChartPlanetLite[];
  houseLords?: Record<string, string> | null;
};

const WEIGHTS = {
  personality: 15,
  moon: 15,
  venus: 15,
  seventh: 15,
  d9: 10,
  guna: 10,
  sexual: 5,
  family: 5,
  lifeGoals: 5,
  communication: 5,
  longevity: 5,
} as const;

const WEIGHT_SUM = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

function planet(chart: DeepChartInput, name: string) {
  return chart.planets.find((p) => p.planet === name) || null;
}

function signDistance(a: string, b: string): number {
  const ia = SIGNS.indexOf(a as (typeof SIGNS)[number]);
  const ib = SIGNS.indexOf(b as (typeof SIGNS)[number]);
  if (ia < 0 || ib < 0) return 6;
  const d = Math.abs(ia - ib);
  return Math.min(d, 12 - d);
}

function elementOf(sign: string): "Fire" | "Earth" | "Air" | "Water" {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return (["Fire", "Earth", "Air", "Water"] as const)[i % 4] ?? "Fire";
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function moduleSeverity(score: number): AnalysisModule["severity"] {
  if (score >= 75) return "LOW";
  if (score >= 55) return "MEDIUM";
  return "HIGH";
}

function lagnaLord(lagna: string) {
  return HOUSE_LORDS[lagna as (typeof SIGNS)[number]] ?? "Mars";
}

function navamsaFor(p: ChartPlanetLite | null) {
  if (!p || typeof p.longitude !== "number") return null;
  return longitudeToNavamsaSign(p.longitude);
}

export function scoreDeepCompatibility(input: {
  chartA: DeepChartInput;
  chartB: DeepChartInput;
  gunaBreakdown: GunaItem[];
  totalGuna: number;
  maxGuna: number;
}): DeepCompatibilityResult {
  const { chartA, chartB, gunaBreakdown, totalGuna, maxGuna } = input;
  const moonA = planet(chartA, "Moon");
  const moonB = planet(chartB, "Moon");
  const venusA = planet(chartA, "Venus");
  const venusB = planet(chartB, "Venus");
  const marsA = planet(chartA, "Mars");
  const marsB = planet(chartB, "Mars");
  const mercA = planet(chartA, "Mercury");
  const mercB = planet(chartB, "Mercury");
  const satA = planet(chartA, "Saturn");
  const satB = planet(chartB, "Saturn");
  const jupA = planet(chartA, "Jupiter");
  const jupB = planet(chartB, "Jupiter");

  const shukra = scoreShukraMilan(chartA.planets, chartB.planets);

  const d9LagnaA = navamsaFor({
    planet: "Lagna",
    sign: chartA.lagnaSign,
    house: 1,
    longitude: (SIGNS.indexOf(chartA.lagnaSign as (typeof SIGNS)[number]) * 30 + 15) as number,
  });
  // Prefer actual lagna degree if present via Sun/planets approximation — use Venus/Moon long for D9 Venus/Moon
  const d9VenusA = navamsaFor(venusA);
  const d9VenusB = navamsaFor(venusB);
  const d9LagnaApproxA = navamsaFor(
    venusA
      ? {
          ...venusA,
          planet: "LagnaProxy",
          longitude: SIGNS.indexOf(chartA.lagnaSign as (typeof SIGNS)[number]) * 30,
        }
      : null,
  );
  const d9LagnaApproxB = navamsaFor(
    venusB
      ? {
          ...venusB,
          planet: "LagnaProxy",
          longitude: SIGNS.indexOf(chartB.lagnaSign as (typeof SIGNS)[number]) * 30,
        }
      : null,
  );

  const seventhLordA = seventhLord(chartA.lagnaSign);
  const seventhLordB = seventhLord(chartB.lagnaSign);
  const seventhOccA = chartA.planets.find((p) => p.house === 7);
  const seventhOccB = chartB.planets.find((p) => p.house === 7);

  const chartValidation = {
    "A Ascendant": chartA.lagnaSign,
    "A Moon Sign": chartA.moonSign,
    "A Moon Nakshatra": moonA?.nakshatra || "—",
    "A Venus Sign": venusA?.sign || "—",
    "A D9 Venus": d9VenusA?.sign || "—",
    "A 7th Lord": seventhLordA,
    "B Ascendant": chartB.lagnaSign,
    "B Moon Sign": chartB.moonSign,
    "B Moon Nakshatra": moonB?.nakshatra || "—",
    "B Venus Sign": venusB?.sign || "—",
    "B D9 Venus": d9VenusB?.sign || "—",
    "B 7th Lord": seventhLordB,
  };

  // --- Personality (Lagna / Lagnesh / Moon) ---
  const elemA = elementOf(chartA.lagnaSign);
  const elemB = elementOf(chartB.lagnaSign);
  const lagnaDist = signDistance(chartA.lagnaSign, chartB.lagnaSign);
  const personalityScore = clampScore(
    70 +
      (elemA === elemB
        ? 12
        : ["Fire", "Air"].includes(elemA) && ["Fire", "Air"].includes(elemB)
          ? 8
          : 0) +
      (["Earth", "Water"].includes(elemA) && ["Earth", "Water"].includes(elemB) ? 8 : 0) -
      lagnaDist * 3,
  );
  const personality: AnalysisModule = {
    id: "personality",
    title: "Personality Compatibility",
    weight: WEIGHTS.personality,
    observation: `A Lagna ${chartA.lagnaSign} (${elemA}) with Lagnesh ${lagnaLord(chartA.lagnaSign)}; B Lagna ${chartB.lagnaSign} (${elemB}) with Lagnesh ${lagnaLord(chartB.lagnaSign)}.`,
    reasoning:
      "Lagna shows life approach and decision style; Moon colors emotional expression. Same/supportive elements ease initial rapport; large Lagna distance can mean different pacing.",
    positives: [
      elemA === elemB
        ? "Shared elemental temperament supports recognition"
        : "Distinct temperaments can balance each other when respected",
      `Moon signs ${chartA.moonSign} × ${chartB.moonSign} frame emotional dialogue`,
    ],
    challenges:
      lagnaDist >= 5
        ? [
            "Different life pacing may create early misunderstandings about independence vs togetherness",
          ]
        : ["Minor style differences in leadership and stress response"],
    manifestation:
      "Daily life may show different preferences for social energy, decision speed, and need for solitude — workable when named early.",
    severity: moduleSeverity(personalityScore),
    score: personalityScore,
    confidence: "Medium",
  };

  // --- Moon / Emotional ---
  const moonDist = signDistance(chartA.moonSign, chartB.moonSign);
  const moonScore = clampScore(
    78 - moonDist * 5 + (moonA?.house === 4 || moonB?.house === 4 ? 4 : 0),
  );
  const moonMod: AnalysisModule = {
    id: "moon",
    title: "Emotional Compatibility (Moon)",
    weight: WEIGHTS.moon,
    observation: `Moon A: ${chartA.moonSign} H${moonA?.house ?? "—"} (${moonA?.nakshatra || "—"}); Moon B: ${chartB.moonSign} H${moonB?.house ?? "—"} (${moonB?.nakshatra || "—"}).`,
    reasoning:
      "Moon describes need for peace, attachment style, and emotional language. Closer Moon signs often feel safer; hostile distances need clearer reassurance habits.",
    positives:
      moonDist <= 3
        ? ["Emotional climates are relatively familiar"]
        : ["Growth through complementary emotional skills"],
    challenges:
      moonDist >= 5
        ? ["Different stress responses may feel like distance if not verbalized"]
        : ["Occasional mood mismatch under pressure"],
    manifestation:
      "Conflict repair speed and bedtime emotional tone are common practical mirrors of Moon interplay.",
    severity: moduleSeverity(moonScore),
    score: moonScore,
    confidence: "High",
  };

  // --- Venus / Shukra ---
  const venusMod: AnalysisModule = {
    id: "venus",
    title: "Venus Compatibility (Shukra Milan)",
    weight: WEIGHTS.venus,
    observation: shukra.observation,
    reasoning: shukra.reasoning,
    positives: shukra.positives,
    challenges: shukra.challenges,
    manifestation: shukra.manifestation,
    severity: shukra.severity,
    score: shukra.percent,
    confidence: shukra.confidence,
  };

  // --- 7th house ---
  const seventhScore = clampScore(
    68 +
      (seventhLordA === seventhLordB ? 10 : 0) +
      (seventhOccA && ["Venus", "Jupiter", "Moon"].includes(seventhOccA.planet) ? 8 : 0) +
      (seventhOccB && ["Venus", "Jupiter", "Moon"].includes(seventhOccB.planet) ? 8 : 0) -
      (seventhOccA && ["Saturn", "Mars", "Rahu"].includes(seventhOccA.planet) ? 6 : 0) -
      (seventhOccB && ["Saturn", "Mars", "Rahu"].includes(seventhOccB.planet) ? 6 : 0),
  );
  const seventh: AnalysisModule = {
    id: "seventh",
    title: "Marriage House Analysis (7th)",
    weight: WEIGHTS.seventh,
    observation: `A 7th lord ${seventhLordA}${seventhOccA ? `, occupied by ${seventhOccA.planet}` : ""}; B 7th lord ${seventhLordB}${seventhOccB ? `, occupied by ${seventhOccB.planet}` : ""}.`,
    reasoning:
      "7th house and its lord describe partner archetype, commitment style, and marriage quality themes. Occupants color how partnership is experienced day to day.",
    positives: [
      seventhLordA === seventhLordB
        ? "Shared 7th-lord archetype can ease role expectations"
        : "Different 7th-lord styles can complement if negotiated",
    ],
    challenges: [
      seventhOccA?.planet === "Saturn" || seventhOccB?.planet === "Saturn"
        ? "Saturn on 7th may delay warmth — patience and reliability matter"
        : "Ordinary negotiation around expectations",
    ],
    manifestation:
      "How quickly each person defines 'serious' and how they handle in-laws/public couple identity.",
    severity: moduleSeverity(seventhScore),
    score: seventhScore,
    confidence: "Medium",
  };

  // --- D9 ---
  const d9Dist = d9VenusA && d9VenusB ? signDistance(d9VenusA.sign, d9VenusB.sign) : 4;
  const d9Score = clampScore(
    72 -
      d9Dist * 4 +
      (d9LagnaApproxA && d9LagnaApproxB && d9LagnaApproxA.sign === d9LagnaApproxB.sign ? 6 : 0),
  );
  const d9: AnalysisModule = {
    id: "d9",
    title: "Navamsa (D9) Analysis",
    weight: WEIGHTS.d9,
    observation: `D9 Venus A ${d9VenusA?.sign || "—"}; D9 Venus B ${d9VenusB?.sign || "—"}. Approx D9 Lagna A ${d9LagnaApproxA?.sign || "—"}, B ${d9LagnaApproxB?.sign || "—"}.`,
    reasoning:
      "Navamsa reflects marriage maturity, inner fulfillment, and how affection evolves after the honeymoon phase. It is not a sole marriage verdict.",
    positives:
      d9Dist <= 3
        ? ["D9 Venus climates are relatively compatible"]
        : ["D9 differences invite conscious romance habits"],
    challenges: ["Hidden preferences around privacy and devotion may surface after year one"],
    manifestation:
      "Inner happiness after settling into routines — festivals, intimacy cadence, spiritual habits.",
    severity: moduleSeverity(d9Score),
    score: d9Score,
    confidence: d9VenusA && d9VenusB ? "Medium" : "Low",
  };

  // --- Traditional Guna ---
  const gunaPct = Math.round((totalGuna / Math.max(1, maxGuna)) * 100);
  const weakKootas = gunaBreakdown.filter((g) => g.score / g.max < 0.4).map((g) => g.koota);
  const strongKootas = gunaBreakdown.filter((g) => g.score / g.max >= 0.75).map((g) => g.koota);
  const gunaMod: AnalysisModule = {
    id: "guna",
    title: "Traditional Kundli Milan (Ashta Koota)",
    weight: WEIGHTS.guna,
    observation: `Total Guna ${totalGuna}/${maxGuna} (${gunaPct}%). Strong: ${strongKootas.join(", ") || "—"}. Soft: ${weakKootas.join(", ") || "—"}.`,
    reasoning:
      "Ashta Koota remains one classical layer (Varna through Nadi). It should never cancel strong Venus/Moon/7th harmony alone, nor certify a match alone.",
    positives: strongKootas.map((k) => `${k} supports classical harmony`),
    challenges: weakKootas.map((k) => `${k} needs conscious care`),
    manifestation:
      "Family elders may weigh these numbers; your lived compatibility also depends on Venus, Moon, and 7th themes.",
    severity: moduleSeverity(gunaPct),
    score: gunaPct,
    confidence: "High",
  };

  // --- Sexual (professional) ---
  const yoniNote = gunaBreakdown.find((g) => g.koota === "Yoni");
  const sexualScore = clampScore(
    65 +
      (yoniNote ? (yoniNote.score / yoniNote.max) * 20 : 8) +
      (marsA && venusB && marsA.sign === venusB.sign ? 5 : 0) +
      (marsB && venusA && marsB.sign === venusA.sign ? 5 : 0) -
      ((marsA?.house === 7 || marsB?.house === 7) && (venusA?.house === 12 || venusB?.house === 12)
        ? 0
        : 0),
  );
  const sexual: AnalysisModule = {
    id: "sexual",
    title: "Intimacy & Affection Compatibility",
    weight: WEIGHTS.sexual,
    observation: `Yoni ${yoniNote?.score ?? "—"}/${yoniNote?.max ?? 4}; Mars/Venus cross-links and 7th/12th themes considered professionally.`,
    reasoning:
      "Physical comfort and affection style are inferred from Yoni, Mars–Venus interplay, and 7th/12th context — never from explicit claims.",
    positives: ["Attraction potential should be discussed as mutual comfort and pacing"],
    challenges: ["Mismatched affection frequency is a common trainable gap"],
    manifestation: "Differences may show as need for more verbal affection vs more quiet presence.",
    severity: moduleSeverity(sexualScore),
    score: sexualScore,
    confidence: "Medium",
  };

  // --- Family (2nd) ---
  const secondLordA =
    chartA.houseLords?.["2"] ||
    HOUSE_LORDS[
      SIGNS[
        (SIGNS.indexOf(chartA.lagnaSign as (typeof SIGNS)[number]) + 1) % 12
      ] as (typeof SIGNS)[number]
    ];
  const secondLordB =
    chartB.houseLords?.["2"] ||
    HOUSE_LORDS[
      SIGNS[
        (SIGNS.indexOf(chartB.lagnaSign as (typeof SIGNS)[number]) + 1) % 12
      ] as (typeof SIGNS)[number]
    ];
  const familyScore = clampScore(
    70 +
      (secondLordA === secondLordB ? 8 : 0) -
      (signDistance(chartA.moonSign, chartB.moonSign) >= 5 ? 6 : 0),
  );
  const family: AnalysisModule = {
    id: "family",
    title: "Family Compatibility (2nd)",
    weight: WEIGHTS.family,
    observation: `2nd-lord themes A ${secondLordA}, B ${secondLordB}; speech and value climate via Moon/Mercury.`,
    reasoning:
      "2nd house colors family values, money talk, food culture, and joint-family comfort.",
    positives: ["Shared respect for family rituals can be cultivated even with different styles"],
    challenges: ["Money talk cadence and in-law boundaries may need early agreements"],
    manifestation:
      "Weekend family visits and festival spending are typical flashpoints — solvable with budgets and scripts.",
    severity: moduleSeverity(familyScore),
    score: familyScore,
    confidence: "Medium",
  };

  // --- Life goals (Lagnesh) ---
  const lagneshA = lagnaLord(chartA.lagnaSign);
  const lagneshB = lagnaLord(chartB.lagnaSign);
  const lagneshPlanetA = planet(chartA, lagneshA);
  const lagneshPlanetB = planet(chartB, lagneshB);
  const goalsScore = clampScore(
    68 +
      (lagneshA === lagneshB ? 10 : 0) +
      (lagneshPlanetA &&
      lagneshPlanetB &&
      Math.abs(lagneshPlanetA.house - lagneshPlanetB.house) <= 2
        ? 8
        : 0),
  );
  const lifeGoals: AnalysisModule = {
    id: "lifeGoals",
    title: "Life Direction Compatibility",
    weight: WEIGHTS.lifeGoals,
    observation: `Lagnesh A ${lagneshA} in H${lagneshPlanetA?.house ?? "—"} ${lagneshPlanetA?.sign ?? ""}; Lagnesh B ${lagneshB} in H${lagneshPlanetB?.house ?? "—"} ${lagneshPlanetB?.sign ?? ""}.`,
    reasoning:
      "Lagnesh house/sign hints at life-direction emphasis (career, home, dharma, wealth).",
    positives: ["Aligned ambition seasons are possible when dashas cooperate"],
    challenges: ["Career vs home priority mismatches need scheduled check-ins"],
    manifestation: "Relocation, business risk, and children timing often reveal direction gaps.",
    severity: moduleSeverity(goalsScore),
    score: goalsScore,
    confidence: "Medium",
  };

  // --- Communication ---
  const mercDist = mercA && mercB ? signDistance(mercA.sign, mercB.sign) : 4;
  const communicationScore = clampScore(
    74 - mercDist * 4 + (mercA?.house === 3 || mercB?.house === 3 ? 4 : 0),
  );
  const communication: AnalysisModule = {
    id: "communication",
    title: "Communication Compatibility",
    weight: WEIGHTS.communication,
    observation: `Mercury A ${mercA?.sign || "—"} H${mercA?.house ?? "—"}; Mercury B ${mercB?.sign || "—"} H${mercB?.house ?? "—"}.`,
    reasoning: "Mercury shows speech pace, debate style, and problem-solving language.",
    positives:
      mercDist <= 3
        ? ["Similar mental pacing"]
        : ["Complementary thinkers if they translate for each other"],
    challenges: ["Under stress, one may go logical while the other goes emotional"],
    manifestation: "Text tone and conflict debriefs are the lived test.",
    severity: moduleSeverity(communicationScore),
    score: communicationScore,
    confidence: "Medium",
  };

  // --- Longevity / stability ---
  const longevityScore = clampScore(
    0.35 * seventhScore +
      0.25 * moonScore +
      0.2 * shukra.percent +
      0.1 * familyScore +
      0.1 * (satA || satB ? 70 : 65) +
      (jupA || jupB ? 3 : 0),
  );
  const longevity: AnalysisModule = {
    id: "longevity",
    title: "Long-Term Marriage Stability",
    weight: WEIGHTS.longevity,
    observation: `Composite of 7th (${seventhScore}), Moon (${moonScore}), Shukra (${shukra.percent}), family (${familyScore}), Saturn/Jupiter support.`,
    reasoning:
      "Longevity is multi-factor: commitment houses, emotional safety, Venus affection, family climate, and Saturn/Jupiter maturity — not a single yoga.",
    positives:
      longevityScore >= 70
        ? ["Structural supports for long-term effort are present"]
        : ["Stability improves with conscious routines"],
    challenges: ["Unaddressed communication debt is the usual longevity risk"],
    manifestation:
      "Year 3–7 often tests shared goals and repair skills more than initial chemistry.",
    severity: moduleSeverity(longevityScore),
    score: longevityScore,
    confidence: "Medium",
  };

  const modules = [
    personality,
    moonMod,
    venusMod,
    seventh,
    d9,
    gunaMod,
    sexual,
    family,
    lifeGoals,
    communication,
    longevity,
  ];

  let weighted = 0;
  for (const m of modules) {
    weighted += (m.score * m.weight) / WEIGHT_SUM;
  }
  const overallScore = clampScore(weighted);

  const decisionSummary: DeepCompatibilityResult["decisionSummary"] =
    overallScore >= 85
      ? "Excellent Match"
      : overallScore >= 75
        ? "Very Good Match"
        : overallScore >= 65
          ? "Good Match"
          : overallScore >= 55
            ? "Needs Conscious Effort"
            : overallScore >= 45
              ? "High Challenge"
              : "Not Recommended";

  const decisionReason = `Weighted modules (Personality, Moon, Shukra Milan, 7th, D9, Ashta Koota, intimacy, family, goals, communication, longevity) average to ${overallScore}%. This is a guided assessment — not a guarantee. Strengths should be practiced; soft areas need agreements.`;

  const topStrengths = modules
    .filter((m) => m.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .flatMap((m) => m.positives.map((p) => `${m.title}: ${p}`))
    .slice(0, 10);

  const topChallenges = modules
    .filter((m) => m.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .flatMap((m) => m.challenges.map((c) => `${m.title}: ${c}`))
    .slice(0, 10);

  const conflicts = [
    {
      topic: "Communication",
      reason:
        mercDist >= 4
          ? "Mercury signs are relatively distant"
          : "Ordinary couple friction under stress",
      cause: `Mercury ${mercA?.sign || "—"} × ${mercB?.sign || "—"}`,
      example: "One partner wants to solve immediately; the other needs cool-down time.",
      solution: "Agree a 20-minute pause rule, then a structured debrief.",
    },
    {
      topic: "Money / Family",
      reason: "2nd-house and Moon climates differ in value expression",
      cause: `2nd lords ${secondLordA} × ${secondLordB}; Moons ${chartA.moonSign} × ${chartB.moonSign}`,
      example: "Disagreement on festival spending or support to parents.",
      solution: "Monthly shared budget + explicit family-support boundaries.",
    },
    {
      topic: "Lifestyle / Goals",
      reason: "Lagnesh directions may prioritize different life arenas",
      cause: `Lagnesh ${lagneshA} H${lagneshPlanetA?.house ?? "—"} × ${lagneshB} H${lagneshPlanetB?.house ?? "—"}`,
      example: "Career travel vs home stability preferences.",
      solution: "Quarterly goal sync; protect one shared ritual weekly.",
    },
  ];

  const remedies = [
    "Name love languages explicitly (words, time, help, gifts, affection) using Venus themes — without promising outcomes.",
    "Weekly 30-minute check-in: appreciation first, then one friction, then one plan.",
    moonDist >= 5
      ? "Moon distance suggests scheduled reassurance (messages, shared quiet time) during stressful weeks."
      : "Protect shared calm evenings to keep Moon harmony.",
    shukra.averageScore < 7
      ? "Shukra Milan is mixed — prioritize affection rituals and avoid contempt in conflict."
      : "Keep Venus strengths alive with shared beauty, travel, or creative dates.",
    "If family pressure rises around Guna numbers, share the full modular report so one soft koota is not over-weighted.",
    "Spiritual practice (japa, temple visits, meditation) only as supportive habit — never as guaranteed remedy.",
  ];

  const categoryScores = {
    overall: overallScore,
    marriageStability: longevityScore,
    emotional: moonScore,
    physical: sexualScore,
    mental: communicationScore,
    family: familyScore,
    communication: communicationScore,
    career: goalsScore,
    financial: familyScore,
    spiritual: d9Score,
    trust: clampScore((seventhScore + moonScore) / 2),
    longevity: longevityScore,
    karmic: clampScore((shukra.percent + d9Score) / 2),
    children: clampScore((jupA || jupB ? 72 : 65) + (moonScore - 70) / 2),
    lifestyle: personalityScore,
    shukraMilan: shukra.percent,
    ashtaKoota: gunaPct,
  };

  // silence unused
  void d9LagnaA;

  return {
    chartValidation,
    modules,
    shukraMilan: shukra,
    categoryScores,
    overallScore,
    decisionSummary,
    decisionReason,
    topStrengths,
    topChallenges,
    remedies,
    conflicts,
  };
}
