import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";

export type ChartPlanetLite = {
  planet: string;
  sign: string;
  house: number;
  longitude?: number;
  isRetrograde?: boolean;
  dignity?: string | null;
  nakshatra?: string;
};

export type VenusInteraction = {
  direction: "A→B" | "B→A";
  venusSign: string;
  occupantPlanet: string | null;
  theme: string;
  marriageStyle: string;
  strengths: string[];
  challenges: string[];
  score: number; // /10
  confidence: "High" | "Medium" | "Low";
  reason: string;
};

export type ShukraMilanResult = {
  venusA: ChartPlanetLite | null;
  venusB: ChartPlanetLite | null;
  interactions: VenusInteraction[];
  averageScore: number; // /10
  percent: number; // 0–100
  observation: string;
  reasoning: string;
  positives: string[];
  challenges: string[];
  manifestation: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  confidence: "High" | "Medium" | "Low";
};

type VenusGuide = {
  theme: string;
  marriageStyle: string;
  strengths: string[];
  challenges: string[];
  score: number;
  confidence: VenusInteraction["confidence"];
};

const GUIDE: Record<string, VenusGuide> = {
  Rahu: {
    theme: "Modern · exciting · experimental affection",
    marriageStyle: "Adventure-oriented, possibly foreign or unconventional influence",
    strengths: ["High attraction", "Curiosity", "Willingness to reinvent the bond"],
    challenges: ["Restlessness", "Boundary testing", "Need for conscious grounding"],
    score: 7.4,
    confidence: "Medium",
  },
  Ketu: {
    theme: "Past-life karmic · detachment lessons",
    marriageStyle: "Spiritually charged with sudden cooling phases",
    strengths: ["Deep soul recognition", "Spiritual growth", "Detachment from ego games"],
    challenges: [
      "Sudden endings if neglected",
      "Emotional distance",
      "Needs conscious intimacy rituals",
    ],
    score: 6.2,
    confidence: "Medium",
  },
  Saturn: {
    theme: "Duty-bound affection",
    marriageStyle: "Stable · slow · responsible",
    strengths: ["Long-term commitment", "Reliability", "Mutual maturity"],
    challenges: ["Delayed emotional expression", "Relationship may feel serious"],
    score: 8.7,
    confidence: "Medium",
  },
  Jupiter: {
    theme: "Wisdom · mutual growth",
    marriageStyle: "Growth-oriented partnership with shared ideals",
    strengths: ["Guidance", "Optimism", "Shared ethics"],
    challenges: ["Possible ideological clashes", "Moralizing under stress"],
    score: 8.5,
    confidence: "High",
  },
  Moon: {
    theme: "Romantic · emotional bonding",
    marriageStyle: "Mood-sensitive caring partnership",
    strengths: ["Warmth", "Nurture", "Emotional availability"],
    challenges: ["Mood fluctuations", "Over-sensitivity"],
    score: 8.0,
    confidence: "High",
  },
  Mercury: {
    theme: "Love languages through words & wit",
    marriageStyle: "Conversation-led affection",
    strengths: ["Playfulness", "Intellectual spark", "Adaptability"],
    challenges: ["Different communication styles", "Need conscious listening"],
    score: 7.0,
    confidence: "Medium",
  },
  Mars: {
    theme: "High chemistry · passion",
    marriageStyle: "Energetic and assertive attraction",
    strengths: ["Physical spark", "Drive", "Protective loyalty"],
    challenges: ["Conflict heat", "Impatience", "Ego friction"],
    score: 7.5,
    confidence: "Medium",
  },
  Sun: {
    theme: "Respect · pride · recognition",
    marriageStyle: "Partnership needing appreciation and dignity",
    strengths: ["Loyalty", "Status support", "Clear roles"],
    challenges: ["Pride clashes", "Need for recognition"],
    score: 8.0,
    confidence: "Medium",
  },
  Venus: {
    theme: "Mutual Venusian harmony",
    marriageStyle: "Aesthetic, affectionate, pleasure-oriented bond",
    strengths: ["Shared romance", "Taste alignment", "Soft affection"],
    challenges: ["Indulgence", "Conflict avoidance"],
    score: 8.8,
    confidence: "High",
  },
};

const EMPTY_GUIDE: VenusGuide = {
  theme: "Subtle Venus field without a strong planetary occupant",
  marriageStyle: "Affection depends more on house dignity and dasha support",
  strengths: ["Room to define love consciously", "Fewer fixed planetary overlays"],
  challenges: ["Less automatic chemistry from this technique alone"],
  score: 6.5,
  confidence: "Low",
};

const PLANET_PRIORITY = [
  "Saturn",
  "Jupiter",
  "Venus",
  "Mars",
  "Moon",
  "Sun",
  "Mercury",
  "Rahu",
  "Ketu",
];

function planetsInSign(planets: ChartPlanetLite[], sign: string): ChartPlanetLite[] {
  return planets.filter(
    (p) =>
      p.sign === sign && p.planet !== "Uranus" && p.planet !== "Neptune" && p.planet !== "Pluto",
  );
}

