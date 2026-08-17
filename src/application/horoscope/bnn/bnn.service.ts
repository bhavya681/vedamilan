import { Dasha, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";
import { BNN_METHODOLOGY, BNN_THEME_META, type BnnThemeId } from "./bnn-rules";
import {
  activateBnnThemes,
  detectBnnPatterns,
  matchBnnThemes,
  type BnnActivation,
  type BnnPattern,
  type BnnPlanet,
  type BnnThemeHit,
} from "./bnn-patterns";

export type BnnLab = {
  calculatedFromChart: true;
  methodology: string;
  lagnaSign: string;
  patterns: BnnPattern[];
  themes: Array<BnnThemeHit & { activation: BnnActivation }>;
  strongest: BnnThemeId[];
  dasha: { currentMaha: string | null; currentAntar: string | null };
  transitNote: string | null;
  emptyNote: string | null;
};

function asPlanets(raw: unknown): BnnPlanet[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => ({
    planet: String(p.planet ?? ""),
    sign: String(p.sign ?? ""),
    house: Number(p.house ?? 0),
    longitude: typeof p.longitude === "number" ? p.longitude : undefined,
    isRetrograde: Boolean(p.isRetrograde),
    nakshatra: p.nakshatra ? String(p.nakshatra) : undefined,
  }));
}

export class BnnAnalysisService {
  async forUser(userId: string): Promise<BnnLab> {
    await connectMongo();
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = asPlanets(chart.planets);
    const lagnaSign = String(chart.lagnaSign || "Aries");
    const patterns = detectBnnPatterns(planets);
    const themeHits = matchBnnThemes(patterns, planets, lagnaSign);

    let transitSigns: Array<{ planet: string; sign: string }> = [];
    let transitNote: string | null = null;
    try {
      const gochar = await computeGocharForUser(userId);
      transitSigns = (gochar.planets || []).map((p) => ({ planet: p.planet, sign: p.sign }));
    } catch {
      transitNote =
        "Gochar unavailable — transit activation left unknown where dasha also missing.";
    }

    const activations = activateBnnThemes(
      themeHits,
      dasha?.currentMaha ?? null,
      dasha?.currentAntar ?? null,
      transitSigns,
    );
    const byTheme = new Map(activations.map((a) => [a.theme, a]));
    const themes = themeHits.map((hit) => ({
      ...hit,
      activation: byTheme.get(hit.theme) ?? {
        theme: hit.theme,
        status: "unknown" as const,
        reason: "Activation not scored.",
      },
    }));

    const strongest = [...themes]
      .sort((a, b) => b.patterns.length - a.patterns.length)
      .slice(0, 3)
      .map((t) => t.theme);

    return {
      calculatedFromChart: true,
      methodology: BNN_METHODOLOGY,
      lagnaSign,
      patterns,
      themes,
      strongest,
      dasha: {
        currentMaha: dasha?.currentMaha ?? null,
        currentAntar: dasha?.currentAntar ?? null,
      },
      transitNote,
      emptyNote: themes.length
        ? null
        : "No documented BNN theme patterns matched this chart. Advanced combinations not in the v1 rule set are not invented.",
    };
  }

  overlapThemes(userThemes: BnnThemeId[], partnerThemes: BnnThemeId[]): BnnThemeId[] {
    return userThemes.filter((t) => partnerThemes.includes(t));
  }

  themeTitle(id: BnnThemeId): string {
    return BNN_THEME_META[id].title;
  }
}

export const bnnAnalysisService = new BnnAnalysisService();
