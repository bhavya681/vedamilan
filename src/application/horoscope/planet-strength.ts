import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import {
  EXALTATION_LONGITUDE,
  angularDistance,
  nakshatraLord,
  uchchaVirupas,
} from "@/application/horoscope/vedic-constants";

export type PlanetStrength = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  nakshatraLord: string | null;
  dignity: string | null;
  isRetrograde: boolean;
  strength: "strong" | "moderate" | "needs-attention";
  score: number;
  factors: string[];
  houseKinds: string[];
  interpretation: string;
  isClassical: boolean;
  breakdown: {
    dignity: number;
    house: number;
    nakshatra: number;
    retrograde: number;
  };
  degreeInSign: number | null;
  avastha: string;
  combust: boolean;
};

export type StrengthLab = {
  planets: PlanetStrength[];
  strongest: PlanetStrength | null;
  weakest: PlanetStrength | null;
  overallTheme: string;
  methodology: string;
  source: string;
};

export type StrengthPlanetInput = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  dignity: string | null;
  isRetrograde: boolean;
  longitude?: number;
  speed?: number;
};

const CLASSICAL_GRAHAS = new Set([
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
]);

const FRIENDS: Record<string, string[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};

const ENEMIES: Record<string, string[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon", "Mars"],
  Saturn: ["Sun", "Moon", "Mars"],
};

function houseKinds(house: number): string[] {
  const kinds: string[] = [];
  if ([1, 4, 7, 10].includes(house)) kinds.push("Kendra");
  if ([1, 5, 9].includes(house)) kinds.push("Trikona");
  if ([6, 8, 12].includes(house)) kinds.push("Dusthana");
  if ([3, 6, 10, 11].includes(house)) kinds.push("Upachaya");
  if ([2, 7].includes(house)) kinds.push("Maraka");
  if (kinds.length === 0) kinds.push("Panapara");
  return kinds;
}

function interpretStrength(p: {
  planet: string;
  sign: string;
  house: number;
  dignity: string | null;
  isRetrograde: boolean;
  strength: PlanetStrength["strength"];
  score: number;
  houseKinds: string[];
  nakshatraLord: string | null;
  combust: boolean;
}): string {
  const bits: string[] = [];
  if (p.dignity === "Exalted") bits.push("exalted — able to give results with less obstruction");
  else if (p.dignity === "Own") bits.push("in own sign — stable and self-supported");
  else if (p.dignity === "Debilitated")
    bits.push("debilitated — needs supportive dasha, aspects, or remedies");
  else bits.push(`in ${p.sign}`);

  if (p.houseKinds.includes("Kendra")) bits.push("angular (Kendra) — action-oriented");
  if (p.houseKinds.includes("Trikona") && !p.houseKinds.includes("Kendra")) {
    bits.push("trinal (Trikona) — dharmic support");
  }
  if (p.houseKinds.includes("Dusthana"))
    bits.push("dusthana — works through effort, delay, or transformation");
  if (p.isRetrograde) bits.push("retrograde — results often turn inward or arrive later");
  if (p.nakshatraLord) bits.push(`nakshatra lord ${p.nakshatraLord}`);
  if (p.combust) bits.push("combust — solar proximity reduces visible expression");

  return `${p.planet} is ${p.strength.replace("-", " ")} (${p.score}/100). ${bits.join("; ")}.`;
}

function dignityScore(
  planet: string,
  dignity: string | null,
  longitude: number | undefined,
): number {
  if (typeof longitude === "number" && EXALTATION_LONGITUDE[planet] != null) {
    const uchcha = uchchaVirupas(planet, longitude);
    return Math.round(35 + (uchcha / 60) * 55);
  }
  if (dignity === "Exalted") return 90;
  if (dignity === "Own") return 80;
  if (dignity === "Neutral") return 55;
  if (dignity === "Debilitated") return 35;
  return 40;
}

function houseScore(house: number): number {
  const kendra = new Set([1, 4, 7, 10]);
  const trikona = new Set([1, 5, 9]);
  if (kendra.has(house)) return 15;
  if (trikona.has(house)) return 12;
  if (house === 6 || house === 8 || house === 12) return -10;
  return 5;
}

function relationToLord(planet: string, lord: string): "own" | "friend" | "neutral" | "enemy" {
  if (planet === lord) return "own";
  if (FRIENDS[planet]?.includes(lord)) return "friend";
  if (ENEMIES[planet]?.includes(lord)) return "enemy";
  return "neutral";
}

function nakshatraScore(nakshatra: string, planet: string): { score: number; lord: string | null } {
  if (!nakshatra) return { score: 0, lord: null };
  const lord = nakshatraLord(nakshatra);
  const relation = relationToLord(planet, lord);
  const score = relation === "own" ? 12 : relation === "friend" ? 8 : relation === "enemy" ? -6 : 2;
  return { score, lord };
}

function retroAdjustment(planet: string, isRetrograde: boolean): number {
  if (!isRetrograde) return 0;
  const benefic = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
  return benefic.has(planet) ? -5 : 5;
}

function avasthaFor(sign: string, degreeInSign: number): string {
  const odd = ["Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"].includes(sign);
  const span = degreeInSign / 6;
  const stage = Math.min(4, Math.floor(span));
  const oddOrder = ["Bala", "Kumara", "Yuva", "Vriddha", "Mrita"];
  const evenOrder = ["Mrita", "Vriddha", "Yuva", "Kumara", "Bala"];
  return (odd ? oddOrder : evenOrder)[stage] ?? "Yuva";
}

