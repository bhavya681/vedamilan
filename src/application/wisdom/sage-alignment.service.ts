import { natalKootaFromMoon } from "@/application/horoscope/natal-koota";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { Profile } from "@/infrastructure/database/models";
import {
  inferDefaultNeed,
  suggestSages,
  suggestionGuides,
  type AlignmentContext,
  type LifeNeedId,
} from "@/domain/wisdom/sage-alignment";

function planetName(value: string) {
  return value.trim().toLowerCase();
}

export class SageAlignmentService {
  async forUser(userId: string, need?: LifeNeedId) {
    await connectMongo();
    const [latest, profile] = await Promise.all([
      horoscopeService.getLatest(userId),
      Profile.findOne({ userId }).lean(),
    ]);

    const horoscope = latest?.horoscope;
    const dasha = latest?.dasha;
    const planets = horoscope?.planets ?? [];
    const moon = planets.find((row) => planetName(String(row.planet ?? "")) === "moon");
    const moonSign = horoscope?.moonSign || undefined;
    const nakshatra = moon?.nakshatra || horoscope?.lagnaNakshatra || undefined;
    const koota = moonSign && nakshatra ? natalKootaFromMoon({ moonSign, nakshatra }) : null;

    const yogaCategories = [
      ...new Set(
        (horoscope?.yogas ?? []).map((yoga) => String(yoga.category || "")).filter(Boolean),
      ),
    ];

    const context: AlignmentContext = {
      hasChart: Boolean(horoscope),
      moonSign,
      nakshatra,
      moonLord: koota?.moonLord.planet,
      gana: koota?.gana.label,
      varna: koota?.varna.label,
      currentMaha: dasha?.currentMaha || null,
      currentAntar: dasha?.currentAntar || null,
      yogaCategories,
      manglik: horoscope?.manglikStatus || null,
      profession: profile?.profession || null,
      maritalStatus: profile?.maritalStatus || null,
    };

    const resolvedNeed = need ?? inferDefaultNeed(context);
    const suggestions = suggestionGuides(suggestSages(context, resolvedNeed, 6));

    return {
      need: resolvedNeed,
      context: {
        hasChart: context.hasChart,
        moonSign: context.moonSign ?? null,
        nakshatra: context.nakshatra ?? null,
        gana: context.gana ?? null,
        varna: context.varna ?? null,
        currentMaha: context.currentMaha,
        currentAntar: context.currentAntar,
      },
      suggestions: suggestions.map((row) => ({
        guide: row.guide,
        score: row.score,
        reasons: row.reasons,
      })),
    };
  }
}

export const sageAlignmentService = new SageAlignmentService();
