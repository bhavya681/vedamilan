import { BirthDetails, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { computeGocharAtDate, computeGocharForUser } from "@/application/horoscope/gochar.service";
import {
  computeLifeEventsCalendar,
  type GocharLite,
  type LifeEventItem,
} from "@/application/rules/life-events-calendar";
import {
  predictSelfTiming,
  ensureAntardashaCoverage,
  type TimingWindow,
} from "@/application/rules/timing-prediction";
import { seventhLord } from "@/application/rules/shukra-milan";
import {
  marriageDetailFromTendencies,
  predictSpouseTendencies,
} from "@/application/rules/spouse-prediction";
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
    const planets = Array.isArray(chart.planets)
      ? (chart.planets as Array<{ planet?: string; sign?: string; house?: number }>).map((p) => ({
          planet: String(p.planet || ""),
          sign: String(p.sign || "Aries"),
          house: Number(p.house || 1),
        }))
      : [];
    const spouseTendencies = predictSpouseTendencies({
      lagnaSign: chart.lagnaSign,
      planets,
    });
    const marriageDetail = marriageDetailFromTendencies(spouseTendencies);

    const marriageTiming = predictSelfTiming({
      periods,
      gocharPlanets: gochar?.planets,
      gocharHighlights: gochar?.highlights,
      manglikStatus: chart.manglikStatus || "UNKNOWN",
      seventhLord: seventh,
      currentMaha: dasha.currentMaha || null,
      currentAntar: dasha.currentAntar || null,
      birthDate: birthDate,
    });

    const marriageWindows = marriageTiming.bestMarriageWindows;
    const marriageWindowsAll =
      marriageWindows.length > 0
        ? marriageWindows
        : generateMarriageFallback({
            periods,
            marriageTiming,
            birthDate,
            seventhLord: seventh,
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

    const enrichMarriage = (e: LifeEventItem): LifeEventItem => {
      if (e.category !== "marriage") return e;
      return {
        ...e,
        title:
          e.probability === "high" || e.score >= 80
            ? `Major · ${marriageDetail.title}`
            : `Key chapter · ${marriageDetail.title}`,
        detailLabel: marriageDetail.detailLabel,
        suggestion: marriageDetail.suggestion,
        explain: `${e.explain} Chart leaning: ${spouseTendencies.marriagePathLabel}; ${spouseTendencies.spouseOriginLabel}.`,
      };
    };

    const byPhase = {
      past: life.byPhase.past.map(enrichMarriage),
      present: life.byPhase.present.map(enrichMarriage),
      future: life.byPhase.future.map(enrichMarriage),
    };
    const events = [...byPhase.present, ...byPhase.future, ...byPhase.past];

    return {
      context: life.context,
      events,
      byPhase,
      highProbability: life.highProbability.map(enrichMarriage),
      pastHighlights: life.pastHighlights.map(enrichMarriage),
      presentHighlights: life.presentHighlights.map(enrichMarriage),
      futureHighlights: life.futureHighlights.map(enrichMarriage),
      categories: life.categories,
      gocharSummary: life.gocharSummary,
      spouseTendencies,
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
      marriageWindows: marriageWindowsAll.map((w) => ({
        label: w.label,
        window: w.window,
        score: w.score,
        reason: `${w.reason} · ${marriageDetail.detailLabel}; ${spouseTendencies.spouseOriginLabel}.`,
        dashaLabel: w.dashaLabel || null,
        startDate: w.startDate || null,
        endDate: w.endDate || null,
        kind: w.kind || "MARRIAGE",
        approxNote: w.approxNote || null,
        phase:
          w.endDate && new Date(w.endDate) < new Date()
            ? ("past" as const)
            : w.startDate && new Date(w.startDate) <= new Date()
              ? ("present" as const)
              : ("future" as const),
      })),
      timingFactors: marriageTiming.factors || [],
      gocharHighlights: marriageTiming.gocharHighlights || [],
      timingMethodology: marriageTiming.methodology || null,
      pastMarriageWindows: (marriageTiming.pastMarriageWindows || []).map((w) => ({
        label: w.label,
        window: w.window,
        score: w.score,
        reason: w.reason,
        dashaLabel: w.dashaLabel || null,
        startDate: w.startDate || null,
        endDate: w.endDate || null,
        kind: w.kind || "MARRIAGE",
        approxNote: w.approxNote || null,
        phase: "past" as const,
      })),
      methodology:
        "Major life chapters only: one primary theme per Vimshottari Antardasha, scored with gochar (live for now/upcoming; sky at period midpoint for past). Marriage cards include love/arranged and spouse-origin leanings from D1. Mild windows are filtered out. Directional guidance — not a fixed prediction.",
    };
  }
}

function fmtRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} - ${end.toLocaleDateString("en-IN", opts)}`;
}

function ageAt(date: Date, birth: Date) {
  let age = date.getFullYear() - birth.getFullYear();
  const m = date.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && date.getDate() < birth.getDate())) age--;
  return age;
}

function lordBaseScore(lord: string, seventhLord?: string | null): number {
  let base =
    lord === "Venus"
      ? 92
      : lord === "Jupiter"
        ? 90
        : lord === "Moon"
          ? 86
          : lord === "Mercury"
            ? 80
            : lord === "Sun"
              ? 72
              : lord === "Saturn"
                ? 68
                : lord === "Mars"
                  ? 64
                  : 58;
  if (seventhLord && lord === seventhLord) base = Math.min(99, base + 6);
  return base;
}

type FallbackInput = {
  periods: PeriodRow[];
  marriageTiming: Awaited<ReturnType<typeof predictSelfTiming>>;
  birthDate: Date | string | null;
  seventhLord: string | null;
};

function generateMarriageFallback(input: FallbackInput): TimingWindow[] {
  const seventhLord: string | null = input.seventhLord;
  const { periods, marriageTiming, birthDate } = input;
  const now = new Date();
  const full = ensureAntardashaCoverage(periods);
  const mahas = full.filter((p) => p.level === "MAHA");

  const currentMaha = mahas.find((p) => new Date(p.startDate) <= now && new Date(p.endDate) >= now);

  let target: PeriodRow | null = currentMaha || null;
  if (!target) {
    target =
      mahas.find((p) => new Date(p.startDate) > now) ||
      mahas
        .filter((p) => new Date(p.endDate) <= now)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] ||
      null;
  }

  if (!target) {
    return [];
  }

  const start = new Date(Math.max(new Date(target.startDate).getTime(), now.getTime()));
  const end = new Date(target.endDate);
  if (end < now) return [];

  const lord = target.lord;
  const dashaScore = lordBaseScore(lord, seventhLord) - 8;
  const gocharBoost = marriageTiming.factors.find((f) => f.id === "gochar")?.score || 0;
  const rawScore = dashaScore + Math.round(gocharBoost * 0.5);
  const score = Math.max(58, Math.min(74, Math.round(rawScore)));

  const birth = birthDate ? new Date(birthDate) : null;
  const ageNote =
    birth && !Number.isNaN(birth.getTime()) ? ` (~age ${ageAt(end, birth)} at peak)` : "";

  const phase = end < now ? "past" : start <= now ? "present" : "future";

  return [
    {
      label: "Watch window — dasha corridor",
      window: `${fmtRange(start, end)}`,
      score,
      kind: "MARRIAGE",
      dashaLabel: `${lord} Mahadasha`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      reason: `${lord} Mahadasha${phase === "present" ? " (current)" : phase === "future" ? " (upcoming)" : " (recent)"} forms a relationship corridor${ageNote}. Dasha read ${dashaScore}/100; gochar adds partial support. Exact timing needs classical muhurta within this period.`,
    },
  ];
}

export const lifeCalendarService = new LifeCalendarService();
