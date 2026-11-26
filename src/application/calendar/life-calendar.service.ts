import {
  BirthDetails,
  CoupleMilestone,
  Dasha,
  Horoscope,
  Profile,
} from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { computeGocharAtDate, computeGocharForUser } from "@/application/horoscope/gochar.service";
import { resolveCurrentDasha } from "@/application/horoscope/dasha-engine";
import {
  computeLifeEventsCalendar,
  type GocharLite,
  type LifeEventCategory,
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

function evenlySpaced<T>(items: T[], limit: number): T[] {
  if (items.length <= limit) return items;
  const indexes = new Set<number>();
  for (let i = 0; i < limit; i += 1) {
    indexes.add(Math.round((i * (items.length - 1)) / (limit - 1)));
  }
  return [...indexes].sort((a, b) => a - b).map((i) => items[i]!);
}

async function buildDatedGocharMap(
  userId: string,
  periods: PeriodRow[],
  now: Date,
  birthDate?: Date | string | null,
  horizonYears = 60,
): Promise<Record<string, GocharLite[]>> {
  const full = ensureAntardashaCoverage(periods);
  const antars = full.filter((p) => p.level === "ANTAR");
  const birth = birthDate ? new Date(birthDate) : null;
  const validBirth = birth && !Number.isNaN(birth.getTime()) ? birth : null;
  const horizon = new Date(now);
  horizon.setFullYear(horizon.getFullYear() + horizonYears);

  const candidates = antars
    .map((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const mid = new Date((start.getTime() + end.getTime()) / 2);
      return { start, end, mid, key: start.toISOString() };
    })
    .filter((p) => {
      if (Number.isNaN(p.mid.getTime())) return false;
      if (p.mid < now) return !validBirth || p.mid >= validBirth;
      return p.mid <= horizon;
    })
    .sort((a, b) => a.mid.getTime() - b.mid.getTime());

  const map: Record<string, GocharLite[]> = {};
  await Promise.all(
    evenlySpaced(candidates, 48).map(async (c) => {
      try {
        const snap = await computeGocharAtDate(userId, c.mid);
        map[c.key] = snap.planets.map((p) => ({
          planet: p.planet,
          houseFromNatalLagna: p.houseFromNatalLagna,
          isRetrograde: p.isRetrograde,
          note: p.note,
        }));
      } catch {
        // skip failed ephemeris sample
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
    const resolvedDasha = resolveCurrentDasha(periods, now);
    const currentMaha = resolvedDasha.currentMaha;
    const currentAntar = resolvedDasha.currentAntar;

    let gochar: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
    try {
      gochar = await computeGocharForUser(userId, now);
    } catch {
      gochar = null;
    }

    let datedGocharByAntarStart: Record<string, GocharLite[]> = {};
    try {
      datedGocharByAntarStart = await buildDatedGocharMap(userId, periods, now, birthDate);
    } catch {
      datedGocharByAntarStart = {};
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
      currentMaha,
      currentAntar,
      birthDate: birthDate,
      now,
    });

    const marriageWindowsAll = dedupeWindows([
      ...marriageTiming.bestMarriageWindows,
      ...marriageTiming.pastMarriageWindows,
    ]).slice(0, 12);

    const life = computeLifeEventsCalendar({
      periods,
      lagnaSign: chart.lagnaSign,
      birthDate,
      city: birth?.placeName || profile?.city || null,
      country: profile?.country || null,
      currentMaha,
      currentAntar,
      gocharPlanets: gochar?.planets || null,
      gocharHighlights: gochar?.highlights || null,
      datedGocharByAntarStart,
      maritalStatus: profile?.maritalStatus || null,
      limits: { past: 80, present: 8, future: 40 },
      horizonYears: 60,
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

    const marryNow = marriageTiming.marryNowVerdict
      ? {
          score: marriageTiming.marryNowScore,
          title: marriageTiming.marryNowTitle,
          reason: marriageTiming.marryNowReason,
          verdict: marriageTiming.marryNowVerdict,
        }
      : null;

    let userMilestones: LifeEventItem[] = [];
    try {
      const milestones = await CoupleMilestone.find({
        notedByUserId: userId,
        status: "ACTIVE",
        deletedAt: null,
        occurredOn: { $exists: true, $ne: null },
      }).lean();
      userMilestones = milestones
        .filter((m) => m.occurredOn && !Number.isNaN(new Date(m.occurredOn!).getTime()))
        .map((m) => {
          const occurred = new Date(m.occurredOn!);
          return {
            id: `milestone-${String(m._id)}`,
            category: "marriage" as LifeEventCategory,
            title: m.label || "Relationship milestone",
            window: fmtRange(occurred, occurred),
            startDate: occurred.toISOString(),
            endDate: occurred.toISOString(),
            score: 92,
            phase: occurred < now ? ("past" as const) : ("present" as const),
            dashaLabel: "Your journey record",
            reason: `You recorded this milestone on ${occurred.toLocaleDateString("en-IN", { dateStyle: "long" })}.`,
            suggestion: "Confirmed by your journey record.",
            acceptLine: "Confirmed milestone.",
            probability: "high" as const,
            probabilityLabel: "Confirmed by you",
            explain: `Confirmed milestone: ${m.label || "Relationship milestone"}.`,
            significance: "major" as const,
            spanMonths: 0,
            source: "user-asserted" as const,
            skyAt: occurred.toISOString(),
          };
        });
    } catch {
      userMilestones = [];
    }

    for (const milestone of userMilestones) {
      if (!byPhase[milestone.phase].some((e) => e.id === milestone.id)) {
        byPhase[milestone.phase].push(milestone);
      }
    }
    for (const phase of Object.keys(byPhase) as Array<keyof typeof byPhase>) {
      byPhase[phase] = dedupeByDate(byPhase[phase]);
    }
    const events = [...byPhase.past, ...byPhase.present, ...byPhase.future].sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
    const marriageChapters = byPhase.past.filter((e) => e.category === "marriage");
    const dedupedPastMarriage = dedupeByDate(marriageChapters);

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
        currentMaha,
        currentAntar,
        asOf: now.toISOString(),
        gocharAsOf: gochar?.asOf || null,
        gocharStatus: gochar ? "live" : "unavailable",
        seventhLord: seventh,
        gocharHighlights: gochar?.highlights?.slice(0, 5) || [],
        gocharPlanets: (gochar?.planets || []).slice(0, 9).map((p) => ({
          planet: p.planet,
          house: p.houseFromNatalLagna,
          sign: p.sign,
          retrograde: p.isRetrograde,
        })),
        historicalSamples: Object.keys(datedGocharByAntarStart).length,
        datedSamples: Object.keys(datedGocharByAntarStart).length,
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
          w.endDate && new Date(w.endDate) < now
            ? ("past" as const)
            : w.startDate && new Date(w.startDate) <= now
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
      marriageChapters: dedupedPastMarriage,
      marryNow,
      methodology:
        "Major chapters from birth onward: one primary theme per Vimshottari Antardasha, in date order. Current chapters use live sky at load time; past and future chapters use Swiss Ephemeris sky dated to each chapter midpoint. Your recorded milestones are marked as confirmed. Directional guidance — not a fixed prediction.",
    };
  }
}

function dedupeByDate(items: LifeEventItem[]): LifeEventItem[] {
  const map = new Map<string, LifeEventItem>();
  for (const item of items) {
    const key = item.startDate.slice(0, 10);
    const existing = map.get(key);
    if (!existing || item.score > existing.score) {
      map.set(key, item);
    }
  }
  return [...map.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function fmtRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} - ${end.toLocaleDateString("en-IN", opts)}`;
}

function dedupeWindows(windows: TimingWindow[]): TimingWindow[] {
  const map = new Map<string, TimingWindow>();
  for (const w of windows) {
    const key = `${w.startDate || ""}|${w.endDate || ""}|${w.label}`;
    const existing = map.get(key);
    if (!existing || w.score > existing.score) map.set(key, w);
  }
  return [...map.values()].sort((a, b) =>
    (a.startDate || "").localeCompare(b.startDate || "") || b.score - a.score,
  );
}

export const lifeCalendarService = new LifeCalendarService();
