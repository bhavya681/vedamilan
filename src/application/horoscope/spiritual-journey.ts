import { Horoscope, Dasha } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import { HOUSE_LORDS } from "./vedic-constants";

export type SpiritualTheme = {
  house: number;
  theme: string;
  description: string;
  activePlanets: string[];
  lord: string;
  strength: "high" | "moderate" | "emerging";
};

export type SpiritualJourney = {
  themes: SpiritualTheme[];
  currentDasha: string | null;
  currentAntar: string | null;
  journeyPhase: string;
  practices: string[];
  reflections: string[];
  learningMilestones: string[];
};

const HOUSE_THEMES: Record<number, { theme: string; description: string }> = {
  5: {
    theme: "Creative intelligence",
    description:
      "5th house governs creativity, children, intellect, and spiritual practice initiation.",
  },
  9: {
    theme: "Dharma & higher wisdom",
    description:
      "9th house represents fortune, mentors, higher learning, and philosophical foundation.",
  },
  12: {
    theme: "Liberation & inner retreat",
    description: "12th house connects to moksha, foreign lands, solitude, and the subconscious.",
  },
};

function planetStrengthInHouse(planets: string[]): SpiritualTheme["strength"] {
  if (planets.length >= 2) return "high";
  if (planets.length === 1) return "moderate";
  return "emerging";
}

export class SpiritualJourneyService {
  async forUser(userId: string): Promise<SpiritualJourney> {
    await connectMongo();
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);

    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = (chart.planets || []) as Array<{
      planet: string;
      house: number;
      sign: string;
      nakshatra: string;
    }>;

    const themes: SpiritualTheme[] = [5, 9, 12].map((house) => {
      const housePlanets = planets.filter((p) => p.house === house).map((p) => p.planet);
      const info = HOUSE_THEMES[house];
      if (!info)
        return {
          house,
          theme: "",
          description: "",
          activePlanets: housePlanets,
          lord: HOUSE_LORDS[chart.lagnaSign as keyof typeof HOUSE_LORDS] || "Mars",
          strength: "emerging" as const,
        };
      return {
        house,
        theme: info.theme,
        description: info.description,
        activePlanets: housePlanets,
        lord: HOUSE_LORDS[chart.lagnaSign as keyof typeof HOUSE_LORDS] || "Mars",
        strength: planetStrengthInHouse(housePlanets),
      };
    });

    const jupiter = planets.find((p) => p.planet === "Jupiter");
    const ketu = planets.find((p) => p.planet === "Ketu");

    const currentMaha = dasha?.currentMaha || null;
    const currentAntar = dasha?.currentAntar || null;

    const dashaLord = currentMaha || "";
    const jupiterActive = dashaLord === "Jupiter" || currentAntar === "Jupiter";
    const ketuActive = dashaLord === "Ketu" || currentAntar === "Ketu";

    let journeyPhase = "Learning";
    if (jupiterActive || (jupiter && [5, 9, 12].includes(jupiter.house))) {
      journeyPhase = "Discipline";
    }
    if (ketuActive || (ketu && [12].includes(ketu.house))) {
      journeyPhase = "Reflection";
    }
    if (jupiterActive && ketuActive) {
      journeyPhase = "Detachment";
    }
    if (themes.some((t) => t.strength === "high")) {
      journeyPhase = "Wisdom";
    }
    if (themes.filter((t) => t.strength === "high").length >= 2) {
      journeyPhase = "Service";
    }

    const practices: string[] = [];
    if (jupiter && [5, 9].includes(jupiter.house)) practices.push("Mantra practice");
    if (ketu && [12].includes(ketu.house)) practices.push("Meditation");
    if (themes[0]?.strength === "high") practices.push("Creative sadhana");
    if (themes[1]?.strength === "high") practices.push("Scripture study");
    if (themes[2]?.strength === "high") practices.push("Seva and retreat");

    const reflections: string[] = [
      "Traditional Jyotish views the 5th, 9th, and 12th houses as the spiritual triangle.",
      "Jupiter represents dharma and guidance; Ketu represents moksha and detachment.",
      "Current dasha period colors how these themes manifest in daily life.",
    ];

    const learningMilestones: string[] = [
      "Understand your Moon nakshatra",
      "Study your 9th lord placement",
      "Track Jupiter transits",
      "Explore 12th house themes",
    ];

    return {
      themes,
      currentDasha: currentMaha,
      currentAntar: currentAntar,
      journeyPhase,
      practices: practices.length ? practices : ["General spiritual practice"],
      reflections,
      learningMilestones,
    };
  }
}

export const spiritualJourneyService = new SpiritualJourneyService();
