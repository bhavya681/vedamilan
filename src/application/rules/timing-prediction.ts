/**
 * Multi-factor Vedic timing predictions.
 * Combines Vimshottari Mahadasha / Antardasha with live Gochar (transits)
 * and overall pair compatibility — never a single-rule verdict.
 *
 * Classical notes applied (deterministic, not AI):
 * - Venus / Jupiter / Moon periods favor marriage & introductions
 * - 7th-lord dasha activates partnership karma
 * - Jupiter / Venus gochar over 1, 5, 7, 9 from natal Lagna supports marriage
 * - Saturn gochar on 1/7 asks maturity / may delay formalization
 * - Rahu–Ketu on 1–7 axis = unconventional / karmic timing (caution)
 * - Pair marriage timing requires both charts' dasha confluence + bond score
 */

export type TimingVerdict = "FAVORABLE" | "SUPPORTIVE" | "NEUTRAL" | "CAUTIOUS" | "UNFAVORABLE";

export type TimingWindow = {
  label: string;
  /** Human range e.g. "Mar 2027 – Nov 2028" */
  window: string;
  reason: string;
  score: number;
  kind: "PARTNER_ARRIVAL" | "MARRIAGE" | "INTRODUCTION";
  /** e.g. Venus–Jupiter */
  dashaLabel?: string;
  startDate?: string;
  endDate?: string;
  /** Approx duration hint */
  approxNote?: string;
};

export type TimingFactor = {
  id: string;
  name: string;
  score: number;
  weight: number;
  note: string;
};

export type DashaSnapshot = {
  currentMaha: string | null;
  currentAntar: string | null;
  seventhLord?: string | null;
};

export type GocharLitePlanet = {
  planet: string;
  sign: string;
  houseFromNatalLagna: number;
  isRetrograde?: boolean;
};

export type TimingPrediction = {
  asOf: string;
  marryNowVerdict: TimingVerdict;
  marryNowScore: number;
  marryNowTitle: string;
  marryNowReason: string;
  partnerArrivalWindows: TimingWindow[];
  bestMarriageWindows: TimingWindow[];
  gocharHighlights: string[];
  dashaSnapshot: {
    you: DashaSnapshot;
    them?: DashaSnapshot | null;
  };
  factors: TimingFactor[];
  overallTimingScore: number;
  methodology: string;
};

type DashaPeriod = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

const BENEFIC_MARRIAGE = new Set(["Venus", "Jupiter", "Moon", "Mercury"]);
const MARRIAGE_LORDS = new Set(["Venus", "Jupiter", "Moon"]);

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fmtRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", opts)}`;
}

function approxDurationNote(start: Date, end: Date) {
  const months = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000)),
  );
  if (months < 14) return `Approx. ${months} month window`;
  const years = Math.round((months / 12) * 10) / 10;
  return `Approx. ${years} year window`;
}

/**
 * Ensure Antardasha rows exist for each Mahadasha (older dasha docs often only
 * stored ANTAR under the first MAHA). Pure Vimshottari proportions — no AI.
 */
export function ensureAntardashaCoverage(periods: DashaPeriod[]): DashaPeriod[] {
  const maha = periods.filter((p) => p.level === "MAHA");
  const antar = periods.filter((p) => p.level === "ANTAR");
  const covered = new Set(antar.map((a) => a.parentLord).filter(Boolean) as string[]);
  const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;
  const LORDS = [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
  ] as const;
  const YEARS: Record<(typeof LORDS)[number], number> = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17,
  };

  const expanded: DashaPeriod[] = [...periods];
  for (const m of maha) {
    if (covered.has(m.lord)) continue;
    const start = new Date(m.startDate);
    const end = new Date(m.endDate);
    const mahaYears = (end.getTime() - start.getTime()) / MS_PER_YEAR;
    let cursor = new Date(start);
    const startIdx = LORDS.indexOf(m.lord as (typeof LORDS)[number]);
    if (startIdx < 0) continue;
    for (let i = 0; i < 9; i += 1) {
      const aLord = LORDS[(startIdx + i) % 9]!;
      const portion = (YEARS[aLord] / 120) * mahaYears;
      const aEnd = new Date(cursor.getTime() + portion * MS_PER_YEAR);
      expanded.push({
        lord: aLord,
        startDate: new Date(cursor),
        endDate: aEnd,
        level: "ANTAR",
        parentLord: m.lord,
      });
      cursor = aEnd;
    }
  }
  return expanded;
}

