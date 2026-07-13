import { CompatibilityReport, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { ENGINE_VERSION } from "@/application/horoscope/vedic-constants";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { pairKey, scoreAshtaKoota } from "./ashta-koota";
import { computeMarriageWindows } from "./marriage-timing";

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

export class CompatibilityService {
  async compare(userAId: string, userBId: string) {
    if (userAId === userBId) throw new ValidationError("Cannot compare a profile with itself");
    await connectMongo();

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

    const dashaA = await Dasha.findOne({ userId: userAId }).sort({ calculatedAt: -1 }).lean();
    const windows = computeMarriageWindows(
      (dashaA?.periods as never[]) || [],
      chartA.manglikStatus || "UNKNOWN",
    );

    const key = pairKey(userAId, userBId);
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
          overallScore: scored.overallScore,
          strengths: scored.strengths,
          challenges: scored.challenges,
          marriageWindows: windows,
          engineVersion: ENGINE_VERSION,
          calculatedAt: new Date(),
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    const [profileA, profileB] = await Promise.all([
      Profile.findOne({ userId: userAId }).lean(),
      Profile.findOne({ userId: userBId }).lean(),
    ]);

    return {
      report: doc,
      profiles: {
        a: { userId: userAId, city: profileA?.city, profession: profileA?.profession },
        b: { userId: userBId, city: profileB?.city, profession: profileB?.profession },
      },
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
    const windows = computeMarriageWindows(
      (dasha.periods as never[]) || [],
      chart.manglikStatus || "UNKNOWN",
    );
    return { windows, manglikStatus: chart.manglikStatus, currentMaha: dasha.currentMaha };
  }
}

export const compatibilityService = new CompatibilityService();
