/**
 * Advanced Marriage Dynamics (AMD) — Phase 1
 * Extends deep compatibility with interpretive marriage layers.
 * Does NOT replace Ashta Koota, Shukra Milan, or the 11-module deep engine.
 * All planetary facts come from stored D1 charts (+ on-the-fly D9 from longitudes).
 */
import {
  buildNavamsaChart,
  navamsaPlanet,
  planetInNavamsaHouse,
  type NavamsaChart,
} from "@/application/horoscope/navamsa-chart";
import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import type { GunaItem } from "./ashta-koota";
import {
  scoreShukraMilan,
  seventhLord,
  type ChartPlanetLite,
  type ShukraMilanResult,
} from "./shukra-milan";
import {
  analyzeArudha,
  analyzeLagnaCompatibility,
  analyzeNinthSeventh,
  analyzeRelationshipBalance,
  analyzeSaturnResponsibility,
  analyzeSelfPartnerAxis,
  analyzeTimingActivation,
  analyzeYoniIntimacy,
  type DashaSnippet,
} from "./amd-extended-modules";
import type { YoniAnimal } from "./ashta-koota";

export const AMD_METHODOLOGY_VERSION = "amd-2.0.0";

export type QualitativeTone =
  | "Strong Foundation"
  | "Supportive"
  | "Balanced"
  | "Requires Awareness"
  | "Requires Conscious Effort";

export type DualView = {
  simple: string;
  vedic: string;
};

export type AmdPersonNotes = {
  strengths: string[];
  challenges: string[];
  relationshipNeeds: string[];
  consciousEffort: string[];
};

export type AmdModuleBlock = {
  id: string;
  title: string;
  tone: QualitativeTone;
  dual: DualView;
  strengths: string[];
  challenges: string[];
  facts: Record<string, string | number | boolean | null>;
};

export type AdvancedMarriageDynamicsResult = {
  methodologyVersion: string;
  disclaimer: string;
  overallTheme: DualView;
  overallTone: QualitativeTone;
  strongestFoundations: string[];
  potentialGrowthAreas: string[];
  emotionalDynamic: DualView;
  intimacyDynamic: DualView;
  longTermStability: DualView;
  marriageExperience: DualView;
  relationshipEffort: DualView;
  keyVedicInsights: string[];
  modules: {
    d1Foundation: AmdModuleBlock & { personA: AmdPersonNotes; personB: AmdPersonNotes };
    d9Marriage: AmdModuleBlock & {
      personA: { atmosphere: string[]; effort: string[] };
      personB: { atmosphere: string[]; effort: string[] };
      d9Notes: string[];
    };
    venusDynamics: AmdModuleBlock & {
      weighting: { signWeight: number; houseWeight: number };
      signScore: number;
      houseScore: number;
      compositeScore: number;
      shukraMilanPercent: number;
      themes: string[];
    };
    moonEmotional: AmdModuleBlock & {
      personANeeds: string[];
      personBNeeds: string[];
      sharedUnderstanding: string[];
      misunderstandingRisks: string[];
    };
    houseTriad: AmdModuleBlock;
    lagnaCompatibility: AmdModuleBlock & {
      naturalAlignment: string[];
      potentialDifferences: string[];
      complementary: string[];
    };
    selfPartnerAxis: AmdModuleBlock & { signInsights: DualView[] };
    yoniIntimacy: AmdModuleBlock & {
      attractionTendencies: string[];
      communicationGuidance: string[];
      yoniA: YoniAnimal;
      yoniB: YoniAnimal;
    };
    saturnResponsibility: AmdModuleBlock & {
      constructive: string[];
      challenging: string[];
    };
    ninthSeventh: AmdModuleBlock;
    arudha: AmdModuleBlock;
    relationshipBalance: AmdModuleBlock & { balanceLabel: string };
    timingActivation: AmdModuleBlock & {
      gocharStatus: string;
      activationNotes: string[];
    };
  };
  methodologyLayers: Array<{ layer: number; title: string; description: string }>;
};

export type AmdChartInput = {
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
  moonSign: string;
  sunSign: string;
  manglikStatus?: string;
  planets: ChartPlanetLite[];
  houseLords?: Record<string, string> | null;
};

function planet(chart: AmdChartInput, name: string) {
  return chart.planets.find((p) => p.planet === name) || null;
}

