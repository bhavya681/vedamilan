import { CompatibilityReport, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { ENGINE_VERSION } from "@/application/horoscope/vedic-constants";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { pairKey, scoreAshtaKoota } from "./ashta-koota";
import { scoreAdvancedMarriageDynamics, type AmdChartInput } from "./advanced-marriage-dynamics";
import { scoreDeepCompatibility, type DeepChartInput } from "./deep-compatibility";
import { seventhLord, type ChartPlanetLite } from "./shukra-milan";
import {
  computeMarriageWindows,
  predictPairTiming,
  predictSelfTiming,
  type TimingPrediction,
} from "./timing-prediction";

function moonFromChart(horoscope: {
  moonSign?: string;
  planets?: Array<{ planet: string; nakshatra?: string; sign?: string }>;
}) {
  const moon = horoscope.planets?.find((p) => p.planet === "Moon");
  return {
    moonSign: horoscope.moonSign || moon?.sign || "Aries",
    nakshatra: moon?.nakshatra || "Ashwini",
  };
}

function toDeepChart(horoscope: {
  lagnaSign?: string | null;
  lagnaDegree?: number | null;
  moonSign?: string | null;
  sunSign?: string | null;
  manglikStatus?: string | null;
  planets?: unknown;
  houseLords?: unknown;
  shadbala?: unknown;
}): DeepChartInput {
  const lordsRaw = horoscope.houseLords;
  const houseLords: Record<string, string> = {};
  if (lordsRaw instanceof Map) {
    for (const [k, v] of lordsRaw.entries()) houseLords[String(k)] = String(v);
  } else if (lordsRaw && typeof lordsRaw === "object") {
    for (const [k, v] of Object.entries(lordsRaw as Record<string, unknown>)) {
      houseLords[String(k)] = String(v);
    }
  }

  const rawPlanets = Array.isArray(horoscope.planets) ? horoscope.planets : [];
  const planets: ChartPlanetLite[] = rawPlanets.map((item) => {
    const p = item as Record<string, unknown>;
    return {
      planet: String(p.planet || ""),
      sign: String(p.sign || "Aries"),
      house: Number(p.house || 1),
      longitude: typeof p.longitude === "number" ? p.longitude : undefined,
      isRetrograde: Boolean(p.isRetrograde),
      dignity: (p.dignity as string | null | undefined) ?? null,
      nakshatra: p.nakshatra ? String(p.nakshatra) : undefined,
    };
  });

  return {
    lagnaSign: horoscope.lagnaSign || "Aries",
    moonSign: horoscope.moonSign || "Aries",
    sunSign: horoscope.sunSign || "Aries",
    manglikStatus: horoscope.manglikStatus || undefined,
    planets,
    houseLords,
  };
}

function toAmdChart(horoscope: {
  lagnaSign?: string | null;
  lagnaDegree?: number | null;
  moonSign?: string | null;
  sunSign?: string | null;
  manglikStatus?: string | null;
  planets?: unknown;
  houseLords?: unknown;
  shadbala?: unknown;
}): AmdChartInput {
  const deep = toDeepChart(horoscope);
  const shadbala = horoscope.shadbala as { lagnaLongitude?: number } | null | undefined;
  return {
    ...deep,
    lagnaDegree: typeof horoscope.lagnaDegree === "number" ? horoscope.lagnaDegree : null,
    lagnaLongitude: typeof shadbala?.lagnaLongitude === "number" ? shadbala.lagnaLongitude : null,
  };
}

type PeriodRow = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

function periodsFrom(dasha: { periods?: unknown } | null | undefined): PeriodRow[] {
  return (dasha?.periods as PeriodRow[] | undefined) || [];
}

async function safeGochar(userId: string) {
  try {
    return await computeGocharForUser(userId);
  } catch {
    return null;
  }
}

export class CompatibilityService {
  async compare(userAId: string, userBId: string) {
    if (userAId === userBId) throw new ValidationError("Cannot compare a profile with itself");
    await connectMongo();

    const [profileA, profileB] = await Promise.all([
      Profile.findOne({ userId: userAId }).lean(),
      Profile.findOne({ userId: userBId }).lean(),
    ]);

    const genderA = profileA?.gender;
    const genderB = profileB?.gender;
    if (
      (genderA === "MALE" || genderA === "FEMALE") &&
      (genderB === "MALE" || genderB === "FEMALE") &&
      genderA === genderB
    ) {
      throw new ValidationError(
        "Compatibility is only available between male and female profiles. Same-gender matching is not supported.",
      );
    }

    const [chartA, chartB] = await Promise.all([
      Horoscope.findOne({ userId: userAId }).sort({ calculatedAt: -1 }).lean(),
      Horoscope.findOne({ userId: userBId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!chartA || !chartB) {
      throw new NotFoundError("Both users need generated kundli charts before compatibility");
    }

    const a = moonFromChart(chartA);
    const b = moonFromChart(chartB);
    const scored = scoreAshtaKoota({
      moonSignA: a.moonSign,
      moonSignB: b.moonSign,
      nakshatraA: a.nakshatra,
      nakshatraB: b.nakshatra,
      manglikA: chartA.manglikStatus || "UNKNOWN",
      manglikB: chartB.manglikStatus || "UNKNOWN",
    });

    const deep = scoreDeepCompatibility({
      chartA: toDeepChart(chartA),
      chartB: toDeepChart(chartB),
      gunaBreakdown: scored.gunaBreakdown,
      totalGuna: scored.totalGuna,
      maxGuna: scored.maxGuna,
    });

    const [dashaA, dashaB, gocharA] = await Promise.all([
      Dasha.findOne({ userId: userAId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId: userBId }).sort({ calculatedAt: -1 }).lean(),
      safeGochar(userAId),
    ]);

    const advancedMarriageDynamics = scoreAdvancedMarriageDynamics({
      chartA: toAmdChart(chartA),
      chartB: toAmdChart(chartB),
      gunaBreakdown: scored.gunaBreakdown,
      nakshatraA: a.nakshatra,
      nakshatraB: b.nakshatra,
      ashtaYoni: scored.yoni,
      dashaA: dashaA
        ? { currentMaha: dashaA.currentMaha, currentAntar: dashaA.currentAntar }
        : null,
      dashaB: dashaB
        ? { currentMaha: dashaB.currentMaha, currentAntar: dashaB.currentAntar }
        : null,
      gocharAvailable: Boolean(gocharA),
    });

    const periodsA = periodsFrom(dashaA);
    const periodsB = periodsFrom(dashaB);
    const seventhYou = seventhLord(chartA.lagnaSign || "Aries");
    const seventhThem = seventhLord(chartB.lagnaSign || "Aries");

    const timingPrediction: TimingPrediction = predictPairTiming({
      periodsYou: periodsA,
      periodsThem: periodsB,
      gocharPlanetsYou: gocharA?.planets,
      gocharHighlightsYou: gocharA?.highlights,
      manglikYou: chartA.manglikStatus || "UNKNOWN",
      manglikThem: chartB.manglikStatus || "UNKNOWN",
      seventhLordYou: seventhYou,
      seventhLordThem: seventhThem,
      overallCompatibilityScore: deep.overallScore,
      decisionSummary: deep.decisionSummary,
      currentMahaYou: dashaA?.currentMaha || null,
      currentAntarYou: dashaA?.currentAntar || null,
      currentMahaThem: dashaB?.currentMaha || null,
      currentAntarThem: dashaB?.currentAntar || null,
    });

    const windows = timingPrediction.bestMarriageWindows.map(
      ({ label, window, reason, score, dashaLabel, startDate, endDate, approxNote, kind }) => ({
        label,
        window,
        reason,
        score,
        dashaLabel,
        startDate,
        endDate,
        approxNote,
        kind,
      }),
    );

    // Decision reason always cites multi-module bond — never a single koota
    const decisionReason = `${deep.decisionReason} Timing read (dasha + gochar + bond): ${timingPrediction.marryNowTitle} (${timingPrediction.marryNowScore}/100).`;

    const key = pairKey(userAId, userBId);
    const mergedStrengths = [
      ...new Set([...(deep.topStrengths || []).slice(0, 6), ...(scored.strengths || [])]),
    ].slice(0, 12);
    const mergedChallenges = [
      ...new Set([...(deep.topChallenges || []).slice(0, 6), ...(scored.challenges || [])]),
    ].slice(0, 12);

    const doc = await CompatibilityReport.findOneAndUpdate(
      { pairKey: key },
      {
        $set: {
          userAId: key.split(":")[0],
          userBId: key.split(":")[1],
          pairKey: key,
          totalGuna: scored.totalGuna,
          maxGuna: scored.maxGuna,
          gunaBreakdown: scored.gunaBreakdown,
          manglikCompatibility: scored.manglikCompatibility,
          nadiDosha: scored.nadiDosha,
          bhakootDosha: scored.bhakootDosha,
          overallScore: deep.overallScore,
          deepOverallScore: deep.overallScore,
          decisionSummary: deep.decisionSummary,
          decisionReason,
          shukraMilan: deep.shukraMilan,
          deepAnalysis: {
            chartValidation: deep.chartValidation,
            modules: deep.modules,
            conflicts: deep.conflicts,
            remedies: deep.remedies,
            topStrengths: deep.topStrengths,
            topChallenges: deep.topChallenges,
          },
          categoryScores: deep.categoryScores,
          strengths: mergedStrengths,
          challenges: mergedChallenges,
          marriageWindows: windows,
          timingPrediction,
          advancedMarriageDynamics,
          engineVersion: ENGINE_VERSION,
          calculatedAt: new Date(),
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return {
      report: doc,
      profiles: {
        a: { userId: userAId, city: profileA?.city, profession: profileA?.profession },
        b: { userId: userBId, city: profileB?.city, profession: profileB?.profession },
      },
      timingPrediction,
    };
  }

  async listForUser(userId: string) {
    await connectMongo();
    return CompatibilityReport.find({
      $or: [{ userAId: userId }, { userBId: userId }],
      status: "ACTIVE",
    })
      .sort({ calculatedAt: -1 })
      .limit(50)
      .lean();
  }

  async marriageTimingForUser(userId: string) {
    await connectMongo();
    const chart = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    const dasha = await Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!chart || !dasha) {
      throw new NotFoundError("Generate kundli and dasha before marriage timing");
    }

    const gochar = await safeGochar(userId);
    const seventh = seventhLord(chart.lagnaSign || "Aries");
    const timingPrediction = predictSelfTiming({
      periods: periodsFrom(dasha),
      gocharPlanets: gochar?.planets,
      gocharHighlights: gochar?.highlights,
      manglikStatus: chart.manglikStatus || "UNKNOWN",
      seventhLord: seventh,
      currentMaha: dasha.currentMaha || null,
      currentAntar: dasha.currentAntar || null,
    });

    const windows = computeMarriageWindows(periodsFrom(dasha), chart.manglikStatus || "UNKNOWN");

    return {
      windows: timingPrediction.bestMarriageWindows.map(({ label, window, reason, score }) => ({
        label,
        window,
        reason,
        score,
      })),
      partnerArrivalWindows: timingPrediction.partnerArrivalWindows,
      manglikStatus: chart.manglikStatus,
      currentMaha: dasha.currentMaha,
      currentAntar: dasha.currentAntar,
      seventhLord: seventh,
      timingPrediction,
      gochar: gochar
        ? {
            asOf: gochar.asOf,
            highlights: gochar.highlights,
            natalLagna: gochar.natalLagna,
          }
        : null,
      /** @deprecated use timingPrediction.bestMarriageWindows */
      legacyWindows: windows,
    };
  }
}

export const compatibilityService = new CompatibilityService();