function combustOf(
  planet: string,
  longitude: number | undefined,
  sunLongitude: number | undefined,
): boolean {
  if (planet === "Sun" || planet === "Moon" || planet === "Rahu" || planet === "Ketu") return false;
  if (typeof longitude !== "number" || typeof sunLongitude !== "number") return false;
  const orb: Record<string, number> = { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 };
  const limit = orb[planet] ?? 8;
  return angularDistance(longitude, sunLongitude) <= limit;
}

function strengthLabel(score: number): PlanetStrength["strength"] {
  if (score >= 70) return "strong";
  if (score >= 45) return "moderate";
  return "needs-attention";
}

export function computePlanetStrengthFromChart(planets: StrengthPlanetInput[]): StrengthLab {
  const sunLongitude = planets.find((p) => p.planet === "Sun")?.longitude;

  const strengths: PlanetStrength[] = planets.map((p) => {
    const base = dignityScore(p.planet, p.dignity, p.longitude);
    const hScore = houseScore(p.house);
    const nScore = nakshatraScore(p.nakshatra, p.planet);
    const rScore = retroAdjustment(p.planet, p.isRetrograde);
    const combust = combustOf(p.planet, p.longitude, sunLongitude);
    const combustPenalty = combust ? -12 : 0;
    const total = Math.max(
      0,
      Math.min(100, base + hScore + nScore.score + rScore + combustPenalty),
    );
    const kinds = houseKinds(p.house);
    const label = strengthLabel(total);
    const degreeInSign = typeof p.longitude === "number" ? ((p.longitude % 30) + 30) % 30 : null;

    const factors: string[] = [];
    if (p.dignity === "Exalted") factors.push("Exalted");
    if (p.dignity === "Own") factors.push("Own sign");
    if (p.dignity === "Debilitated") factors.push("Debilitated");
    for (const kind of kinds) {
      if (kind !== "Panapara") factors.push(kind);
    }
    if (p.isRetrograde) factors.push("Retrograde");
    if (nScore.lord) {
      const rel = relationToLord(p.planet, nScore.lord);
      if (rel === "own") factors.push(`Own nakshatra (${nScore.lord})`);
      else if (rel === "friend") factors.push(`Friendly nakshatra lord ${nScore.lord}`);
      else if (rel === "enemy") factors.push(`Enemy nakshatra lord ${nScore.lord}`);
    }
    if (combust) factors.push("Combust");

    return {
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      nakshatra: p.nakshatra,
      nakshatraLord: nScore.lord,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
      strength: label,
      score: total,
      factors,
      houseKinds: kinds,
      interpretation: interpretStrength({
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        dignity: p.dignity,
        isRetrograde: p.isRetrograde,
        strength: label,
        score: total,
        houseKinds: kinds,
        nakshatraLord: nScore.lord,
        combust,
      }),
      isClassical: CLASSICAL_GRAHAS.has(p.planet),
      breakdown: {
        dignity: base,
        house: hScore,
        nakshatra: nScore.score,
        retrograde: rScore + combustPenalty,
      },
      degreeInSign,
      avastha: degreeInSign == null ? "—" : avasthaFor(p.sign, degreeInSign),
      combust,
    };
  });

  const classical = strengths.filter((p) => p.isClassical);
  const ranked = [...(classical.length > 0 ? classical : strengths)].sort(
    (a, b) => b.score - a.score,
  );
  const strongest = ranked[0] || null;
  const weakest = ranked[ranked.length - 1] || null;

  const themes: string[] = [];
  if (strongest && strongest.score >= 75) themes.push(`${strongest.planet} leads your chart`);
  if (weakest && weakest.score <= 40)
    themes.push(`${weakest.planet} may need supportive practices`);
  const kendraPlanets = classical.filter((p) => p.houseKinds.includes("Kendra"));
  if (kendraPlanets.length >= 3) themes.push("Strong angular emphasis");
  const trikonaPlanets = classical.filter((p) => p.houseKinds.includes("Trikona"));
  if (trikonaPlanets.length >= 3) themes.push("Strong trinal emphasis");
  const dusthana = classical.filter((p) => p.houseKinds.includes("Dusthana"));
  if (dusthana.length >= 3)
    themes.push("Multiple dusthana placements — channels energy through transformation");

  return {
    planets: strengths,
    strongest,
    weakest,
    overallTheme: themes.join("; ") || "Balanced planetary emphasis",
    methodology:
      "Score is built from natal kundli rows: dignity from longitude vs exaltation degree, house kind from lagna, nakshatra lord from the Vimshottari sequence, retrograde from stored speed, combustion from Sun longitude orbs.",
    source:
      "Natal kundli planet rows (sign, house, longitude, nakshatra, speed). Not a static ranking.",
  };
}

export class PlanetStrengthService {
  async forUser(userId: string): Promise<StrengthLab> {
    await connectMongo();
    const chart = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = (chart.planets || []) as StrengthPlanetInput[];
    return computePlanetStrengthFromChart(planets);
  }
}

export const planetStrengthService = new PlanetStrengthService();
