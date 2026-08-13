import { Horoscope, Dasha } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type ChartComparisonPlanet = {
  planet: string;
  userSign: string;
  partnerSign: string;
  userHouse: number;
  partnerHouse: number;
  userNakshatra: string;
  partnerNakshatra: string;
  sameSign: boolean;
  sameHouse: boolean;
};

export type ChartComparison = {
  userAscendant: string;
  partnerAscendant: string;
  userMoon: string;
  partnerMoon: string;
  userSun: string;
  partnerSun: string;
  userNakshatra: string;
  partnerNakshatra: string;
  planets: ChartComparisonPlanet[];
  dashaUser: { currentMaha: string | null; currentAntar: string | null };
  dashaPartner: { currentMaha: string | null; currentAntar: string | null };
  spiritualThemes: { user: string[]; partner: string[] };
  careerThemes: { user: string[]; partner: string[] };
  communicationThemes: { user: string[]; partner: string[] };
  emotionalThemes: { user: string[]; partner: string[] };
};

export class ChartComparisonService {
  async compare(userId: string, partnerUserId: string): Promise<ChartComparison> {
    await connectMongo();

    const [userChart, userDasha, partnerChart, partnerDasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Horoscope.findOne({ userId: partnerUserId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId: partnerUserId }).sort({ calculatedAt: -1 }).lean(),
    ]);

    if (!userChart) throw new NotFoundError("Generate your kundli first");
    if (!partnerChart) throw new NotFoundError("Partner kundli not found");

    const userPlanets = (userChart.planets || []) as Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
    }>;
    const partnerPlanets = (partnerChart.planets || []) as Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
    }>;

    const planetMap = new Map<
      string,
      { user: (typeof userPlanets)[0]; partner: (typeof partnerPlanets)[0] }
    >();
    for (const p of userPlanets)
      planetMap.set(p.planet, {
        user: p,
        partner: partnerPlanets.find((pp) => pp.planet === p.planet) || {
          planet: p.planet,
          sign: "—",
          house: 0,
          nakshatra: "—",
        },
      });
    for (const p of partnerPlanets) {
      if (!planetMap.has(p.planet)) {
        planetMap.set(p.planet, {
          user: { planet: p.planet, sign: "—", house: 0, nakshatra: "—" },
          partner: p,
        });
      }
    }

    const planets: ChartComparisonPlanet[] = Array.from(planetMap.values()).map(
      ({ user, partner }) => ({
        planet: user.planet,
        userSign: user.sign,
        partnerSign: partner.sign,
        userHouse: user.house,
        partnerHouse: partner.house,
        userNakshatra: user.nakshatra,
        partnerNakshatra: partner.nakshatra,
        sameSign: user.sign === partner.sign,
        sameHouse: user.house === partner.house && user.house > 0,
      }),
    );

    const userKetu = userPlanets.find((p) => p.planet === "Ketu");
    const partnerKetu = partnerPlanets.find((p) => p.planet === "Ketu");
    const userJupiter = userPlanets.find((p) => p.planet === "Jupiter");
    const partnerJupiter = partnerPlanets.find((p) => p.planet === "Jupiter");
    const userMoon = userPlanets.find((p) => p.planet === "Moon");
    const partnerMoon = partnerPlanets.find((p) => p.planet === "Moon");
    const userMercury = userPlanets.find((p) => p.planet === "Mercury");
    const partnerMercury = partnerPlanets.find((p) => p.planet === "Mercury");
    const userVenus = userPlanets.find((p) => p.planet === "Venus");
    const partnerVenus = partnerPlanets.find((p) => p.planet === "Venus");

    const spiritualThemes = {
      user: [
        userKetu ? `Ketu in ${userKetu.sign}` : "Ketu placement not available",
        userJupiter ? `Jupiter in ${userJupiter.sign}` : "Jupiter placement not available",
      ].filter(Boolean) as string[],
      partner: [
        partnerKetu ? `Ketu in ${partnerKetu.sign}` : "Ketu placement not available",
        partnerJupiter ? `Jupiter in ${partnerJupiter.sign}` : "Jupiter placement not available",
      ].filter(Boolean) as string[],
    };

    const careerThemes = {
      user: [
        userPlanets.filter((p) => [10].includes(p.house)).map((p) => `${p.planet} in 10th`),
        userPlanets.filter((p) => p.house === 10).length ? "Strong 10th house" : "",
      ].filter(Boolean) as string[],
      partner: [
        partnerPlanets.filter((p) => [10].includes(p.house)).map((p) => `${p.planet} in 10th`),
        partnerPlanets.filter((p) => p.house === 10).length ? "Strong 10th house" : "",
      ].filter(Boolean) as string[],
    };

    const communicationThemes = {
      user: [
        userMercury ? `Mercury in ${userMercury.sign}` : "Mercury placement not available",
        userPlanets.filter((p) => [3].includes(p.house)).map((p) => `${p.planet} in 3rd`),
      ].filter(Boolean) as string[],
      partner: [
        partnerMercury ? `Mercury in ${partnerMercury.sign}` : "Mercury placement not available",
        partnerPlanets.filter((p) => [3].includes(p.house)).map((p) => `${p.planet} in 3rd`),
      ].filter(Boolean) as string[],
    };

    const emotionalThemes = {
      user: [
        userMoon ? `Moon in ${userMoon.sign}` : "Moon placement not available",
        userVenus ? `Venus in ${userVenus.sign}` : "Venus placement not available",
        userPlanets
          .filter((p) => [4, 7].includes(p.house))
          .map((p) => `${p.planet} in ${p.house}th`),
      ].filter(Boolean) as string[],
      partner: [
        partnerMoon ? `Moon in ${partnerMoon.sign}` : "Moon placement not available",
        partnerVenus ? `Venus in ${partnerVenus.sign}` : "Venus placement not available",
        partnerPlanets
          .filter((p) => [4, 7].includes(p.house))
          .map((p) => `${p.planet} in ${p.house}th`),
      ].filter(Boolean) as string[],
    };

    return {
      userAscendant: userChart.lagnaSign || "—",
      partnerAscendant: partnerChart.lagnaSign || "—",
      userMoon: userChart.moonSign || "—",
      partnerMoon: partnerChart.moonSign || "—",
      userSun: userChart.sunSign || "—",
      partnerSun: partnerChart.sunSign || "—",
      userNakshatra: userPlanets.find((p) => p.planet === "Moon")?.nakshatra || "—",
      partnerNakshatra: partnerPlanets.find((p) => p.planet === "Moon")?.nakshatra || "—",
      planets,
      dashaUser: {
        currentMaha: userDasha?.currentMaha || null,
        currentAntar: userDasha?.currentAntar || null,
      },
      dashaPartner: {
        currentMaha: partnerDasha?.currentMaha || null,
        currentAntar: partnerDasha?.currentAntar || null,
      },
      spiritualThemes,
      careerThemes,
      communicationThemes,
      emotionalThemes,
    };
  }
}

export const chartComparisonService = new ChartComparisonService();
