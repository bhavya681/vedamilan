/**
 * Advanced Marriage Dynamics — Phase 2 & 3 module analyzers.
 * Deterministic only; AI explains separately.
 */
import {
  classifyArudhaAxis,
  computeArudhaMap,
  relativeHouseBetween,
} from "@/application/horoscope/arudha-pada";
import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import { yoniAnimalForNakshatra, type GunaItem, type YoniAnimal } from "./ashta-koota";
import { seventhLord, type ChartPlanetLite } from "./shukra-milan";

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

export type AmdModuleBlock = {
  id: string;
  title: string;
  tone: QualitativeTone;
  dual: DualView;
  strengths: string[];
  challenges: string[];
  facts: Record<string, string | number | boolean | null>;
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

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toneFromScore(score: number): QualitativeTone {
  if (score >= 82) return "Strong Foundation";
  if (score >= 70) return "Supportive";
  if (score >= 58) return "Balanced";
  if (score >= 45) return "Requires Awareness";
  return "Requires Conscious Effort";
}

function dignityBoost(dignity?: string | null) {
  if (!dignity) return 0;
  if (/exalt/i.test(dignity)) return 12;
  if (/own|mool/i.test(dignity)) return 8;
  if (/debilit/i.test(dignity)) return -14;
  return 0;
}

const POLAR_PAIRS: Record<string, string> = {
  Aries: "Libra",
  Taurus: "Scorpio",
  Gemini: "Sagittarius",
  Cancer: "Capricorn",
  Leo: "Aquarius",
  Virgo: "Pisces",
  Libra: "Aries",
  Scorpio: "Taurus",
  Sagittarius: "Gemini",
  Capricorn: "Cancer",
  Aquarius: "Leo",
  Pisces: "Virgo",
};

const SIGN_AXIS_INSIGHT: Record<string, { simple: string; vedic: string }> = {
  "Aries|Libra": {
    simple: "Independence meets cooperation — balance self-drive with partnership skills.",
    vedic: "Aries–Libra axis: 1/7 polarity themes of self vs other.",
  },
  "Taurus|Scorpio": {
    simple: "Security meets emotional depth — share resources and feelings with care.",
    vedic: "Taurus–Scorpio axis: attachment, resources, and transformative bonding.",
  },
  "Gemini|Sagittarius": {
    simple: "Curiosity meets meaning — keep talking and keep growing together.",
    vedic: "Gemini–Sagittarius axis: communication, friendship, and shared wisdom.",
  },
  "Cancer|Capricorn": {
    simple: "Warmth meets structure — emotional care and practical goals can complement.",
    vedic: "Cancer–Capricorn axis: nurture vs duty, home vs career pacing.",
  },
  "Leo|Aquarius": {
    simple: "Recognition meets systems — celebrate each other without power games.",
    vedic: "Leo–Aquarius axis: pride, community, and conscious equality.",
  },
  "Virgo|Pisces": {
    simple: "Detail meets intuition — refine the bond without over-perfecting it.",
    vedic: "Virgo–Pisces axis: analysis, compassion, and spiritual perspective.",
  },
};

function axisKey(a: string, b: string) {
  for (const key of Object.keys(SIGN_AXIS_INSIGHT)) {
    const [x, y] = key.split("|");
    if ((a === x && b === y) || (a === y && b === x)) return key;
  }
  return [a, b].sort().join("|");
}

export function analyzeLagnaCompatibility(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AmdModuleBlock & {
  naturalAlignment: string[];
  potentialDifferences: string[];
  complementary: string[];
} {
  const lordA = lagnaLordName(chartA.lagnaSign);
  const lordB = lagnaLordName(chartB.lagnaSign);
  const placeA = planet(chartA, lordA);
  const placeB = planet(chartB, lordB);
  const dist = signDistance(chartA.lagnaSign, chartB.lagnaSign);
  let score = 70 - dist * 4;
  if (elementOf(chartA.lagnaSign) === elementOf(chartB.lagnaSign)) score += 8;
  if (lordA === lordB) score += 6;

  const naturalAlignment: string[] = [
    `Lagna ${chartA.lagnaSign} with ${chartB.lagnaSign} (sign distance ${dist}).`,
  ];
  const potentialDifferences: string[] = [];
  const complementary: string[] = [];

  if (dist <= 2) naturalAlignment.push("Lagnas are close — first impressions may feel familiar.");
  else if (dist >= 5) {
    potentialDifferences.push("Lagnas are distant — pacing and first reactions may differ.");
    score -= 4;
  }

  if (placeA && placeB) {
    const rh = relativeHouseBetween(placeA.sign, placeB.sign);
    if ([1, 5, 9].includes(rh)) {
      naturalAlignment.push(`Lagna lords relate by ${rh}th — supportive lord linkage.`);
      score += 6;
    } else if ([6, 8].includes(rh)) {
      potentialDifferences.push(
        `Lagna lords form a ${rh}th-style link — negotiate autonomy consciously.`,
      );
      score -= 6;
    }
  }

  complementary.push(
    "Differences in Lagna style can complement if one leads initiative and the other steadies follow-through.",
  );

  const moonDist = signDistance(chartA.moonSign, chartB.moonSign);
  if (moonDist <= 2)
    naturalAlignment.push("Moons are close — emotional tempo may sync with personality.");
  else
    potentialDifferences.push(
      "Moon distance adds a different emotional layer on top of Lagna style.",
    );

  const tone = toneFromScore(clamp(score));
  return {
    id: "lagnaCompatibility",
    title: "Core Personality Compatibility",
    tone,
    dual: {
      simple: "How your natural styles meet — first reactions, life direction, and planning tempo.",
      vedic: "Compares Lagna, Lagna lords, and Moon signs between charts.",
    },
    strengths: naturalAlignment.slice(0, 5),
    challenges: potentialDifferences.slice(0, 4),
    facts: {
      lagnaA: chartA.lagnaSign,
      lagnaB: chartB.lagnaSign,
      lagnaLordA: lordA,
      lagnaLordB: lordB,
      moonA: chartA.moonSign,
      moonB: chartB.moonSign,
    },
    naturalAlignment: naturalAlignment.slice(0, 5),
    potentialDifferences: potentialDifferences.slice(0, 4),
    complementary: complementary.slice(0, 3),
  };
}

export function analyzeSelfPartnerAxis(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AmdModuleBlock & { signInsights: DualView[] } {
  const seventhA = seventhLord(chartA.lagnaSign);
  const seventhB = seventhLord(chartB.lagnaSign);
  const seventhSignA = SIGNS[(signId(chartA.lagnaSign) + 6) % 12] ?? "Libra";
  const seventhSignB = SIGNS[(signId(chartB.lagnaSign) + 6) % 12] ?? "Libra";

  const strengths = [
    `Person A embodies ${chartA.lagnaSign} energy and may encounter ${seventhSignA} themes through partnership.`,
    `Person B embodies ${chartB.lagnaSign} energy and may encounter ${seventhSignB} themes through partnership.`,
  ];
  const challenges: string[] = [];
  const signInsights: DualView[] = [];

  for (const [lagna, other] of [
    [chartA.lagnaSign, chartB.lagnaSign],
    [chartA.lagnaSign, seventhSignA],
    [chartB.lagnaSign, seventhSignB],
  ] as const) {
    const key = axisKey(lagna, other);
    const insight = SIGN_AXIS_INSIGHT[key];
    if (insight) signInsights.push(insight);
  }

  if (POLAR_PAIRS[chartA.lagnaSign] === chartB.lagnaSign) {
    strengths.push(
      "Your Lagnas form a classical 1/7 polarity — strong attraction with a need for balance.",
    );
  } else {
    challenges.push(
      "Lagnas are not exact polarity pairs — still valid; polarity insights are contextual only.",
    );
  }

  return {
    id: "selfPartnerAxis",
    title: "Self & Partner Axis",
    tone: "Balanced",
    dual: {
      simple: "What energy you naturally embody — and qualities partnership may invite.",
      vedic: `1st/7th signs: A ${chartA.lagnaSign}/${seventhSignA} (7L ${seventhA}); B ${chartB.lagnaSign}/${seventhSignB} (7L ${seventhB}).`,
    },
    strengths: strengths.slice(0, 5),
    challenges: challenges.slice(0, 3),
    facts: {
      seventhSignA,
      seventhSignB,
      seventhLordA: seventhA,
      seventhLordB: seventhB,
    },
    signInsights: signInsights.slice(0, 4),
  };
}

export function analyzeYoniIntimacy(
  gunaBreakdown: GunaItem[],
  nakshatraA: string,
  nakshatraB: string,
  ashtaYoni?: { you: YoniAnimal; them: YoniAnimal; score: number; harmony: string } | null,
): AmdModuleBlock & {
  attractionTendencies: string[];
  communicationGuidance: string[];
  yoniA: YoniAnimal;
  yoniB: YoniAnimal;
} {
  const yoniA = ashtaYoni?.you || yoniAnimalForNakshatra(nakshatraA);
  const yoniB = ashtaYoni?.them || yoniAnimalForNakshatra(nakshatraB);
  const yoniRow = gunaBreakdown.find((g) => g.koota === "Yoni");
  const score = ashtaYoni?.score ?? yoniRow?.score ?? 2;
  const max = yoniRow?.max ?? 4;
  const pct = (score / max) * 100;

  const attractionTendencies = [
    `${yoniA.name} (${yoniA.energy}) with ${yoniB.name} (${yoniB.energy}).`,
    ashtaYoni?.harmony || yoniRow?.note || "Yoni harmony from Ashta Koota.",
  ];
  const communicationGuidance = [
    "Discuss comfort, pacing, and affection preferences openly — Yoni is never the sole intimacy measure.",
    "Consent, kindness, and emotional safety outweigh any single koota.",
  ];
  const strengths: string[] = [];
  const challenges: string[] = [];
  if (pct >= 66) strengths.push("Strong Alignment — temperament signals look encouraging.");
  else if (pct >= 40) strengths.push("Potential Differences — workable with communication.");
  else challenges.push("Potential Differences — prioritize dialogue over assumptions.");

  return {
    id: "yoniIntimacy",
    title: "Intimacy Compatibility (Yoni)",
    tone: toneFromScore(clamp(pct)),
    dual: {
      simple:
        pct >= 66
          ? "Attraction temperament shows encouraging alignment — still nurture closeness through care."
          : "Attraction temperament may differ — communication guidance matters more than the score.",
      vedic: `Yoni ${score}/${max} from Moon nakshatras ${nakshatraA} / ${nakshatraB}. Respectful relationship framing only.`,
    },
    strengths: strengths.concat(attractionTendencies).slice(0, 5),
    challenges: challenges.slice(0, 3),
    facts: {
      yoniA: yoniA.name,
      yoniB: yoniB.name,
      score,
      max,
    },
    attractionTendencies,
    communicationGuidance,
    yoniA,
    yoniB,
  };
}

export function analyzeSaturnResponsibility(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AmdModuleBlock & { constructive: string[]; challenging: string[] } {
  const constructive: string[] = [];
  const challenging: string[] = [];
  let score = 64;

  for (const [label, chart] of [
    ["Person A", chartA],
    ["Person B", chartB],
  ] as const) {
    const saturn = planet(chart, "Saturn");
    const sLord = seventhLord(chart.lagnaSign);
    const venus = planet(chart, "Venus");
    if (!saturn) continue;

    constructive.push(`${label}: Saturn in ${saturn.sign} (house ${saturn.house}).`);
    score += dignityBoost(saturn.dignity) / 2;

    if (saturn.house === 7 || saturn.planet === sLord) {
      constructive.push(`${label}: Saturn linked with partnership — duty and endurance themes.`);
      score += 4;
    }
    if (saturn.house === 6 || saturn.house === 8 || saturn.house === 12) {
      challenging.push(
        `${label}: Saturn in house ${saturn.house} may feel like delay, distance, or heavy duty — still workable with patience.`,
      );
      score -= 5;
    }
    if (venus && saturn.sign === venus.sign) {
      challenging.push(
        `${label}: Saturn with Venus sign can slow affection expression — schedule warmth deliberately.`,
      );
      score -= 3;
    }
    if (saturn.house === 1 || saturn.house === 4 || saturn.house === 10) {
      constructive.push(
        `${label}: Saturn in a foundational house can stabilize long-term commitment.`,
      );
      score += 3;
    }
  }

  if (!challenging.length) {
    constructive.push("No automatic “bad Saturn” verdict — endurance can be a gift when mutual.");
  }

  return {
    id: "saturnResponsibility",
    title: "Responsibility & Commitment Dynamics",
    tone: toneFromScore(clamp(score)),
    dual: {
      simple: "Saturn speaks to duty, pacing, and long-haul commitment — not doom.",
      vedic: "Saturn vs 7th/Venus placements; constructive endurance vs rigidity/delay themes.",
    },
    strengths: constructive.slice(0, 5),
    challenges: challenging.slice(0, 4),
    facts: {},
    constructive: constructive.slice(0, 5),
    challenging: challenging.slice(0, 4),
  };
}

export function analyzeNinthSeventh(chartA: AmdChartInput, chartB: AmdChartInput): AmdModuleBlock {
  const strengths: string[] = [];
  const challenges: string[] = [];
  let score = 62;

  for (const [label, chart] of [
    ["Person A", chartA],
    ["Person B", chartB],
  ] as const) {
    const ninthSign = SIGNS[(signId(chart.lagnaSign) + 8) % 12] ?? "Sagittarius";
    const ninthLord = HOUSE_LORDS[ninthSign as (typeof SIGNS)[number]];
    const seventhSign = SIGNS[(signId(chart.lagnaSign) + 6) % 12] ?? "Libra";
    const sLord = seventhLord(chart.lagnaSign);
    const ninthPlace = planet(chart, ninthLord);
    const seventhPlace = planet(chart, sLord);

    strengths.push(`${label}: 9th lord ${ninthLord}, 7th lord ${sLord} (${seventhSign} 7th).`);

    if (ninthPlace) {
      if ([6, 8, 12].includes(ninthPlace.house)) {
        challenges.push(
          `${label}: 9th lord in house ${ninthPlace.house} — check supports before labeling fortune weak.`,
        );
        score -= 3;
        if (dignityBoost(ninthPlace.dignity) > 0) {
          strengths.push(`${label}: 9th lord dignity support softens dusthana placement.`);
          score += 4;
        }
      } else {
        strengths.push(
          `${label}: 9th lord in house ${ninthPlace.house} can support growth-through-bond themes.`,
        );
        score += 4;
      }
    }

    if (ninthPlace && seventhPlace) {
      const rh = relativeHouseBetween(ninthPlace.sign, seventhPlace.sign);
      if ([1, 5, 9, 11].includes(rh)) {
        strengths.push(
          `${label}: 9th–7th lords link by ${rh}th — fortune/partnership conversation.`,
        );
        score += 5;
      } else if ([6, 8].includes(rh)) {
        challenges.push(
          `${label}: 9th–7th lords in ${rh}th-style link — grow shared dharma consciously.`,
        );
        score -= 4;
      }
    }
  }

  return {
    id: "ninthSeventh",
    title: "Fortune & Partnership Connection",
    tone: toneFromScore(clamp(score)),
    dual: {
      simple:
        "How partnership may relate to growth, meaning, and shared direction — tendencies only.",
      vedic:
        "9th house/lord with 7th house/lord; dusthana 9th-lord placements weighed with dignity supports.",
    },
    strengths: strengths.slice(0, 6),
    challenges: challenges.slice(0, 4),
    facts: {},
  };
}

export function analyzeArudha(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AmdModuleBlock & {
  personA: ReturnType<typeof computeArudhaMap>;
  personB: ReturnType<typeof computeArudhaMap>;
  axisA: ReturnType<typeof classifyArudhaAxis>;
  axisB: ReturnType<typeof classifyArudhaAxis>;
} {
  const personA = computeArudhaMap({ lagnaSign: chartA.lagnaSign, planets: chartA.planets });
  const personB = computeArudhaMap({ lagnaSign: chartB.lagnaSign, planets: chartB.planets });
  const axisA = classifyArudhaAxis(personA.arudhaLagna, personA.arudhaSeventh);
  const axisB = classifyArudhaAxis(personB.arudhaLagna, personB.arudhaSeventh);

  let score = 60;
  if (axisA.classification === "supportive") score += 10;
  if (axisB.classification === "supportive") score += 10;
  if (axisA.classification === "challenging") score -= 8;
  if (axisB.classification === "challenging") score -= 8;

  const cross = classifyArudhaAxis(personA.arudhaLagna, personB.arudhaLagna);

  return {
    id: "arudha",
    title: "Relationship Perception & Arudha View",
    tone: toneFromScore(clamp(score)),
    dual: {
      simple: "An aerial view of how the relationship may be perceived — not a marriage verdict.",
      vedic: `AL/A7: A ${personA.arudhaLagna}/${personA.arudhaSeventh}; B ${personB.arudhaLagna}/${personB.arudhaSeventh}. ${axisA.label}; ${axisB.label}. Cross AL ${cross.label}.`,
    },
    strengths: [
      axisA.classification === "supportive" ? `Person A: ${axisA.label}` : null,
      axisB.classification === "supportive" ? `Person B: ${axisB.label}` : null,
      cross.classification === "supportive" ? `Between charts: ${cross.label}` : null,
    ].filter(Boolean) as string[],
    challenges: [
      axisA.classification === "challenging" ? `Person A: ${axisA.label}` : null,
      axisB.classification === "challenging" ? `Person B: ${axisB.label}` : null,
      cross.classification === "challenging" ? `Between charts: ${cross.label}` : null,
    ].filter(Boolean) as string[],
    facts: {
      alA: personA.arudhaLagna,
      a7A: personA.arudhaSeventh,
      alB: personB.arudhaLagna,
      a7B: personB.arudhaSeventh,
      advancedTechnique: true,
    },
    personA,
    personB,
    axisA,
    axisB,
  };
}

export function analyzeRelationshipBalance(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
): AmdModuleBlock & { balanceLabel: string } {
  function willScore(chart: AmdChartInput) {
    let s = 40;
    const sun = planet(chart, "Sun");
    const mars = planet(chart, "Mars");
    const saturn = planet(chart, "Saturn");
    const moon = planet(chart, "Moon");
    if (sun && (sun.house === 1 || sun.house === 10 || sun.house === 7)) s += 12;
    if (mars && (mars.house === 1 || mars.house === 7 || mars.house === 10)) s += 10;
    if (saturn && (saturn.house === 1 || saturn.house === 7)) s += 8;
    if (moon && (moon.house === 1 || moon.house === 4)) s -= 4;
    s += dignityBoost(sun?.dignity) / 2;
    s += dignityBoost(mars?.dignity) / 2;
    return clamp(s);
  }

  const a = willScore(chartA);
  const b = willScore(chartB);
  const diff = Math.abs(a - b);

  let balanceLabel = "Independent partnership";
  if (diff <= 8) balanceLabel = "Independent partnership";
  else if (diff <= 16) balanceLabel = "Support-oriented dynamic";
  else if (diff <= 24) balanceLabel = "Strong-willed pairing";
  else balanceLabel = "Leadership imbalance potential — need for conscious equality";

  return {
    id: "relationshipBalance",
    title: "Relationship Balance",
    tone: diff <= 16 ? "Supportive" : diff <= 24 ? "Balanced" : "Requires Awareness",
    dual: {
      simple: `${balanceLabel}. Awareness beats fear — negotiate decisions as equals.`,
      vedic: `Will-markers from Sun/Mars/Saturn/Moon house emphasis (A ${a} / B ${b}). Not a dominant-partner verdict.`,
    },
    strengths:
      diff <= 16
        ? ["Will indicators are relatively balanced."]
        : ["Difference in assertiveness can be complementary if respected."],
    challenges:
      diff > 24
        ? ["Make space for both voices in major decisions."]
        : ["Keep checking that one person's pace does not silence the other."],
    facts: { willA: a, willB: b, diff },
    balanceLabel,
  };
}

export type DashaSnippet = {
  currentMaha?: string | null;
  currentAntar?: string | null;
} | null;

export function analyzeTimingActivation(
  chartA: AmdChartInput,
  chartB: AmdChartInput,
  dashaA: DashaSnippet,
  dashaB: DashaSnippet,
  gocharAvailable: boolean,
): AmdModuleBlock & { gocharStatus: string; activationNotes: string[] } {
  const activationNotes: string[] = [];
  const marriageLords = new Set<string>();

  for (const chart of [chartA, chartB]) {
    marriageLords.add(seventhLord(chart.lagnaSign));
    marriageLords.add("Venus");
    marriageLords.add("Jupiter");
  }

  for (const [label, dasha] of [
    ["Person A", dashaA],
    ["Person B", dashaB],
  ] as const) {
    if (!dasha?.currentMaha) {
      activationNotes.push(`${label}: Dasha not available — generate kundli/dasha first.`);
      continue;
    }
    const maha = dasha.currentMaha;
    const antar = dasha.currentAntar || "—";
    activationNotes.push(`${label}: current ${maha} / ${antar}.`);
    if (marriageLords.has(maha) || (dasha.currentAntar && marriageLords.has(dasha.currentAntar))) {
      activationNotes.push(
        `${label}: current dasha touches Venus/7th/Jupiter-related lords — relationship themes may feel louder (tendency, not fate).`,
      );
    } else {
      activationNotes.push(
        `${label}: current dasha is not primarily a classic marriage-lord period — other life themes may lead.`,
      );
    }
  }

  const gocharStatus = gocharAvailable
    ? "Live Gochar is available elsewhere in the product for timing windows; AMD cites dasha activation here."
    : "Transit activation analysis is not included in this AMD module snapshot.";

  return {
    id: "timingActivation",
    title: "Timing Activation",
    tone: "Balanced",
    dual: {
      simple: "Certain relationship themes may feel more noticeable in relevant dasha periods.",
      vedic: "Uses stored Vimshottari current Maha/Antar; does not invent Gochar positions in AMD.",
    },
    strengths: activationNotes.filter((n) => /louder|available/i.test(n)).slice(0, 3),
    challenges: activationNotes.filter((n) => /not primarily|not available/i.test(n)).slice(0, 3),
    facts: {
      mahaA: dashaA?.currentMaha || null,
      antarA: dashaA?.currentAntar || null,
      mahaB: dashaB?.currentMaha || null,
      antarB: dashaB?.currentAntar || null,
    },
    gocharStatus,
    activationNotes,
  };
}
