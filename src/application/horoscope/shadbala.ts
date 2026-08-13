import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type ShadbalaComponent = {
  name: string;
  sanskrit: string;
  score: number;
  max: number;
  note: string;
};

export type PlanetShadbala = {
  planet: string;
  sign: string;
  house: number;
  total: number;
  percentage: number;
  grade: "Excellent" | "Good" | "Average" | "Weak";
  components: ShadbalaComponent[];
  interpretation: string;
};

export type ShadbalaLab = {
  planets: PlanetShadbala[];
  strongest: PlanetShadbala | null;
  weakest: PlanetShadbala | null;
  overallTheme: string;
};

const KENDRA = new Set([1, 4, 7, 10]);
const TRIKONA = new Set([1, 5, 9]);
const DUSTHANA = new Set([6, 8, 12]);

const OWN_SIGNS: Record<string, string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"],
};

const EXALTED_SIGNS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra",
};

function sthanaBala(
  planet: string,
  house: number,
  sign: string,
  dignity: string | null,
): { score: number; note: string } {
  let score = 0;
  const notes: string[] = [];

  if (KENDRA.has(house)) {
    score += 15;
    notes.push("Kendra");
  }
  if (TRIKONA.has(house)) {
    score += 12;
    notes.push("Trikona");
  }
  if (house === 1) {
    score += 8;
    notes.push("Lagna");
  }
  if (DUSTHANA.has(house)) {
    score -= 8;
    notes.push("Dusthana");
  }

  if (dignity === "Own" || OWN_SIGNS[planet]?.includes(sign)) {
    score += 10;
    notes.push("Own sign");
  }
  if (dignity === "Exalted" || EXALTED_SIGNS[planet] === sign) {
    score += 15;
    notes.push("Exalted");
  }
  if (dignity === "Debilitated") {
    score -= 10;
    notes.push("Debilitated");
  }

  return {
    score: Math.max(0, Math.min(60, score)),
    note: notes.join(", ") || "Neutral placement",
  };
}

function digBala(planet: string, sign: string): { score: number; note: string } {
  const dirMap: Record<string, Record<string, number>> = {
    Sun: {
      Aries: 10,
      Taurus: 5,
      Gemini: 0,
      Cancer: -5,
      Leo: 10,
      Virgo: 5,
      Libra: 0,
      Scorpio: -5,
      Sagittarius: 10,
      Capricorn: 5,
      Aquarius: 0,
      Pisces: -5,
    },
    Moon: {
      Cancer: 10,
      Leo: 5,
      Virgo: 0,
      Libra: -5,
      Scorpio: 0,
      Sagittarius: 5,
      Capricorn: 10,
      Aquarius: 5,
      Pisces: 0,
      Aries: -5,
      Taurus: 0,
      Gemini: 5,
    },
    Mars: {
      Capricorn: 10,
      Aquarius: 5,
      Pisces: 0,
      Aries: -5,
      Taurus: 0,
      Gemini: 5,
      Cancer: 10,
      Leo: 5,
      Virgo: 0,
      Libra: -5,
      Scorpio: 0,
      Sagittarius: 5,
    },
    Mercury: {
      Virgo: 10,
      Libra: 5,
      Scorpio: 0,
      Sagittarius: -5,
      Capricorn: 0,
      Aquarius: 5,
      Pisces: 10,
      Aries: 5,
      Taurus: 0,
      Gemini: -5,
      Cancer: 0,
      Leo: 5,
    },
    Jupiter: {
      Cancer: 10,
      Leo: 5,
      Virgo: 0,
      Libra: -5,
      Scorpio: 0,
      Sagittarius: 5,
      Capricorn: 10,
      Aquarius: 5,
      Pisces: 0,
      Aries: -5,
      Taurus: 0,
      Gemini: 5,
    },
    Venus: {
      Pisces: 10,
      Aries: 5,
      Taurus: 0,
      Gemini: -5,
      Cancer: 0,
      Leo: 5,
      Virgo: 10,
      Libra: 5,
      Scorpio: 0,
      Sagittarius: -5,
      Capricorn: 0,
      Aquarius: 5,
    },
    Saturn: {
      Libra: 10,
      Scorpio: 5,
      Sagittarius: 0,
      Capricorn: -5,
      Aquarius: 0,
      Pisces: 5,
      Aries: 10,
      Taurus: 5,
      Gemini: 0,
      Cancer: -5,
      Leo: 0,
      Virgo: 5,
    },
  };

  const score = dirMap[planet]?.[sign] ?? 0;
  const note =
    score >= 5 ? "Directionally strong" : score <= -5 ? "Directionally weak" : "Neutral direction";
  return { score: Math.max(0, Math.min(20, 10 + score)), note };
}

