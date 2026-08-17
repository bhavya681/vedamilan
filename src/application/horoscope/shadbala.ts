import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type ShadbalaComponent = {
  name: string;
  sanskrit: string;
  score: number;
  max: number;
  /** Display units used by JHora / AstroSage (60 virupas = 1 rupa). */
  virupas: number;
  virupaMax: number;
  note: string;
};

export type PlanetShadbala = {
  planet: string;
  sign: string;
  house: number;
  /** Engine-unit total (legacy). Prefer `virupas` for display. */
  total: number;
  virupas: number;
  rupas: number;
  requiredVirupas: number;
  /** Virupas ÷ required. ≥ 1.00 meets the classical minimum. */
  ratio: number;
  meetsMinimum: boolean;
  ishtaPhala: number;
  kashtaPhala: number;
  percentage: number;
  grade: "Excellent" | "Good" | "Average" | "Weak";
  components: ShadbalaComponent[];
  interpretation: string;
};

export type ShadbalaLab = {
  methodology: string;
  planets: PlanetShadbala[];
  strongest: PlanetShadbala | null;
  weakest: PlanetShadbala | null;
  overallTheme: string;
};

/** BPHS required Shadbala (virupas). 60 virupas = 1 rupa. */
export const REQUIRED_VIRUPAS: Record<string, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
};

/** Parashara component maxima in virupas — used to scale engine v1 scores for display. */
const VIRUPA_MAX = {
  Sthana: 240,
  Dig: 60,
  Kala: 180,
  Chesta: 60,
  Naisargika: 60,
  Drik: 60,
} as const;

const DEBILITATED_SIGNS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries",
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

function toVirupa(score: number, engineMax: number, virupaMax: number): number {
  if (engineMax <= 0) return 0;
  return Math.round((Math.max(0, score) / engineMax) * virupaMax);
}

function ucchaBala(planet: string, sign: string, dignity: string | null): number {
  if (dignity === "Exalted" || EXALTED_SIGNS[planet] === sign) return 60;
  if (dignity === "Debilitated" || DEBILITATED_SIGNS[planet] === sign) return 0;
  if (dignity === "Own" || OWN_SIGNS[planet]?.includes(sign)) return 45;
  return 30;
}

function gradeFromRatio(ratio: number): PlanetShadbala["grade"] {
  if (ratio >= 1.25) return "Excellent";
  if (ratio >= 1) return "Good";
  if (ratio >= 0.75) return "Average";
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

        const components: ShadbalaComponent[] = [
          {
            name: "Sthana",
            sanskrit: "Sthana Bala",
            score: sthana.score,
            max: 60,
            virupas: toVirupa(sthana.score, 60, VIRUPA_MAX.Sthana),
            virupaMax: VIRUPA_MAX.Sthana,
            note: sthana.note,
          },
          {
            name: "Dig",
            sanskrit: "Dig Bala",
            score: dig.score,
            max: 20,
            virupas: toVirupa(dig.score, 20, VIRUPA_MAX.Dig),
            virupaMax: VIRUPA_MAX.Dig,
            note: dig.note,
          },
          {
            name: "Kala",
            sanskrit: "Kala Bala",
            score: kala.score,
            max: 20,
            virupas: toVirupa(kala.score, 20, VIRUPA_MAX.Kala),
            virupaMax: VIRUPA_MAX.Kala,
            note: kala.note,
          },
          {
            name: "Chesta",
            sanskrit: "Chesta Bala",
            score: chesta.score,
            max: 20,
            virupas: toVirupa(chesta.score, 20, VIRUPA_MAX.Chesta),
            virupaMax: VIRUPA_MAX.Chesta,
            note: chesta.note,
          },
          {
            name: "Naisargika",
            sanskrit: "Naisargika Bala",
            score: naisargika.score,
            max: 60,
            virupas: toVirupa(naisargika.score, 60, VIRUPA_MAX.Naisargika),
            virupaMax: VIRUPA_MAX.Naisargika,
            note: naisargika.note,
          },
          {
            name: "Drik",
            sanskrit: "Drik Bala",
            score: drik.score,
            max: 20,
            virupas: toVirupa(drik.score, 20, VIRUPA_MAX.Drik),
            virupaMax: VIRUPA_MAX.Drik,
            note: drik.note,
          },
        ];

        const total = components.reduce((sum, c) => sum + c.score, 0);
        const virupas = components.reduce((sum, c) => sum + c.virupas, 0);
        const requiredVirupas = REQUIRED_VIRUPAS[p.planet] ?? 300;
        const ratio = requiredVirupas > 0 ? virupas / requiredVirupas : 0;
        const g = gradeFromRatio(ratio);

        const uccha = ucchaBala(p.planet, p.sign, p.dignity);
        const chesta60 = toVirupa(chesta.score, 20, 60);
        const ishtaPhala = Math.round(Math.sqrt(uccha * chesta60));
        const kashtaPhala = Math.round(Math.sqrt((60 - uccha) * (60 - chesta60)));

        return {
          planet: p.planet,
          sign: p.sign,
          house: p.house,
          total,
          virupas,
          rupas: Math.round((virupas / 60) * 100) / 100,
          requiredVirupas,
          ratio: Math.round(ratio * 100) / 100,
          meetsMinimum: ratio >= 1,
          ishtaPhala,
          kashtaPhala,
          percentage: Math.round(ratio * 100),
          grade: g,
          components,
          interpretation: interpretation(p.planet, total, g),
        };
      });

    const sorted = [...shadbala].sort((a, b) => b.virupas - a.virupas);
    const strongest = sorted[0] || null;
    const weakest = sorted[sorted.length - 1] || null;

    const themes: string[] = [];
    if (strongest)
      themes.push(
        `${strongest.planet} leads at ${strongest.rupas} rupas (${strongest.ratio.toFixed(2)}× required)`,
      );
    if (weakest && !weakest.meetsMinimum)
      themes.push(`${weakest.planet} is below the classical minimum — supportive practices help`);
    const above = shadbala.filter((p) => p.meetsMinimum).length;
    if (above >= 5) themes.push("Most grahas meet required Shadbala — chart supports action");
    const weak = shadbala.filter((p) => p.grade === "Weak").length;
    if (weak >= 3) themes.push("Several planets require attention — remedial focus advised");

    return {
      methodology:
        "Displayed in Virupas (60 virupas = 1 rupa) with BPHS required minima, comparable to Jagannatha Hora and AstroSage strength tables. Engine v1 scales a teaching approximation to Parashara component maxima — directional, not a full degree-based Shadbala.",
      planets: shadbala,
      strongest,
      weakest,
      overallTheme: themes.join("; ") || "Balanced planetary strength distribution",
    };
  }
}

export const shadbalaService = new ShadbalaService();