function scoreAntarWindow(
  mahaLord: string,
  antarLord: string,
  opts: { manglikStatus?: string; seventhLord?: string | null },
) {
  const mahaBase = lordBaseScore(mahaLord, opts.seventhLord);
  const antarBase = lordBaseScore(antarLord, opts.seventhLord);
  let score = Math.round(mahaBase * 0.45 + antarBase * 0.55);

  if (mahaLord === opts.seventhLord || antarLord === opts.seventhLord) score += 5;
  if (BENEFIC_MARRIAGE.has(mahaLord) && BENEFIC_MARRIAGE.has(antarLord)) score += 4;
  if (opts.manglikStatus === "MANGLIK" && (mahaLord === "Mars" || antarLord === "Mars")) {
    score -= 8;
  }
  if (mahaLord === "Saturn" && antarLord === "Saturn") score -= 6;
  if (mahaLord === "Rahu" || antarLord === "Rahu" || mahaLord === "Ketu" || antarLord === "Ketu") {
    score -= 3;
  }
  return clamp(score);
}

function lordBaseScore(lord: string, seventhLord?: string | null) {
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

function activePeriod(periods: DashaPeriod[], level: string, now = new Date()) {
  return (
    periods.find(
      (p) => p.level === level && new Date(p.startDate) <= now && new Date(p.endDate) >= now,
    ) || null
  );
}

/** Score current dasha for marriage / partner themes */
export function scoreDashaMarriageReadiness(
  periods: DashaPeriod[],
  opts: { manglikStatus?: string; seventhLord?: string | null; now?: Date } = {},
): { score: number; note: string; maha: string | null; antar: string | null } {
  const now = opts.now || new Date();
  const full = ensureAntardashaCoverage(periods);
  const maha = activePeriod(full, "MAHA", now);
  const antar = activePeriod(full, "ANTAR", now);
  const mahaLord = maha?.lord || null;
  const antarLord = antar?.lord || null;

  if (!mahaLord) {
    return {
      score: 50,
      note: "Mahadasha data incomplete — generate kundli dasha for a precise read.",
      maha: null,
      antar: null,
    };
  }

  let score = lordBaseScore(mahaLord, opts.seventhLord) - 8; // current corridor slightly tempered vs future peak
  const notes: string[] = [`${mahaLord} Mahadasha is running`];

  if (antarLord) {
    const antarBoost = BENEFIC_MARRIAGE.has(antarLord) ? 6 : antarLord === "Saturn" ? -4 : 0;
    score += antarBoost;
    notes.push(`${antarLord} Antardasha ${antarBoost >= 0 ? "supports" : "slows"} formalization`);
  }

  if (opts.seventhLord && (mahaLord === opts.seventhLord || antarLord === opts.seventhLord)) {
    score += 5;
    notes.push(`7th lord (${opts.seventhLord}) period activates partnership karma`);
  }

  if (opts.manglikStatus === "MANGLIK" && (mahaLord === "Mars" || antarLord === "Mars")) {
    score -= 8;
    notes.push("Mars period with Manglik chart asks careful muhurta & remedies");
  }

  return {
    score: clamp(score),
    note: notes.join(". ") + ".",
    maha: mahaLord,
    antar: antarLord,
  };
}

/** Classical gochar support for marriage / introductions */
export function scoreGocharMarriageSupport(
  planets: GocharLitePlanet[],
  opts: { manglikStatus?: string } = {},
): { score: number; note: string; highlights: string[] } {
  const byName = (n: string) => planets.find((p) => p.planet === n);
  const jupiter = byName("Jupiter");
  const venus = byName("Venus");
  const saturn = byName("Saturn");
  const rahu = byName("Rahu");
  const ketu = byName("Ketu");
  const moon = byName("Moon");

  let score = 52;
  const highlights: string[] = [];
  const notes: string[] = [];

  const supportiveHouses = new Set([1, 5, 7, 9, 11]);
  const delayHouses = new Set([6, 8, 12]);

  if (jupiter) {
    if (supportiveHouses.has(jupiter.houseFromNatalLagna)) {
      score += 14;
      notes.push(`Jupiter transit house ${jupiter.houseFromNatalLagna} blesses growth & alliance`);
      highlights.push(
        `Jupiter in ${jupiter.sign} (H${jupiter.houseFromNatalLagna}) — supportive for commitment`,
      );
    } else if (delayHouses.has(jupiter.houseFromNatalLagna)) {
      score -= 4;
      highlights.push(
        `Jupiter in ${jupiter.sign} (H${jupiter.houseFromNatalLagna}) — growth via inner work first`,
      );
    } else {
      highlights.push(`Jupiter in ${jupiter.sign} (H${jupiter.houseFromNatalLagna})`);
    }
  }

  if (venus) {
    if (supportiveHouses.has(venus.houseFromNatalLagna) || venus.houseFromNatalLagna === 2) {
      score += 12;
      notes.push(`Venus transit house ${venus.houseFromNatalLagna} warms affection & proposals`);
      highlights.push(
        `Venus in ${venus.sign} (H${venus.houseFromNatalLagna}) — romance / marriage themes live`,
      );
    } else if (delayHouses.has(venus.houseFromNatalLagna)) {
      score -= 3;
      highlights.push(`Venus in ${venus.sign} (H${venus.houseFromNatalLagna})`);
    }
  }

  if (saturn) {
    if (saturn.houseFromNatalLagna === 7 || saturn.houseFromNatalLagna === 1) {
      score -= 8;
      notes.push(
        `Saturn on the 1–7 axis asks maturity — marriage possible but needs realistic pacing`,
      );
      highlights.push(
        `Saturn in ${saturn.sign} (H${saturn.houseFromNatalLagna})${saturn.isRetrograde ? " Rx" : ""} — serious / slower formalization`,
      );
    } else if (saturn.houseFromNatalLagna === 10 || saturn.houseFromNatalLagna === 4) {
      score -= 2;
      highlights.push(`Saturn in ${saturn.sign} (H${saturn.houseFromNatalLagna})`);
    } else if (supportiveHouses.has(saturn.houseFromNatalLagna)) {
      score += 3;
      highlights.push(`Saturn in ${saturn.sign} (H${saturn.houseFromNatalLagna}) — durable bonds`);
    }
  }

  if (rahu && ketu) {
    const axis = new Set([rahu.houseFromNatalLagna, ketu.houseFromNatalLagna]);
    if (axis.has(1) && axis.has(7)) {
      score -= 6;
      notes.push("Rahu–Ketu on 1–7 axis: karmic / unconventional partnership timing");
      highlights.push("Rahu–Ketu on Lagna–7th axis — conscious partnership choices matter");
    }
  }

  if (moon && (moon.houseFromNatalLagna === 7 || moon.houseFromNatalLagna === 5)) {
    score += 4;
    highlights.push(`Transit Moon in house ${moon.houseFromNatalLagna} — emotional openness today`);
  }

  if (opts.manglikStatus === "MANGLIK" && byName("Mars")?.houseFromNatalLagna === 7) {
    score -= 5;
    notes.push("Transit Mars on 7th with Manglik chart — prefer calm muhurta");
  }

  return {
    score: clamp(score),
    note: notes.join(". ") || "Gochar is mixed — neither strongly activating nor blocking.",
    highlights: highlights.slice(0, 5),
  };
}

function verdictFromScore(score: number): TimingVerdict {
  if (score >= 80) return "FAVORABLE";
  if (score >= 68) return "SUPPORTIVE";
  if (score >= 52) return "NEUTRAL";
  if (score >= 40) return "CAUTIOUS";
  return "UNFAVORABLE";
}

function verdictTitle(v: TimingVerdict, pair: boolean): string {
  switch (v) {
    case "FAVORABLE":
      return pair ? "Strong time to formalize" : "Strong season for alliance";
    case "SUPPORTIVE":
      return pair ? "Good window to progress" : "Supportive for meeting a partner";
    case "NEUTRAL":
      return pair ? "Steady — neither rush nor delay" : "Ordinary timing — keep showing up";
    case "CAUTIOUS":
      return pair ? "Proceed mindfully" : "Patience period for introductions";
    case "UNFAVORABLE":
      return pair ? "Better to wait for a clearer window" : "Focus on readiness before seeking";
  }
}

/** Approximate marriage / partner windows from Vimshottari Antardasha (preferred) */
export function computeTimedWindows(
  periods: DashaPeriod[],
  opts: {
    manglikStatus?: string;
    seventhLord?: string | null;
    kind?: TimingWindow["kind"];
    now?: Date;
    limit?: number;
  } = {},
): TimingWindow[] {
  const now = opts.now || new Date();
  const kind = opts.kind || "MARRIAGE";
  const limit = opts.limit ?? 5;
  const full = ensureAntardashaCoverage(periods);
  const antar = full.filter((p) => p.level === "ANTAR");
  const maha = full.filter((p) => p.level === "MAHA");
  const windows: TimingWindow[] = [];

  for (const period of antar) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (end < now) continue;

    const mahaLord = period.parentLord || "—";
    const score = scoreAntarWindow(mahaLord, period.lord, opts);
    const effectiveStart = start < now ? now : start;
    const seventhHit = opts.seventhLord === mahaLord || opts.seventhLord === period.lord;
    const marriageFavorable =
      MARRIAGE_LORDS.has(mahaLord) ||
      MARRIAGE_LORDS.has(period.lord) ||
      BENEFIC_MARRIAGE.has(period.lord) ||
      seventhHit;

    if (kind === "MARRIAGE" && score < 62 && !marriageFavorable) continue;
    if (kind === "PARTNER_ARRIVAL" && score < 58 && !marriageFavorable) continue;

    const dashaLabel = `${mahaLord}–${period.lord}`;
    windows.push({
      label: seventhHit
        ? "7th-lord activation"
        : score >= 88
          ? "Prime marriage window"
          : score >= 78
            ? "Favorable marriage window"
            : score >= 68
              ? "Supportive window"
              : "Secondary window",
      window: fmtRange(effectiveStart, end),
      dashaLabel,
      startDate: effectiveStart.toISOString(),
      endDate: end.toISOString(),
      approxNote: approxDurationNote(effectiveStart, end),
      reason:
        kind === "PARTNER_ARRIVAL"
          ? `Approx. ${fmtRange(effectiveStart, end)} during ${dashaLabel} Antardasha — classical period for introductions and serious matching.`
          : `Approx. marriage timing ${fmtRange(effectiveStart, end)} in ${dashaLabel} (Mahadasha–Antardasha). Venus/Jupiter/Moon or 7th-lord periods are classically preferred for vivaha; confirm exact day with panchang muhurta.`,
      score,
      kind: kind === "PARTNER_ARRIVAL" && !marriageFavorable ? "INTRODUCTION" : kind,
    });
  }

  if (windows.length === 0) {
    for (const period of maha) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      if (end < now) continue;
      const effectiveStart = start < now ? now : start;
      const score = clamp(
        lordBaseScore(period.lord, opts.seventhLord) +
          (opts.manglikStatus === "MANGLIK" && period.lord === "Mars" ? -8 : 0),
      );
      windows.push({
        label: "Mahadasha corridor",
        window: fmtRange(effectiveStart, end),
        dashaLabel: `${period.lord} Mahadasha`,
        startDate: effectiveStart.toISOString(),
        endDate: end.toISOString(),
        approxNote: approxDurationNote(effectiveStart, end),
        reason: `${period.lord} Mahadasha forms a broader relationship corridor (~${fmtRange(effectiveStart, end)}). Regenerate kundli for finer Antardasha windows.`,
        score,
        kind,
      });
    }
  }

  return windows
    .sort((a, b) => b.score - a.score || (a.startDate || "").localeCompare(b.startDate || ""))
    .slice(0, limit);
}

