import { BirthDetails, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { computeGocharAtDate, computeGocharForUser } from "@/application/horoscope/gochar.service";
import {
  computeLifeEventsCalendar,
  type GocharLite,
} from "@/application/rules/life-events-calendar";
import { predictSelfTiming, ensureAntardashaCoverage } from "@/application/rules/timing-prediction";
import { seventhLord } from "@/application/rules/shukra-milan";
import { NotFoundError } from "@/lib/utils/error-handler";

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

async function buildHistoricalGocharMap(
  userId: string,
  periods: PeriodRow[],
  now: Date,
): Promise<Record<string, GocharLite[]>> {
  const full = ensureAntardashaCoverage(periods);
  const antars = full.filter((p) => p.level === "ANTAR");
  const pastCutoff = new Date(now);
  pastCutoff.setFullYear(pastCutoff.getFullYear() - 12);

  const candidates = antars
    .map((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const mid = new Date((start.getTime() + end.getTime()) / 2);
      return { start, end, mid, key: start.toISOString() };
    })
    .filter((p) => p.end < now && p.end >= pastCutoff)
    .sort((a, b) => b.end.getTime() - a.end.getTime())
    .slice(0, 14);

  const map: Record<string, GocharLite[]> = {};
  await Promise.all(
    candidates.map(async (c) => {
      try {
        const snap = await computeGocharAtDate(userId, c.mid);
        map[c.key] = snap.planets.map((p) => ({
          planet: p.planet,
          houseFromNatalLagna: p.houseFromNatalLagna,
          isRetrograde: p.isRetrograde,
          note: p.note,
        }));
      } catch {
        // skip failed historical ephemeris sample
      }
    }),
  );
  return map;
}

export class LifeCalendarService {
  async forUser(userId: string) {
    await connectMongo();
    const [chart, dasha, birth, profile] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      BirthDetails.findOne({ userId }).sort({ updatedAt: -1 }).lean(),
      Profile.findOne({ userId, status: "ACTIVE" }).lean(),
    ]);

    if (!chart || !dasha) {
      throw new NotFoundError("Generate kundli and dasha to open your life calendar");
    }

    const periods = periodsFrom(dasha);
    const birthDate = birth?.birthDate || profile?.dateOfBirth || null;
    const now = new Date();

    let gochar: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
    try {
      gochar = await computeGocharForUser(userId);
    } catch {
      gochar = null;
    }

    let historicalGocharByAntarStart: Record<string, GocharLite[]> = {};
    try {
      historicalGocharByAntarStart = await buildHistoricalGocharMap(userId, periods, now);
    } catch {
      historicalGocharByAntarStart = {};
    }

    const seventh = seventhLord(chart.lagnaSign || "Aries");
    const marriageTiming = predictSelfTiming({
      periods,
      gocharPlanets: gochar?.planets,
      gocharHighlights: gochar?.highlights,
      manglikStatus: chart.manglikStatus || "UNKNOWN",
      seventhLord: seventh,
      currentMaha: dasha.currentMaha || null,
      currentAntar: dasha.currentAntar || null,
    });

    const life = computeLifeEventsCalendar({
      periods,
      lagnaSign: chart.lagnaSign,
      birthDate,
      city: birth?.placeName || profile?.city || null,
      country: profile?.country || null,
      currentMaha: dasha.currentMaha,
      currentAntar: dasha.currentAntar,
      gocharPlanets: gochar?.planets || null,
      gocharHighlights: gochar?.highlights || null,
      historicalGocharByAntarStart,
      now,
    });

    return {
      context: life.context,
      events: life.events,
      byPhase: life.byPhase,
      highProbability: life.highProbability,
      pastHighlights: life.pastHighlights,
      presentHighlights: life.presentHighlights,
      futureHighlights: life.futureHighlights,
      categories: life.categories,
      gocharSummary: life.gocharSummary,
      snapshot: {
        lagnaSign: chart.lagnaSign,
        moonSign: chart.moonSign,
        sunSign: chart.sunSign,
        currentMaha: dasha.currentMaha,
        currentAntar: dasha.currentAntar,
        seventhLord: seventh,
        gocharHighlights: gochar?.highlights?.slice(0, 5) || [],
        gocharPlanets: (gochar?.planets || []).slice(0, 9).map((p) => ({
          planet: p.planet,
          house: p.houseFromNatalLagna,
          sign: p.sign,
          retrograde: p.isRetrograde,
        })),
        historicalSamples: Object.keys(historicalGocharByAntarStart).length,
      },
      marriageWindows: marriageTiming.bestMarriageWindows.slice(0, 5).map((w) => ({
        label: w.label,
        window: w.window,
        score: w.score,
        reason: w.reason,
        phase:
          w.endDate && new Date(w.endDate) < new Date()
            ? ("past" as const)
            : w.startDate && new Date(w.startDate) <= new Date()
              ? ("present" as const)
              : ("future" as const),
      })),
      methodology:
        "Past, now, and upcoming windows combine Vimshottari Antardasha with gochar (live for now/upcoming; sky at period midpoint for past). High probability means dasha and transit agree. Directional guidance only — not a fixed prediction.",
    };
  }
}

export const lifeCalendarService = new LifeCalendarService();