function kalaBala(
  planet: string,
  isRetrograde: boolean,
  house: number,
): { score: number; note: string } {
  let score = 5;
  const notes: string[] = [];

  if (planet === "Sun" || planet === "Jupiter") {
    score += 3;
    notes.push("Day strong");
  }
  if (planet === "Moon" || planet === "Saturn") {
    score += 2;
    notes.push("Night favorable");
  }
  if (isRetrograde) {
    score += 2;
    notes.push("Chesta");
  }
  if (house === 1 || house === 10) {
    score += 3;
    notes.push("Angular");
  }

  return {
    score: Math.max(0, Math.min(20, score)),
    note: notes.join(", ") || "Neutral temporal",
  };
}

function chestaBala(planet: string, isRetrograde: boolean): { score: number; note: string } {
  const malefic = new Set(["Mars", "Saturn", "Rahu", "Ketu"]);

  if (!isRetrograde) {
    return { score: 8, note: "Direct motion" };
  }

  const base = malefic.has(planet) ? 14 : 10;
  return {
    score: base,
    note: malefic.has(planet)
      ? "Retrograde malefic — intensified"
      : "Retrograde benefic — reflective",
  };
}

function naisargikaBala(planet: string): { score: number; note: string } {
  const natural: Record<string, number> = {
    Sun: 60,
    Moon: 50,
    Mars: 40,
    Mercury: 35,
    Jupiter: 55,
    Venus: 45,
    Saturn: 30,
  };
  const score = natural[planet] ?? 30;
  const note =
    score >= 50 ? "Natural benefic" : score >= 35 ? "Neutral nature" : "Natural malefic influence";
  return { score: Math.min(60, score), note };
}

function drikBala(
  planet: string,
  planets: Array<{ planet: string; sign: string; isRetrograde: boolean }>,
): { score: number; note: string } {
  const benefic = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
  const malefic = new Set(["Mars", "Saturn", "Rahu", "Ketu"]);

  let positive = 0;
  let negative = 0;

  for (const p of planets) {
    if (p.planet === planet) continue;
    if (benefic.has(p.planet)) positive += 1;
    if (malefic.has(p.planet)) negative += 1;
  }

  const score = Math.max(0, Math.min(20, 10 + positive * 2 - negative * 2));
  const note =
    positive > negative
      ? "Favorable aspects"
      : negative > positive
        ? "Challenging aspects"
        : "Balanced aspects";
  return { score, note };
}

function grade(total: number): PlanetShadbala["grade"] {
  if (total >= 300) return "Excellent";
  if (total >= 220) return "Good";
  if (total >= 150) return "Average";
  return "Weak";
}