/**
 * Self timing: when a good partner may arrive + best marriage seasons + is-now-good.
 * Weights: Dasha 45% · Gochar 35% · Chart readiness (manglik/7th) baked into those.
 */
export function predictSelfTiming(input: {
  periods: DashaPeriod[];
  gocharPlanets?: GocharLitePlanet[];
  gocharHighlights?: string[];
  manglikStatus?: string;
  seventhLord?: string | null;
  currentMaha?: string | null;
  currentAntar?: string | null;
}): TimingPrediction {
  const asOf = new Date().toISOString();
  const dasha = scoreDashaMarriageReadiness(input.periods, {
    manglikStatus: input.manglikStatus,
    seventhLord: input.seventhLord,
  });
  const gochar = scoreGocharMarriageSupport(input.gocharPlanets || [], {
    manglikStatus: input.manglikStatus,
  });

  const factors: TimingFactor[] = [
    {
      id: "mahadasha",
      name: "Mahadasha / Antardasha",
      score: dasha.score,
      weight: 45,
      note: dasha.note,
    },
    {
      id: "gochar",
      name: "Live Gochar (transits)",
      score: gochar.score,
      weight: 35,
      note: gochar.note,
    },
    {
      id: "seventh",
      name: "7th-lord activation",
      score: input.seventhLord
        ? dasha.maha === input.seventhLord || dasha.antar === input.seventhLord
          ? 88
          : 58
        : 55,
      weight: 20,
      note: input.seventhLord
        ? `Your 7th lord is ${input.seventhLord}.`
        : "7th lord not resolved from chart.",
    },
  ];

  const overallTimingScore = clamp(factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0));
  const marryNowVerdict = verdictFromScore(overallTimingScore);
  const partnerArrivalWindows = computeTimedWindows(input.periods, {
    manglikStatus: input.manglikStatus,
    seventhLord: input.seventhLord,
    kind: "PARTNER_ARRIVAL",
    limit: 4,
  });
  const bestMarriageWindows = computeTimedWindows(input.periods, {
    manglikStatus: input.manglikStatus,
    seventhLord: input.seventhLord,
    kind: "MARRIAGE",
    limit: 5,
  });

  return {
    asOf,
    marryNowVerdict,
    marryNowScore: overallTimingScore,
    marryNowTitle: verdictTitle(marryNowVerdict, false),
    marryNowReason: `Weighted read of running dasha (${dasha.score}) and current gochar (${gochar.score}) yields ${overallTimingScore}/100. ${dasha.note} ${gochar.note}`,
    partnerArrivalWindows,
    bestMarriageWindows,
    gocharHighlights: [...(input.gocharHighlights || []), ...gochar.highlights]
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 6),
    dashaSnapshot: {
      you: {
        currentMaha: dasha.maha || input.currentMaha || null,
        currentAntar: dasha.antar || input.currentAntar || null,
        seventhLord: input.seventhLord || null,
      },
    },
    factors,
    overallTimingScore,
    methodology:
      "Approximate marriage windows use Vimshottari Mahadasha–Antardasha date ranges (month/year precision). Live Gochar and 7th-lord emphasis refine the marry-now read. Exact wedding day still needs classical panchang muhurta.",
  };
}

