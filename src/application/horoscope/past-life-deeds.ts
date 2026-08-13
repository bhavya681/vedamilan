import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type KarmicTheme = {
  planet: string;
  pastLifeIndication: string;
  doThis: string[];
  avoidThis: string[];
  traditionalSource: string;
};

export type PastLifeDeeds = {
  themes: KarmicTheme[];
  overallGuidance: string;
  disclaimer: string;
};

const KARMIC_TEMPLATES: Record<string, Omit<KarmicTheme, "planet">> = {
  Sun: {
    pastLifeIndication:
      "The Sun reflects the soul's relationship with authority, father, and self-expression. Weak or afflicted Sun may indicate past-life issues with ego, leadership, or honoring paternal/guru figures.",
    doThis: [
      "Respect father and elders",
      "Practice morning Surya Namaskar",
      "Offer water to Sun at sunrise",
      "Develop humility and avoid arrogance",
    ],
    avoidThis: [
      "Abusing authority or power",
      "Excessive pride or ego-driven decisions",
      "Neglecting self-discipline",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Surya Graha principles",
  },
  Moon: {
    pastLifeIndication:
      "The Moon carries the mind and emotional conditioning. Afflicted Moon may indicate past-life emotional instability, neglect of mother, or mental restlessness.",
    doThis: [
      "Respect mother and women",
      "Practice meditation and mind calming",
      "Donate milk or white items on Mondays",
      "Keep the mind gentle and truthful",
    ],
    avoidThis: [
      "Harboring malice or emotional manipulation",
      "Excessive indulgence in mental fantasies",
      "Disrespecting mother or caregivers",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Chandra Graha principles",
  },
  Mars: {
    pastLifeIndication:
      "Mars governs courage, siblings, and land. Afflicted Mars may indicate past-life violence, broken relationships with siblings, or misuse of courage.",
    doThis: [
      "Practice physical discipline (yoga, martial arts)",
      "Maintain good relations with siblings",
      "Serve the poor and protect the weak",
      "Avoid unnecessary arguments",
    ],
    avoidThis: [
      "Violence or cruelty",
      "Harming siblings or friends",
      "Impatience and reckless courage",
    ],
    traditionalSource: "Mangalika / Mangal Dosha references in classical texts",
  },
  Mercury: {
    pastLifeIndication:
      "Mercury rules intellect and communication. Afflicted Mercury may indicate past-life deceit, broken promises, or misuse of learning.",
    doThis: [
      "Speak truthfully and kindly",
      "Study sacred texts regularly",
      "Respect teachers and scholars",
      "Donate green items or books",
    ],
    avoidThis: [
      "Lying or deceptive speech",
      "Mocking learning or teachers",
      "Scattered or wasteful communication",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Budha Graha principles",
  },
  Jupiter: {
    pastLifeIndication:
      "Jupiter is the guru and dharma karaka. Weak Jupiter may indicate past-life disregard for dharma, gurus, or spiritual knowledge.",
    doThis: [
      "Respect gurus and spiritual teachers",
      "Practice charity and teaching",
      "Wear or donate yellow items",
      "Study scripture and uphold vows",
    ],
    avoidThis: [
      "Disrespecting dharma or spiritual guidance",
      "Hypocrisy or false religiosity",
      "Hoarding wealth without gratitude",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Guru Graha principles",
  },
  Venus: {
    pastLifeIndication:
      "Venus governs marriage, relationships, and pleasures. Afflicted Venus may indicate past-life relationship karma, disrespect toward spouse, or unbalanced desires.",
    doThis: [
      "Respect your partner and all women",
      "Practice gratitude in relationships",
      "Donate white/sweet items on Fridays",
      "Cultivate purity in relationships",
    ],
    avoidThis: [
      "Disrespecting wife or partner",
      "Unethical relationships",
      "Excessive indulgence in sensual pleasures",
      "Betrayal in trust",
    ],
    traditionalSource: "Jataka Parijata / classical Venus remedies",
  },
  Saturn: {
    pastLifeIndication:
      "Saturn is the karmic taskmaster. Afflicted Saturn strongly indicates unresolved past-life karmas, debts, or neglect of duty.",
    doThis: [
      "Serve the elderly and disabled",
      "Work with discipline without complaint",
      "Donate black items or sesame oil",
      "Accept hardships as karmic purification",
    ],
    avoidThis: [
      "Neglecting duty or responsibility",
      "Causing suffering to the marginalized",
      "Excessive laziness or escapism",
    ],
    traditionalSource: " Brihat Parashara Hora Shastra — Shani Graha and Karma Siddhanta",
  },
  Rahu: {
    pastLifeIndication:
      "Rahu represents unconventional past-life patterns, obsessions, or foreign influences. May indicate past-life attachments or unfulfilled ambitions.",
    doThis: [
      "Practice detachment from obsessions",
      "Respect ancestors and offer prayers",
      "Donate to those in need anonymously",
      "Ground yourself through routine",
    ],
    avoidThis: [
      "Unethical shortcuts or manipulation",
      "Excessive material obsession",
      "Betrayal or conspiracy",
    ],
    traditionalSource: "Rahu-Ketu mythology and Karma theory in Jyotish",
  },
  Ketu: {
    pastLifeIndication:
      "Ketu represents past-life spiritual attainment, detachment, or sudden losses. May indicate moksha-oriented karma or unresolved spiritual debts.",
    doThis: [
      "Practice meditation and spiritual study",
      "Serve without expectation",
      "Resect gurus and saints",
      "Practice detachment and simplicity",
    ],
    avoidThis: [
      "Excessive attachment to material identity",
      "Spiritual hypocrisy or showmanship",
      "Neglecting present duties for escapism",
    ],
    traditionalSource: "Ketu in classical texts — moksha karaka principles",
  },
};

function getTheme(planet: string): Omit<KarmicTheme, "planet"> {
  return (
    KARMIC_TEMPLATES[planet] || {
      pastLifeIndication:
        "Classical texts suggest every planet carries karmic memory. This placement may reflect past-life patterns related to the planet's nature.",
      doThis: [
        "Practice dharmic living",
        "Respect the planet's nature through seva",
        "Study the planet's symbolism in scripture",
      ],
      avoidThis: [
        "Acting against the planet's dharma",
        "Causing harm through this planetary energy",
      ],
      traditionalSource: "General Jyotish principles",
    }
  );
}

export class PastLifeDeedsService {
  async forUser(userId: string): Promise<PastLifeDeeds> {
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

    const themes: KarmicTheme[] = planets
      .filter((p) => p.planet in KARMIC_TEMPLATES)
      .map((p) => {
        const template = getTheme(p.planet);
        return {
          planet: p.planet,
          pastLifeIndication: template.pastLifeIndication,
          doThis: [...template.doThis],
          avoidThis: [...template.avoidThis],
          traditionalSource: template.traditionalSource,
        };
      });

    const challenged = themes.filter((t) => {
      const planet = planets.find((p) => p.planet === t.planet);
      if (!planet) return false;
      return (
        planet.dignity === "Debilitated" || planet.isRetrograde || [6, 8, 12].includes(planet.house)
      );
    });

    const overallGuidance =
      challenged.length > 0
        ? `Classical Jyotish identifies ${challenged.length} placement${challenged.length > 1 ? "s" : ""} that may carry stronger karmic weight. Focus on dharma, seva, and disciplined practice.`
        : "Your chart shows balanced planetary dignity. Continue dharmic living and spiritual practice.";

    return {
      themes,
      overallGuidance,
      disclaimer:
        "Traditional Jyotish interpretation — not deterministic. For personalized guidance, consult a qualified practitioner.",
    };
  }
}

export const pastLifeDeedsService = new PastLifeDeedsService();