function interpretation(planet: string, total: number, g: PlanetShadbala["grade"]): string {
  const themes: Record<string, Record<string, string>> = {
    Sun: {
      Excellent: "Strong vitality and authority",
      Good: "Good self-expression",
      Average: "Moderate vitality",
      Weak: "Low vitality — needs solar practices",
    },
    Moon: {
      Excellent: "Emotional balance and clarity",
      Good: "Stable mind",
      Average: "Variable moods",
      Weak: "Emotional sensitivity — lunar routines help",
    },
    Mars: {
      Excellent: "Strong drive and courage",
      Good: "Good energy for action",
      Average: "Moderate drive",
      Weak: "Energy blocks — physical discipline helps",
    },
    Mercury: {
      Excellent: "Sharp intellect and communication",
      Good: "Good learning ability",
      Average: "Moderate intellect",
      Weak: "Mental restlessness — grounding practices",
    },
    Jupiter: {
      Excellent: "Wisdom and expansion strong",
      Good: "Good fortune and learning",
      Average: "Moderate growth",
      Weak: "Limited expansion — spiritual study",
    },
    Venus: {
      Excellent: "Strong harmony and relationships",
      Good: "Good creative energy",
      Average: "Moderate pleasures",
      Weak: "Relationship refinement needed",
    },
    Saturn: {
      Excellent: "Strong discipline and longevity",
      Good: "Good structure and focus",
      Average: "Moderate discipline",
      Weak: "Heavy karma — structured routine essential",
    },
  };
  return themes[planet]?.[g] || `${g} overall strength`;
}

export class ShadbalaService {
  async forUser(userId: string): Promise<ShadbalaLab> {
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
      speedLongitude?: number;
    }>;

    const shadbala: PlanetShadbala[] = planets
      .filter((p) =>
        ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p.planet),
      )
      .map((p) => {
        const sthana = sthanaBala(p.planet, p.house, p.sign, p.dignity);
        const dig = digBala(p.planet, p.sign);
        const kala = kalaBala(p.planet, p.isRetrograde, p.house);
        const chesta = chestaBala(p.planet, p.isRetrograde);
        const naisargika = naisargikaBala(p.planet);
        const drik = drikBala(p.planet, planets);

        const total =
          sthana.score + dig.score + kala.score + chesta.score + naisargika.score + drik.score;
        const g = grade(total);

        return {
          planet: p.planet,
          sign: p.sign,
          house: p.house,
          total,
          percentage: Math.min(100, Math.round((total / 330) * 100)),
          grade: g,
          components: [
            {
              name: "Sthana",
              sanskrit: "Sthana Bala",
              score: sthana.score,
              max: 60,
              note: sthana.note,
            },
            { name: "Dig", sanskrit: "Dig Bala", score: dig.score, max: 20, note: dig.note },
            { name: "Kala", sanskrit: "Kala Bala", score: kala.score, max: 20, note: kala.note },
            {
              name: "Chesta",
              sanskrit: "Chesta Bala",
              score: chesta.score,
              max: 20,
              note: chesta.note,
            },
            {
              name: "Naisargika",
              sanskrit: "Naisargika Bala",
              score: naisargika.score,
              max: 60,
              note: naisargika.note,
            },
            { name: "Drik", sanskrit: "Drik Bala", score: drik.score, max: 20, note: drik.note },
          ],
          interpretation: interpretation(p.planet, total, g),
        };
      });

    const sorted = [...shadbala].sort((a, b) => b.total - a.total);
    const strongest = sorted[0] || null;
    const weakest = sorted[sorted.length - 1] || null;

    const themes: string[] = [];
    if (strongest && strongest.percentage >= 70)
      themes.push(`${strongest.planet} shows the highest Shadbala`);
    if (weakest && weakest.percentage <= 50)
      themes.push(`${weakest.planet} may benefit from supportive practices`);
    const excellent = shadbala.filter((p) => p.grade === "Excellent").length;
    if (excellent >= 3)
      themes.push("Multiple planets with excellent strength — chart supports action");
    const weak = shadbala.filter((p) => p.grade === "Weak").length;
    if (weak >= 3) themes.push("Several planets require attention — remedial focus advised");

    return {
      planets: shadbala,
      strongest,
      weakest,
      overallTheme: themes.join("; ") || "Balanced planetary strength distribution",
    };
  }
}

export const shadbalaService = new ShadbalaService();