/**
 * Pair timing: is-now-good-to-marry-this-partner + overlapping marriage windows.
 * Weights: Your dasha 25% · Their dasha 20% · Gochar (yours) 20% · Overall bond 35%.
 * Bond score is required — timing never overrides a weak multi-factor compatibility.
 */
export function predictPairTiming(input: {
  periodsYou: DashaPeriod[];
  periodsThem?: DashaPeriod[];
  gocharPlanetsYou?: GocharLitePlanet[];
  gocharHighlightsYou?: string[];
  manglikYou?: string;
  manglikThem?: string;
  seventhLordYou?: string | null;
  seventhLordThem?: string | null;
  /** Deep / blended overall compatibility 0–100 — required for honest marry-now */
  overallCompatibilityScore: number;
  decisionSummary?: string | null;
  currentMahaYou?: string | null;
  currentAntarYou?: string | null;
  currentMahaThem?: string | null;
  currentAntarThem?: string | null;
}): TimingPrediction {
  const asOf = new Date().toISOString();
  const dashaYou = scoreDashaMarriageReadiness(input.periodsYou, {
    manglikStatus: input.manglikYou,
    seventhLord: input.seventhLordYou,
  });
  const dashaThem = input.periodsThem?.length
    ? scoreDashaMarriageReadiness(input.periodsThem, {
        manglikStatus: input.manglikThem,
        seventhLord: input.seventhLordThem,
      })
    : { score: 55, note: "Partner dasha unavailable.", maha: null, antar: null };

  const gochar = scoreGocharMarriageSupport(input.gocharPlanetsYou || [], {
    manglikStatus: input.manglikYou,
  });

  const bond = clamp(input.overallCompatibilityScore);

  const factors: TimingFactor[] = [
    {
      id: "bond",
      name: "Overall compatibility (multi-module)",
      score: bond,
      weight: 35,
      note: input.decisionSummary
        ? `Bond decision: ${input.decisionSummary} (${bond}%).`
        : `Multi-module bond score ${bond}%. Timing never replaces this.`,
    },
    {
      id: "dasha_you",
      name: "Your Mahadasha / Antardasha",
      score: dashaYou.score,
      weight: 25,
      note: dashaYou.note,
    },
    {
      id: "dasha_them",
      name: "Partner Mahadasha / Antardasha",
      score: dashaThem.score,
      weight: 20,
      note: dashaThem.note,
    },
    {
      id: "gochar",
      name: "Your live Gochar",
      score: gochar.score,
      weight: 20,
      note: gochar.note,
    },
  ];

  let overallTimingScore = clamp(factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0));

  // Soft gate: weak bond caps how "favorable" timing can claim to be
  if (bond < 45) overallTimingScore = Math.min(overallTimingScore, 48);
  else if (bond < 55) overallTimingScore = Math.min(overallTimingScore, 62);

  const marryNowVerdict = verdictFromScore(overallTimingScore);

  const windowsYou = computeTimedWindows(input.periodsYou, {
    manglikStatus: input.manglikYou,
    seventhLord: input.seventhLordYou,
    kind: "MARRIAGE",
    limit: 6,
  });
  const windowsThem = input.periodsThem?.length
    ? computeTimedWindows(input.periodsThem, {
        manglikStatus: input.manglikThem,
        seventhLord: input.seventhLordThem,
        kind: "MARRIAGE",
        limit: 6,
      })
    : [];

  // Prefer your Antardasha windows; boost when partner also has a strong overlapping season
  const bestMarriageWindows: TimingWindow[] = windowsYou
    .map((w) => {
      const partnerPeak =
        windowsThem.find((t) => {
          if (!w.startDate || !w.endDate || !t.startDate || !t.endDate) return false;
          const a0 = new Date(w.startDate).getTime();
          const a1 = new Date(w.endDate).getTime();
          const b0 = new Date(t.startDate).getTime();
          const b1 = new Date(t.endDate).getTime();
          return a0 <= b1 && b0 <= a1;
        })?.score ??
        windowsThem[0]?.score ??
        60;
      const overlapBoost = partnerPeak >= 75 ? 4 : 0;
      const confluence = clamp(w.score * 0.7 + partnerPeak * 0.2 + bond * 0.1 + overlapBoost);
      return {
        ...w,
        score: confluence,
        label: partnerPeak >= 78 && w.score >= 75 ? "Shared marriage window" : w.label,
        reason: `${w.reason} Pair bond ${bond}% and partner dasha readiness ${dashaThem.score} folded into this approximate window.`,
      };
    })
    .sort((a, b) => b.score - a.score || (a.startDate || "").localeCompare(b.startDate || ""))
    .slice(0, 5);

  const partnerArrivalWindows = computeTimedWindows(input.periodsYou, {
    manglikStatus: input.manglikYou,
    seventhLord: input.seventhLordYou,
    kind: "PARTNER_ARRIVAL",
    limit: 4,
  });

  return {
    asOf,
    marryNowVerdict,
    marryNowScore: overallTimingScore,
    marryNowTitle: verdictTitle(marryNowVerdict, true),
    marryNowReason: `This marry-now read blends overall compatibility (${bond}%), your dasha (${dashaYou.score}), partner dasha (${dashaThem.score}), and your gochar (${gochar.score}) → ${overallTimingScore}/100. ${marryNowVerdict === "FAVORABLE" || marryNowVerdict === "SUPPORTIVE" ? "Charts support progressing commitment with a proper muhurta." : "Charts suggest patience or deeper agreement before formalizing."}`,
    partnerArrivalWindows,
    bestMarriageWindows,
    gocharHighlights: [...(input.gocharHighlightsYou || []), ...gochar.highlights]
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 6),
    dashaSnapshot: {
      you: {
        currentMaha: dashaYou.maha || input.currentMahaYou || null,
        currentAntar: dashaYou.antar || input.currentAntarYou || null,
        seventhLord: input.seventhLordYou || null,
      },
      them: {
        currentMaha: dashaThem.maha || input.currentMahaThem || null,
        currentAntar: dashaThem.antar || input.currentAntarThem || null,
        seventhLord: input.seventhLordThem || null,
      },
    },
    factors,
    overallTimingScore,
    methodology:
      "Approximate marriage windows are Vimshottari Mahadasha–Antardasha date ranges (month/year). Pair timing also weighs multi-module bond + both dashas + your Gochar. Exact wedding day still needs panchang muhurta.",
  };
}

/** Back-compat wrapper used by older callers */
export function computeMarriageWindows(
  periods: DashaPeriod[],
  manglikStatus: string,
): Array<{ label: string; window: string; reason: string; score: number }> {
  return computeTimedWindows(periods, { manglikStatus, kind: "MARRIAGE", limit: 5 }).map(
    ({ label, window, reason, score }) => ({ label, window, reason, score }),
  );
}
