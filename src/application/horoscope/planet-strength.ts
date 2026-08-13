import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type PlanetStrength = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  dignity: string | null;
  isRetrograde: boolean;
  strength: "strong" | "moderate" | "needs-attention";
  score: number;
  factors: string[];
};

export type StrengthLab = {
  planets: PlanetStrength[];
  strongest: PlanetStrength | null;
  weakest: PlanetStrength | null;
  overallTheme: string;
};

function dignityScore(dignity: string | null): number {
  if (dignity === "Exalted") return 90;
  if (dignity === "Own") return 80;
  if (dignity === "Neutral") return 55;
  return 40;
}

function houseScore(house: number, _planet: string): number {
  const kendra = new Set([1, 4, 7, 10]);
  const trikona = new Set([1, 5, 9]);
  if (kendra.has(house)) return 15;
  if (trikona.has(house)) return 12;
  if (house === 6 || house === 8 || house === 12) return -10;
  return 5;
}

function nakshatraScore(nakshatra: string, planet: string): number {
  const friendly: Record<string, string[]> = {
    Jupiter: ["Ashwini", "Pushya", "Hasta", "Swati", "Anuradha", "Revati"],
    Venus: ["Bharani", "Purva Phalguni", "Vishakha", "Purva Bhadrapada", "Uttara Bhadrapada"],
    Mercury: ["Ashlesha", "Jyeshtha", "Mula", "Chitra", "Dhanishta"],
    Mars: ["Krittika", "Mrigashira", "Chitra", "Jyeshtha", "Mula", "Dhanishta"],
    Sun: ["Krittika", "Uttara Phalguni", "Swati", "Shatabhisha"],
    Moon: ["Rohini", "Hasta", "Shravana", "Dhanishta", "Revati"],
    Saturn: ["Pushya", "Anuradha", "Uttara Bhadrapada", "Dhanishta", "Shatabhisha"],
    Rahu: ["Ashwini", "Swati", "Shatabhisha"],
    Ketu: ["Ashwini", "Magha", "Mula"],
  };
  const list = friendly[planet];
  return list && list.includes(nakshatra) ? 10 : 0;
}

function retroAdjustment(planet: string, isRetrograde: boolean): number {
  if (!isRetrograde) return 0;
  const benefic = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
  return benefic.has(planet) ? -5 : 5;
}

function strengthLabel(score: number): PlanetStrength["strength"] {
  if (score >= 70) return "strong";
  if (score >= 45) return "moderate";
  return "needs-attention";
}

export class PlanetStrengthService {
  async forUser(userId: string): Promise<StrengthLab> {
    await connectMongo();
    const chart = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = (chart.planets || []) as Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
      dignity: string | null;
      isRetrograde: boolean;
    }>;

    const strengths: PlanetStrength[] = planets.map((p) => {
      const base = dignityScore(p.dignity);
      const hScore = houseScore(p.house, p.planet);
      const nScore = nakshatraScore(p.nakshatra, p.planet);
      const rScore = retroAdjustment(p.planet, p.isRetrograde);
      const total = Math.max(0, Math.min(100, base + hScore + nScore + rScore));

      const factors: string[] = [];
      if (p.dignity === "Exalted") factors.push("Exalted");
      if (p.dignity === "Own") factors.push("Own sign");
      if (p.dignity === "Debilitated") factors.push("Debilitated");
      if ([1, 4, 7, 10].includes(p.house)) factors.push("Kendra");
      if ([1, 5, 9].includes(p.house)) factors.push("Trikona");
      if (p.isRetrograde) factors.push("Retrograde");
      if (nScore > 0) factors.push("Friendly nakshatra");

      return {
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        nakshatra: p.nakshatra,
        dignity: p.dignity,
        isRetrograde: p.isRetrograde,
        strength: strengthLabel(total),
        score: total,
        factors,
      };
    });

    const sorted = [...strengths].sort((a, b) => b.score - a.score);
    const strongest = sorted[0] || null;
    const weakest = sorted[sorted.length - 1] || null;

    const themes: string[] = [];
    if (strongest && strongest.score >= 75) themes.push(`${strongest.planet} leads your chart`);
    if (weakest && weakest.score <= 40)
      themes.push(`${weakest.planet} may need supportive practices`);
    const kendraPlanets = strengths.filter((p) => [1, 4, 7, 10].includes(p.house));
    if (kendraPlanets.length >= 3) themes.push("Strong angular emphasis");
    const trikonaPlanets = strengths.filter((p) => [1, 5, 9].includes(p.house));
    if (trikonaPlanets.length >= 3) themes.push("Strong trinal emphasis");
    const dusthana = strengths.filter((p) => [6, 8, 12].includes(p.house));
    if (dusthana.length >= 3)
      themes.push("Multiple dusthana placements — channels energy through transformation");

    return {
      planets: strengths,
      strongest,
      weakest,
      overallTheme: themes.join("; ") || "Balanced planetary emphasis",
    };
  }
}

export const planetStrengthService = new PlanetStrengthService();