function pickOccupant(planets: ChartPlanetLite[]): ChartPlanetLite | null {
  if (!planets.length) return null;
  const ranked = [...planets].sort(
    (a, b) => PLANET_PRIORITY.indexOf(a.planet) - PLANET_PRIORITY.indexOf(b.planet),
  );
  return ranked[0] ?? null;
}

function buildInteraction(
  direction: VenusInteraction["direction"],
  venusSign: string,
  occupant: ChartPlanetLite | null,
): VenusInteraction {
  const guide = occupant ? GUIDE[occupant.planet] || EMPTY_GUIDE : EMPTY_GUIDE;
  return {
    direction,
    venusSign,
    occupantPlanet: occupant?.planet ?? null,
    theme: guide.theme,
    marriageStyle: guide.marriageStyle,
    strengths: guide.strengths,
    challenges: guide.challenges,
    score: guide.score,
    confidence: guide.confidence,
    reason: occupant
      ? `Person ${direction === "A→B" ? "A" : "B"} Venus in ${venusSign} meets ${occupant.planet} in the partner's chart (Venus-sign interaction).`
      : `Person ${direction === "A→B" ? "A" : "B"} Venus in ${venusSign} finds no major planet occupying that sign in the partner's chart.`,
  };
}

function dignityBoost(dignity?: string | null): number {
  if (dignity === "Exalted") return 0.4;
  if (dignity === "Own") return 0.25;
  return 0;
}

function houseLoveScore(house: number): number {
  if ([1, 4, 5, 7, 10, 11].includes(house)) return 0.3;
  if ([6, 8, 12].includes(house)) return -0.25;
  return 0;
}

export function scoreShukraMilan(
  planetsA: ChartPlanetLite[],
  planetsB: ChartPlanetLite[],
): ShukraMilanResult {
  const venusA = planetsA.find((p) => p.planet === "Venus") || null;
  const venusB = planetsB.find((p) => p.planet === "Venus") || null;

  const interactions: VenusInteraction[] = [];
  if (venusA) {
    interactions.push(
      buildInteraction("A→B", venusA.sign, pickOccupant(planetsInSign(planetsB, venusA.sign))),
    );
  }
  if (venusB) {
    interactions.push(
      buildInteraction("B→A", venusB.sign, pickOccupant(planetsInSign(planetsA, venusB.sign))),
    );
  }

  let averageScore =
    interactions.length > 0
      ? interactions.reduce((s, i) => s + i.score, 0) / interactions.length
      : 5;

  // Dignity / house refinements (small, transparent)
  if (venusA) averageScore += dignityBoost(venusA.dignity) / 2 + houseLoveScore(venusA.house) / 2;
  if (venusB) averageScore += dignityBoost(venusB.dignity) / 2 + houseLoveScore(venusB.house) / 2;
  if (venusA?.isRetrograde || venusB?.isRetrograde) averageScore -= 0.15;

  averageScore = Math.max(1, Math.min(10, Number(averageScore.toFixed(2))));
  const percent = Math.round(averageScore * 10);

  const positives = [
    ...new Set(interactions.flatMap((i) => i.strengths)),
    venusA
      ? `A Venus in ${venusA.sign} (house ${venusA.house}${venusA.dignity ? `, ${venusA.dignity}` : ""})`
      : "",
    venusB
      ? `B Venus in ${venusB.sign} (house ${venusB.house}${venusB.dignity ? `, ${venusB.dignity}` : ""})`
      : "",
  ].filter(Boolean);

  const challenges = [...new Set(interactions.flatMap((i) => i.challenges))];

  const severity: ShukraMilanResult["severity"] =
    averageScore >= 8 ? "LOW" : averageScore >= 6.5 ? "MEDIUM" : "HIGH";

  const confidence: ShukraMilanResult["confidence"] = interactions.every(
    (i) => i.confidence === "High",
  )
    ? "High"
    : interactions.some((i) => i.confidence === "Low")
      ? "Low"
      : "Medium";

  return {
    venusA,
    venusB,
    interactions,
    averageScore,
    percent,
    observation: `Shukra Milan averages ${averageScore}/10 across Venus-sign interactions.`,
    reasoning:
      "Venus-sign matching checks which planet occupies Person A's Venus sign in Person B's chart (and vice versa). This is layered with Venus dignity, house, and retrograde notes — not a standalone marriage verdict.",
    positives,
    challenges,
    manifestation:
      interactions.map((i) => `${i.direction}: ${i.theme}`).join(" · ") ||
      "Insufficient Venus data for manifestation notes.",
    severity,
    confidence,
  };
}

export function seventhLord(lagnaSign: string): string {
  const idx = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
  const seventh = SIGNS[(idx + 6) % 12] ?? "Libra";
  return HOUSE_LORDS[seventh as (typeof SIGNS)[number]] ?? "Venus";
}