function signId(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function signDistance(a: string, b: string) {
  const d = Math.abs(signId(a) - signId(b));
  return Math.min(d, 12 - d);
}

function elementOf(sign: string): "Fire" | "Earth" | "Air" | "Water" {
  return (["Fire", "Earth", "Air", "Water"] as const)[signId(sign) % 4] ?? "Fire";
}

function lagnaLordName(lagna: string) {
  return HOUSE_LORDS[lagna as (typeof SIGNS)[number]] ?? "Mars";
}

function houseOfSignFromLagna(lagna: string, targetSign: string) {
  return ((signId(targetSign) - signId(lagna) + 12) % 12) + 1;
}

/** Relative house of signB counted from signA (1 = same). */
function relativeHouse(fromSign: string, toSign: string) {
  return ((signId(toSign) - signId(fromSign) + 12) % 12) + 1;
}

function isSixEight(fromSign: string, toSign: string) {
  const h = relativeHouse(fromSign, toSign);
  return h === 6 || h === 8;
}

function dignityBoost(dignity?: string | null) {
  if (!dignity) return 0;
  if (/exalt/i.test(dignity)) return 12;
  if (/own|mool/i.test(dignity)) return 8;
  if (/debilit/i.test(dignity)) return -14;
  return 0;
}

function maleficInHouse(chart: AmdChartInput, house: number) {
  const malefics = new Set(["Mars", "Saturn", "Rahu", "Ketu", "Sun"]);
  return chart.planets.filter((p) => p.house === house && malefics.has(p.planet));
}

function toneFromScore(score: number): QualitativeTone {
  if (score >= 82) return "Strong Foundation";
  if (score >= 70) return "Supportive";
  if (score >= 58) return "Balanced";
  if (score >= 45) return "Requires Awareness";
  return "Requires Conscious Effort";
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function lordPlacement(chart: AmdChartInput, lordName: string) {
  return planet(chart, lordName);
}

function analyzePersonD1(chart: AmdChartInput): AmdPersonNotes & {
  score: number;
  facts: Record<string, string | number | boolean | null>;
} {
  const lLord = lagnaLordName(chart.lagnaSign);
  const sLord = seventhLord(chart.lagnaSign);
  const lPlace = lordPlacement(chart, lLord);
  const sPlace = lordPlacement(chart, sLord);
  const venus = planet(chart, "Venus");
  const jupiter = planet(chart, "Jupiter");
  const h7 = maleficInHouse(chart, 7);
  const h2 = maleficInHouse(chart, 2);
  const h12 = maleficInHouse(chart, 12);

  const strengths: string[] = [];
  const challenges: string[] = [];
  const relationshipNeeds: string[] = [];
  const consciousEffort: string[] = [];
  let score = 62;

  strengths.push(`Lagna in ${chart.lagnaSign}; 7th lord is ${sLord}.`);
  if (lPlace) {
    score += dignityBoost(lPlace.dignity) / 2;
    if (
      lPlace.house === 1 ||
      lPlace.house === 4 ||
      lPlace.house === 5 ||
      lPlace.house === 7 ||
      lPlace.house === 9 ||
      lPlace.house === 10
    ) {
      strengths.push(
        `Lagna lord ${lLord} occupies house ${lPlace.house}, supporting vitality for partnership.`,
      );
      score += 6;
    }
  }
  if (sPlace) {
    score += dignityBoost(sPlace.dignity);
    if (
      sPlace.house === 1 ||
      sPlace.house === 5 ||
      sPlace.house === 7 ||
      sPlace.house === 9 ||
      sPlace.house === 11
    ) {
      strengths.push(`7th lord ${sLord} in house ${sPlace.house} can support partnership themes.`);
      score += 7;
    }
    if (sPlace.house === 6 || sPlace.house === 8 || sPlace.house === 12) {
      challenges.push(
        `7th lord ${sLord} in house ${sPlace.house} may ask for extra care around conflict, privacy, or adjustment.`,
      );
      consciousEffort.push(
        "Keep partnership conversations explicit when dusthana themes activate.",
      );
      score -= 8;
    }
  }

  if (lPlace && sPlace && isSixEight(lPlace.sign, sPlace.sign)) {
    challenges.push(
      `Lagna lord and 7th lord form a 6/8-style sign relationship — growth may come through conscious negotiation.`,
    );
    consciousEffort.push("Treat friction as information, not as a verdict on the bond.");
    score -= 10;
  } else if (lPlace && sPlace && relativeHouse(lPlace.sign, sPlace.sign) === 1) {
    strengths.push(
      "Lagna lord and 7th lord share the same sign — self and partner themes can blend.",
    );
    score += 8;
  }

  if (venus) {
    score += dignityBoost(venus.dignity) / 2;
    strengths.push(
      `Venus in ${venus.sign} (house ${venus.house}) colors affection and aesthetic values.`,
    );
    relationshipNeeds.push(`Affection expressed through Venus-in-${venus.sign} themes.`);
    if (venus.house === 6 || venus.house === 8) {
      challenges.push("Venus in a challenging house may need deliberate romance rituals.");
      score -= 5;
    }
  }
  if (jupiter) {
    score += dignityBoost(jupiter.dignity) / 3;
    strengths.push(
      `Jupiter in ${jupiter.sign} (house ${jupiter.house}) speaks to growth and ethics in relating.`,
    );
  }

  if (h7.length) {
    challenges.push(
      `7th house has ${h7.map((p) => p.planet).join(", ")} — awareness around pressure in partnership.`,
    );
    score -= 4 * h7.length;
  } else {
    strengths.push("7th house is free of classical malefic occupancy in this snapshot.");
    score += 4;
  }
  if (h2.length) {
    consciousEffort.push(
      "2nd-house themes (family continuity / shared resources) may need calm money-and-family talks.",
    );
  }
  if (h12.length) {
    relationshipNeeds.push(
      "12th-house themes invite privacy, rest, and respectful intimacy boundaries.",
    );
  }

  return {
    strengths: strengths.slice(0, 5),
    challenges: challenges.slice(0, 4),
    relationshipNeeds: relationshipNeeds.slice(0, 3),
    consciousEffort: consciousEffort.slice(0, 3),
    score: clamp(score),
    facts: {
      lagna: chart.lagnaSign,
      lagnaLord: lLord,
      seventhLord: sLord,
      venusSign: venus?.sign || "—",
      venusHouse: venus?.house ?? null,
      jupiterSign: jupiter?.sign || "—",
      sixthEighthLords: Boolean(lPlace && sPlace && isSixEight(lPlace.sign, sPlace.sign)),
    },
  };
}

function analyzeD9Person(d9: NavamsaChart): {
  atmosphere: string[];
  effort: string[];
  score: number;
} {
  const atmosphere: string[] = [];
  const effort: string[] = [];
  let score = 60;

  atmosphere.push(`D9 Lagna ${d9.lagnaSign} frames the lived marriage atmosphere.`);
  const d9LagnaOcc = planetInNavamsaHouse(d9, 1);
  if (d9LagnaOcc.length) {
    atmosphere.push(`D9 Lagna hosts ${d9LagnaOcc.map((p) => p.planet).join(", ")}.`);
    score += 3 * d9LagnaOcc.length;
  }

  const h7 = planetInNavamsaHouse(d9, 7);
  const h11 = planetInNavamsaHouse(d9, 11);
  const h3 = planetInNavamsaHouse(d9, 3);
  const venus = navamsaPlanet(d9, "Venus");
  const jupiter = navamsaPlanet(d9, "Jupiter");

  atmosphere.push(
    h7.length
      ? `D9 7th hosts ${h7.map((p) => p.planet).join(", ")} — partnership atmosphere markers.`
      : "D9 7th has no planet occupancy in this snapshot — read via 7th lord themes.",
  );

  for (const p of h11) {
    const theme =
      p.planet === "Jupiter"
        ? "shared growth and dharma"
        : p.planet === "Venus"
          ? "affection, comfort, and enjoyment"
          : p.planet === "Mars"
            ? "intensity and active engagement"
            : p.planet === "Saturn"
              ? "duty and long-haul commitment"
              : p.planet === "Moon"
                ? "emotional nesting"
                : `${p.planet} themes`;
    atmosphere.push(`D9 11th ${p.planet}: potential marriage-mood contribution via ${theme}.`);
    score += p.planet === "Jupiter" || p.planet === "Venus" ? 6 : 3;
  }

  if (venus) {
    atmosphere.push(
      `Venus in D9 ${venus.sign} (house ${venus.house}) colors post-marriage affection.`,
    );
    score += dignityBoost(venus.dignity) / 2;
  }
  if (jupiter) {
    atmosphere.push(
      `Jupiter in D9 ${jupiter.sign} (house ${jupiter.house}) supports maturity themes.`,
    );
  }

  for (const p of h3) {
    effort.push(
      `D9 3rd ${p.planet}: conscious effort may help navigate the marriage-mood themes linked with the D9 11th.`,
    );
  }
  if (!h3.length) {
    effort.push("No planet in D9 3rd — effort still matters through daily communication habits.");
  }

  return { atmosphere: atmosphere.slice(0, 6), effort: effort.slice(0, 4), score: clamp(score) };
}

function venusSignPairScore(signA: string, signB: string) {
  const dist = signDistance(signA, signB);
  let score = 70 - dist * 6;
  if (elementOf(signA) === elementOf(signB)) score += 8;
  if (dist === 0) score += 10;
  return clamp(score);
}

function venusHousePairScore(houseA: number, houseB: number) {
  const diff = Math.min(Math.abs(houseA - houseB), 12 - Math.abs(houseA - houseB));
  if (diff === 0) return 88;
  if (diff === 1 || diff === 2) return 78;
  if (diff === 3 || diff === 4) return 68;
  if (diff === 5 || diff === 6) return 52;
  return 60;
}

function venusOccupantThemes(occupant: string | null): string[] {
  if (!occupant) return ["Partner's Venus sign is unoccupied by a major planet in this snapshot."];
  const map: Record<string, string> = {
    Mars: "Potential themes: physical attraction, passion, and active bonding — channel intensity constructively.",
    Jupiter:
      "Potential themes: growth and values — watch pleasure-vs-philosophy differences with care.",
    Saturn: "Potential themes: stability, responsibility, and slow-building commitment.",
    Mercury:
      "Potential themes: playful or intellectual connection — clarify relationship expectations in words.",
    Moon: "Potential themes: emotional expression and aesthetic sensitivity.",
    Rahu: "Potential themes: novelty and unconventional attraction — ground the bond in shared routines.",
    Ketu: "Potential themes: karmic familiarity and detachment phases — keep intimacy intentional.",
    Sun: "Potential themes: recognition and pride in the bond — balance ego with mutual respect.",
    Venus:
      "Potential themes: mirrored Venus values — strong shared taste with possible sameness fatigue.",
  };
  return [map[occupant] || `Potential themes linked with ${occupant} occupying the Venus sign.`];
}

function analyzeVenusDynamics(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
  shukra: ShukraMilanResult,
): AdvancedMarriageDynamicsResult["modules"]["venusDynamics"] {
  const venusA = planet(chartA, "Venus");
  const venusB = planet(chartB, "Venus");
  const signWeight = 70;
  const houseWeight = 30;

  const signScore = venusA && venusB ? venusSignPairScore(venusA.sign, venusB.sign) : 55;
  const houseScore = venusA && venusB ? venusHousePairScore(venusA.house, venusB.house) : 55;
  const compositeScore = clamp((signScore * signWeight + houseScore * houseWeight) / 100);

  const occA = chartB.planets.find((p) => venusA && p.sign === venusA.sign && p.planet !== "Venus");
  const occB = chartA.planets.find((p) => venusB && p.sign === venusB.sign && p.planet !== "Venus");

  const themes = [
    ...(venusA && venusB && venusA.sign === venusB.sign
      ? ["Same Venus sign — potential shared preferences and relationship values."]
      : []),
    ...venusOccupantThemes(occA?.planet || null),
    ...venusOccupantThemes(occB?.planet || null),
    `Existing Shukra Milan percent (${shukra.percent}) remains available as a separate engine reading — not overwritten by this module.`,
  ];

  const strengths: string[] = [];
  const challenges: string[] = [];
  if (compositeScore >= 70)
    strengths.push("Venus dynamics suggest supportive affection patterns overall.");
  else challenges.push("Venus dynamics ask for conscious attention to love languages and pacing.");
  if (houseScore < 55)
    challenges.push("Venus house relationship may need practical romance scheduling.");
  if (signScore >= 75) strengths.push("Venus signs relate with relative ease.");

  return {
    id: "venusDynamics",
    title: "Venus Relationship Dynamics",
    tone: toneFromScore(compositeScore),
    dual: {
      simple:
        "This layer looks at how affection styles may meet — separate from your overall Compatibility score.",
      vedic: `Venus dynamics use a ${signWeight}% sign / ${houseWeight}% house weighting (AMD methodology), distinct from Shukra Milan's occupancy scoring.`,
    },
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 4),
    facts: {
      venusA: venusA ? `${venusA.sign} H${venusA.house}` : null,
      venusB: venusB ? `${venusB.sign} H${venusB.house}` : null,
      signWeight,
      houseWeight,
    },
    weighting: { signWeight, houseWeight },
    signScore,
    houseScore,
    compositeScore,
    shukraMilanPercent: shukra.percent,
    themes: themes.slice(0, 6),
  };
}

function analyzeMoon(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AdvancedMarriageDynamicsResult["modules"]["moonEmotional"] {
  const moonA = planet(chartA, "Moon");
  const moonB = planet(chartB, "Moon");
  const dist = moonA && moonB ? signDistance(moonA.sign, moonB.sign) : 6;
  let score = 72 - dist * 5;
  if (moonA && moonB && elementOf(moonA.sign) === elementOf(moonB.sign)) score += 10;

  const personANeeds: string[] = [];
  const personBNeeds: string[] = [];
  const sharedUnderstanding: string[] = [];
  const misunderstandingRisks: string[] = [];

  if (moonA) {
    personANeeds.push(
      `Emotional processing colored by Moon in ${moonA.sign} (house ${moonA.house}).`,
    );
    if (moonA.nakshatra)
      personANeeds.push(`Moon nakshatra ${moonA.nakshatra} nuances comfort needs.`);
  }
  if (moonB) {
    personBNeeds.push(
      `Emotional processing colored by Moon in ${moonB.sign} (house ${moonB.house}).`,
    );
    if (moonB.nakshatra)
      personBNeeds.push(`Moon nakshatra ${moonB.nakshatra} nuances comfort needs.`);
  }

  if (dist <= 2)
    sharedUnderstanding.push("Moon signs are close — emotional tempo may feel familiar.");
  else if (dist >= 5) {
    misunderstandingRisks.push("Moon signs are distant — pace of feeling and recovery may differ.");
    score -= 4;
  }

  if (moonA) {
    const toLagnaB = houseOfSignFromLagna(chartB.lagnaSign, moonA.sign);
    if (toLagnaB === 1 || toLagnaB === 7) {
      sharedUnderstanding.push(
        "Person A's Moon lands on Person B's Lagna/7th axis — noticeable emotional imprint.",
      );
      score += 5;
    }
  }
  if (moonB) {
    const toLagnaA = houseOfSignFromLagna(chartA.lagnaSign, moonB.sign);
    if (toLagnaA === 1 || toLagnaA === 7) {
      sharedUnderstanding.push(
        "Person B's Moon lands on Person A's Lagna/7th axis — noticeable emotional imprint.",
      );
      score += 5;
    }
  }

  if (moonA && (moonA.house === 6 || moonA.house === 8 || moonA.house === 12)) {
    misunderstandingRisks.push(
      "Person A's Moon in a sensitive house may need quieter recovery space.",
    );
  }
  if (moonB && (moonB.house === 6 || moonB.house === 8 || moonB.house === 12)) {
    misunderstandingRisks.push(
      "Person B's Moon in a sensitive house may need quieter recovery space.",
    );
  }

  const tone = toneFromScore(clamp(score));
  return {
    id: "moonEmotional",
    title: "Emotional & Mental Compatibility",
    tone,
    dual: {
      simple:
        "How each of you settles emotionally — and where you may naturally soothe or misread each other.",
      vedic:
        "Derived from Moon sign, house, nakshatra, and Moon-to-Lagna/7th relationships in both D1 charts.",
    },
    strengths: sharedUnderstanding.slice(0, 4),
    challenges: misunderstandingRisks.slice(0, 4),
    facts: {
      moonA: moonA ? `${moonA.sign} · ${moonA.nakshatra || "—"} · H${moonA.house}` : null,
      moonB: moonB ? `${moonB.sign} · ${moonB.nakshatra || "—"} · H${moonB.house}` : null,
      signDistance: dist,
    },
    personANeeds: personANeeds.slice(0, 3),
    personBNeeds: personBNeeds.slice(0, 3),
    sharedUnderstanding: sharedUnderstanding.slice(0, 4),
    misunderstandingRisks: misunderstandingRisks.slice(0, 4),
  };
}

function analyzeHouseTriad(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AdvancedMarriageDynamicsResult["modules"]["houseTriad"] {
  const strengths: string[] = [];
  const challenges: string[] = [];
  let score = 64;

  for (const [label, chart] of [
    ["Person A", chartA],
    ["Person B", chartB],
  ] as const) {
    const h2 = chart.planets.filter((p) => p.house === 2).map((p) => p.planet);
    const h7 = chart.planets.filter((p) => p.house === 7).map((p) => p.planet);
    const h12 = chart.planets.filter((p) => p.house === 12).map((p) => p.planet);
    strengths.push(
      `${label}: 2nd (${h2.join(", ") || "empty"}), 7th (${h7.join(", ") || "empty"}), 12th (${h12.join(", ") || "empty"}) — triad read together, not alone.`,
    );
    if (h7.some((p) => ["Saturn", "Mars", "Rahu"].includes(p))) {
      challenges.push(`${label}: 7th-house occupancy asks for conscious partnership skills.`);
      score -= 4;
    }
    if (h12.some((p) => ["Venus", "Moon"].includes(p))) {
      strengths.push(`${label}: 12th softens into private bonding themes.`);
      score += 3;
    }
  }

  strengths.unshift(
    "Relationship compatibility is not determined by one house alone — 2nd, 7th, and 12th are read as a triad (7th weighted for partnership before 12th for private intimacy).",
  );

  return {
    id: "houseTriad",
    title: "Relationship Foundation (2nd · 7th · 12th)",
    tone: toneFromScore(clamp(score)),
    dual: {
      simple:
        "Family continuity, partnership, and private life work as a set — not isolated checkboxes.",
      vedic:
        "D1 houses 2 (resources/family), 7 (marriage/partnership), and 12 (privacy/intimacy) with 7th prioritized for partnership framing.",
    },
    strengths: strengths.slice(0, 6),
    challenges: challenges.slice(0, 4),
    facts: {
      hierarchy: "7th before 12th for partnership framing",
    },
  };
}

export function scoreAdvancedMarriageDynamics(input: {
  chartA: AmdChartInput;
  chartB: AmdChartInput;
  gunaBreakdown: GunaItem[];
  nakshatraA?: string;
  nakshatraB?: string;
  ashtaYoni?: { you: YoniAnimal; them: YoniAnimal; score: number; harmony: string } | null;
  dashaA?: DashaSnippet;
  dashaB?: DashaSnippet;
  gocharAvailable?: boolean;
}): AdvancedMarriageDynamicsResult {
  const { chartA, chartB, gunaBreakdown } = input;
  const nakshatraA = input.nakshatraA || planet(chartA, "Moon")?.nakshatra || "Ashwini";
  const nakshatraB = input.nakshatraB || planet(chartB, "Moon")?.nakshatra || "Ashwini";
  const shukra = scoreShukraMilan(chartA.planets, chartB.planets);

  const d1A = analyzePersonD1(chartA);
  const d1B = analyzePersonD1(chartB);
  const d1Score = clamp((d1A.score + d1B.score) / 2);

  const d9A = buildNavamsaChart({
    planets: chartA.planets,
    lagnaSign: chartA.lagnaSign,
    lagnaDegree: chartA.lagnaDegree,
    lagnaLongitude: chartA.lagnaLongitude,
  });
  const d9B = buildNavamsaChart({
    planets: chartB.planets,
    lagnaSign: chartB.lagnaSign,
    lagnaDegree: chartB.lagnaDegree,
    lagnaLongitude: chartB.lagnaLongitude,
  });
  const d9PersonA = analyzeD9Person(d9A);
  const d9PersonB = analyzeD9Person(d9B);
  const d9Score = clamp((d9PersonA.score + d9PersonB.score) / 2);

  const venus = analyzeVenusDynamics(chartA, chartB, shukra);
  const moon = analyzeMoon(chartA, chartB);
  const triad = analyzeHouseTriad(chartA, chartB);
  const lagna = analyzeLagnaCompatibility(chartA, chartB);
  const axis = analyzeSelfPartnerAxis(chartA, chartB);
  const yoni = analyzeYoniIntimacy(gunaBreakdown, nakshatraA, nakshatraB, input.ashtaYoni);
  const saturn = analyzeSaturnResponsibility(chartA, chartB);
  const ninth = analyzeNinthSeventh(chartA, chartB);
  const arudha = analyzeArudha(chartA, chartB);
  const balance = analyzeRelationshipBalance(chartA, chartB);
  const timing = analyzeTimingActivation(
    chartA,
    chartB,
    input.dashaA || null,
    input.dashaB || null,
    Boolean(input.gocharAvailable),
  );

  const toneScore = (t: QualitativeTone) =>
    t === "Strong Foundation"
      ? 85
      : t === "Supportive"
        ? 75
        : t === "Balanced"
          ? 62
          : t === "Requires Awareness"
            ? 48
            : 38;

  const blend = clamp(
    d1Score * 0.18 +
      d9Score * 0.14 +
      venus.compositeScore * 0.12 +
      toneScore(moon.tone) * 0.1 +
      toneScore(triad.tone) * 0.08 +
      toneScore(lagna.tone) * 0.1 +
      toneScore(yoni.tone) * 0.08 +
      toneScore(saturn.tone) * 0.08 +
      toneScore(ninth.tone) * 0.06 +
      toneScore(arudha.tone) * 0.06,
  );
  const overallTone = toneFromScore(blend);

  const strongestFoundations = [
    ...d1A.strengths.slice(0, 1),
    ...venus.strengths.slice(0, 1),
    ...moon.sharedUnderstanding.slice(0, 1),
    ...lagna.naturalAlignment.slice(0, 1),
    ...saturn.constructive.slice(0, 1),
  ]
    .filter(Boolean)
    .slice(0, 5);

  const potentialGrowthAreas = [
    ...d1A.challenges.slice(0, 1),
    ...venus.challenges.slice(0, 1),
    ...moon.misunderstandingRisks.slice(0, 1),
    ...lagna.potentialDifferences.slice(0, 1),
    ...balance.challenges.slice(0, 1),
  ]
    .filter(Boolean)
    .slice(0, 5);

  const keyVedicInsights = [
    `D1 foundation: ${toneFromScore(d1Score)}; D9 atmosphere: ${toneFromScore(d9Score)}.`,
    `Venus dynamics ${venus.compositeScore} (70/30 sign/house); Shukra Milan ${venus.shukraMilanPercent}% separate.`,
    `Personality (Lagna): ${lagna.tone}. Balance: ${balance.balanceLabel}.`,
    yoni.dual.vedic,
    `Arudha view: AL/A7 A ${arudha.facts.alA}/${arudha.facts.a7A}, B ${arudha.facts.alB}/${arudha.facts.a7B}.`,
    saturn.dual.simple,
    ninth.dual.simple,
    timing.gocharStatus,
  ];

  return {
    methodologyVersion: AMD_METHODOLOGY_VERSION,
    disclaimer:
      "Vedic compatibility analysis offers interpretive insights and is not a guarantee of relationship outcomes. Real relationships are shaped by communication, choices, circumstances, and mutual effort.",
    overallTheme: {
      simple: `Overall, this pairing reads as ${overallTone.toLowerCase()} for lived marriage dynamics — tendencies, not guarantees.`,
      vedic: `AMD ${AMD_METHODOLOGY_VERSION} covers D1/D9, Venus, Moon, triad, Lagna, Yoni, Saturn, 9th–7th, Arudha, balance, and dasha activation — without replacing Compatibility score.`,
    },
    overallTone,
    strongestFoundations,
    potentialGrowthAreas,
    emotionalDynamic: moon.dual,
    intimacyDynamic: yoni.dual,
    longTermStability: {
      simple:
        overallTone === "Strong Foundation" || overallTone === "Supportive"
          ? "Long-term stability themes look encouraging when effort stays mutual."
          : "Long-term stability improves when both partners treat differences as workable.",
      vedic:
        "Stability from D1 lords, Saturn responsibility, Venus, and D9 atmosphere — not one house.",
    },
    marriageExperience: {
      simple: "Post-marriage feel is sketched from D9 atmosphere and relationship-effort markers.",
      vedic: `D9 Lagnas ${d9A.lagnaSign} / ${d9B.lagnaSign}; 11th mood, 3rd effort.`,
    },
    relationshipEffort: {
      simple:
        [...d9PersonA.effort, ...d9PersonB.effort].slice(0, 2).join(" ") ||
        "Daily kindness and clear conversation remain the practical effort layer.",
      vedic: "D9 3rd-house markers plus Saturn/balance guidance for conscious effort.",
    },
    keyVedicInsights,
    modules: {
      d1Foundation: {
        id: "d1Foundation",
        title: "Marriage Foundation (D1)",
        tone: toneFromScore(d1Score),
        dual: {
          simple: "How each chart supports partnership at the foundational level.",
          vedic:
            "Lagna, Lagna lord, 7th house/lord, Venus, Jupiter, 2nd and 12th conditions in D1.",
        },
        strengths: [...d1A.strengths, ...d1B.strengths].slice(0, 6),
        challenges: [...d1A.challenges, ...d1B.challenges].slice(0, 6),
        facts: {
          ...d1A.facts,
          personB_lagna: d1B.facts.lagna ?? null,
          personB_seventhLord: d1B.facts.seventhLord ?? null,
        },
        personA: {
          strengths: d1A.strengths,
          challenges: d1A.challenges,
          relationshipNeeds: d1A.relationshipNeeds,
          consciousEffort: d1A.consciousEffort,
        },
        personB: {
          strengths: d1B.strengths,
          challenges: d1B.challenges,
          relationshipNeeds: d1B.relationshipNeeds,
          consciousEffort: d1B.consciousEffort,
        },
      },
      d9Marriage: {
        id: "d9Marriage",
        title: "Marriage Fruits & Post-Marriage Experience (D9)",
        tone: toneFromScore(d9Score),
        dual: {
          simple: "D1 is potential; D9 sketches how that potential may feel over time.",
          vedic:
            "D9 Lagna, 7th, Venus, Jupiter, 11th (mood), and 3rd (effort) from longitude-based Navamsha.",
        },
        strengths: [...d9PersonA.atmosphere, ...d9PersonB.atmosphere].slice(0, 6),
        challenges: [...d9PersonA.effort, ...d9PersonB.effort].slice(0, 4),
        facts: { d9LagnaA: d9A.lagnaSign, d9LagnaB: d9B.lagnaSign },
        personA: { atmosphere: d9PersonA.atmosphere, effort: d9PersonA.effort },
        personB: { atmosphere: d9PersonB.atmosphere, effort: d9PersonB.effort },
        d9Notes: [...new Set([...d9A.notes, ...d9B.notes])],
      },
      venusDynamics: venus,
      moonEmotional: moon,
      houseTriad: triad,
      lagnaCompatibility: lagna,
      selfPartnerAxis: axis,
      yoniIntimacy: yoni,
      saturnResponsibility: saturn,
      ninthSeventh: ninth,
      arudha,
      relationshipBalance: balance,
      timingActivation: timing,
    },
    methodologyLayers: [
      {
        layer: 1,
        title: "Personal preferences",
        description: "Discovery filters (separate Match score).",
      },
      { layer: 2, title: "Core personality", description: "Lagna / Lagnesh compatibility." },
      { layer: 3, title: "Emotional compatibility", description: "Moon-based patterns." },
      { layer: 4, title: "Ashta Koota", description: "Classical guna milan including Yoni." },
      {
        layer: 5,
        title: "Shukra / Venus dynamics",
        description: "Shukra Milan + AMD 70/30 Venus weighting.",
      },
      {
        layer: 6,
        title: "D1 marriage foundation",
        description: "Lagna, 7th, Venus, Jupiter, 2nd/12th.",
      },
      { layer: 7, title: "D9 marriage experience", description: "Navamsha atmosphere and effort." },
      { layer: 8, title: "Intimacy & Yoni", description: "Respectful intimacy temperament." },
      {
        layer: 9,
        title: "Relationship dynamics",
        description: "Saturn, 9th–7th, balance, Arudha.",
      },
      {
        layer: 10,
        title: "Timing activation",
        description: "Dasha-based theme activation; Gochar separate.",
      },
    ],
  };
}
