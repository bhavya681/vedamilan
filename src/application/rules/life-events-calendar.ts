/**
 * Lifetime event calendar from Vimshottari dasha + Gochar + Desh–Kaal–Patra.
 * High-probability windows are those where dasha lords and live transits agree.
 * Deterministic; explain-only. Never invents planet positions.
 */

import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import { ensureAntardashaCoverage } from "@/application/rules/timing-prediction";

export type LifeEventCategory =
  | "marriage"
  | "career"
  | "job"
  | "education"
  | "wealth"
  | "property"
  | "travel"
  | "health"
  | "spiritual";

export type LifeEventPhase = "past" | "present" | "future";

export type EventProbability = "high" | "elevated" | "moderate";

export type LifeEventItem = {
  id: string;
  category: LifeEventCategory;
  title: string;
  window: string;
  startDate: string;
  endDate: string;
  score: number;
  phase: LifeEventPhase;
  dashaLabel: string;
  reason: string;
  ageHint?: string;
  suggestion: string;
  /** Likelihood band from dasha + gochar confluence */
  probability: EventProbability;
  probabilityLabel: string;
  /** How current gochar supports (or cautions) this window */
  gocharNote?: string;
  /** Plain-language timing explanation */
  explain: string;
};

export type DeshKaalPatraContext = {
  ageYears: number | null;
  birthDate: string | null;
  placeNote: string;
  timeNote: string;
  vesselNote: string;
};

export type GocharLite = {
  planet: string;
  houseFromNatalLagna: number;
  isRetrograde?: boolean;
  note?: string;
};

type DashaPeriod = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

const CATEGORY_META: Record<
  LifeEventCategory,
  {
    title: string;
    lords: Set<string>;
    ageMin: number;
    ageMax: number;
    suggestion: string;
    gocharHouses: number[];
    gocharPlanets: Set<string>;
  }
> = {
  marriage: {
    title: "Marriage / partnership",
    lords: new Set(["Venus", "Jupiter", "Moon"]),
    ageMin: 18,
    ageMax: 52,
    suggestion:
      "Confirm vivaha muhurta with panchang; keep introductions sincere in supportive windows.",
    gocharHouses: [1, 5, 7, 9, 11],
    gocharPlanets: new Set(["Venus", "Jupiter", "Moon"]),
  },
  career: {
    title: "Career rise / visibility",
    lords: new Set(["Sun", "Saturn", "Mercury", "Jupiter", "Mars", "Venus", "Rahu"]),
    ageMin: 18,
    ageMax: 70,
    suggestion:
      "Use this window for skill proof, interviews, and leadership visibility — not shortcuts.",
    gocharHouses: [2, 6, 10, 11],
    gocharPlanets: new Set(["Sun", "Saturn", "Mercury", "Jupiter", "Mars", "Venus"]),
  },
  job: {
    title: "Job change / new role",
    // Ketu/Rahu/Mercury/Venus antars often mark role / livelihood shifts
    lords: new Set(["Sun", "Saturn", "Mercury", "Rahu", "Mars", "Venus", "Ketu", "Jupiter"]),
    ageMin: 20,
    ageMax: 65,
    suggestion:
      "Prefer role changes when Antardasha supports 10th-house themes; keep documents ready.",
    gocharHouses: [3, 6, 10, 11],
    gocharPlanets: new Set(["Sun", "Saturn", "Mercury", "Rahu", "Mars", "Venus", "Jupiter"]),
  },
  education: {
    title: "Education / learning",
    lords: new Set(["Mercury", "Jupiter", "Moon"]),
    ageMin: 5,
    ageMax: 35,
    suggestion:
      "Strong for exams, certifications, and mentorship — pair study discipline with Mercury/Jupiter periods.",
    gocharHouses: [4, 5, 9],
    gocharPlanets: new Set(["Mercury", "Jupiter", "Moon"]),
  },
  wealth: {
    title: "Wealth / income growth",
    lords: new Set(["Jupiter", "Venus", "Mercury", "Moon"]),
    ageMin: 21,
    ageMax: 70,
    suggestion:
      "Favour steady income plans and honest partnerships; avoid speculative leaps on weak Moon days.",
    gocharHouses: [2, 11],
    gocharPlanets: new Set(["Jupiter", "Venus", "Mercury"]),
  },
  property: {
    title: "Home / property",
    lords: new Set(["Mars", "Moon", "Venus", "Saturn"]),
    ageMin: 24,
    ageMax: 70,
    suggestion: "Property steps suit Mars–Moon–4th themes; verify legal paperwork independently.",
    gocharHouses: [4, 11],
    gocharPlanets: new Set(["Mars", "Moon", "Venus", "Saturn"]),
  },
  travel: {
    title: "Travel / relocation",
    // 9th/12th/Rahu themes — Venus & Ketu often mark foreign / long-distance shifts
    lords: new Set(["Rahu", "Moon", "Mercury", "Jupiter", "Venus", "Ketu", "Sun"]),
    ageMin: 16,
    ageMax: 70,
    suggestion:
      "Good for purposeful travel or relocation planning; Rahu periods may bring unconventional paths.",
    gocharHouses: [3, 7, 9, 12],
    gocharPlanets: new Set(["Rahu", "Moon", "Mercury", "Jupiter", "Venus", "Ketu", "Sun"]),
  },
  health: {
    title: "Health vigilance",
    lords: new Set(["Saturn", "Mars", "Rahu", "Ketu", "Sun"]),
    ageMin: 16,
    ageMax: 100,
    suggestion:
      "Classical caution window — rest, routine, and medical check-ups if needed (not a diagnosis).",
    gocharHouses: [1, 6, 8, 12],
    gocharPlanets: new Set(["Saturn", "Mars", "Rahu", "Sun"]),
  },
  spiritual: {
    title: "Spiritual growth",
    lords: new Set(["Jupiter", "Ketu", "Saturn", "Moon", "Sun", "Venus"]),
    ageMin: 12,
    ageMax: 100,
    suggestion:
      "Favour mantra, seva, and quiet study; deepen practice without withdrawing from duties.",
    gocharHouses: [1, 5, 8, 9, 12],
    gocharPlanets: new Set(["Jupiter", "Ketu", "Saturn", "Moon", "Sun"]),
  },
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fmtRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", opts)}`;
}

function ageAt(date: Date, birth: Date) {
  let age = date.getFullYear() - birth.getFullYear();
  const m = date.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && date.getDate() < birth.getDate())) age -= 1;
  return age;
}

function lordOfHouse(lagnaSign: string, house: number): string | null {
  const idx = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
  if (idx < 0) return null;
  const sign = SIGNS[(idx + house - 1 + 12) % 12] as (typeof SIGNS)[number] | undefined;
  if (!sign) return null;
  return HOUSE_LORDS[sign] ?? null;
}

function phaseOf(start: Date, end: Date, now: Date): LifeEventPhase {
  if (end < now) return "past";
  if (start <= now && end >= now) return "present";
  return "future";
}

function scoreTheme(
  category: LifeEventCategory,
  mahaLord: string,
  antarLord: string,
  houseLords: {
    seventh?: string | null;
    tenth?: string | null;
    fourth?: string | null;
    second?: string | null;
    ninth?: string | null;
    twelfth?: string | null;
  },
): number {
  const meta = CATEGORY_META[category];
  let score = 48;
  if (meta.lords.has(mahaLord)) score += 18;
  if (meta.lords.has(antarLord)) score += 22;
  if (mahaLord === antarLord && meta.lords.has(mahaLord)) score += 6;

  if (
    category === "marriage" &&
    (mahaLord === houseLords.seventh || antarLord === houseLords.seventh)
  ) {
    score += 14;
  }
  if (
    (category === "career" || category === "job") &&
    (mahaLord === houseLords.tenth || antarLord === houseLords.tenth)
  ) {
    score += 14;
  }
  if (
    category === "property" &&
    (mahaLord === houseLords.fourth || antarLord === houseLords.fourth)
  ) {
    score += 12;
  }
  if (
    category === "wealth" &&
    (mahaLord === houseLords.second || antarLord === houseLords.second)
  ) {
    score += 12;
  }
  if (category === "health" && (antarLord === "Saturn" || antarLord === "Mars")) score += 8;
  if (
    (category === "travel" || category === "spiritual") &&
    (mahaLord === houseLords.ninth || antarLord === houseLords.ninth)
  ) {
    score += 12;
  }
  if (
    (category === "travel" || category === "spiritual") &&
    (mahaLord === houseLords.twelfth || antarLord === houseLords.twelfth)
  ) {
    score += 10;
  }

  // Job/career pivots often cluster in Mercury / Rahu / Ketu / Saturn antars
  if (
    (category === "job" || category === "career") &&
    ["Mercury", "Rahu", "Ketu", "Saturn", "Venus"].includes(antarLord)
  ) {
    score += 6;
  }

  // Travel / pilgrimage / relocation: Rahu–Moon–9th/12th antars
  if (category === "travel" && ["Rahu", "Moon", "Mercury", "Ketu", "Jupiter"].includes(antarLord)) {
    score += 8;
  }

  // Sadhana windows: Ketu–Jupiter–Saturn–Moon antars
  if (
    category === "spiritual" &&
    ["Ketu", "Jupiter", "Saturn", "Moon", "Sun"].includes(antarLord)
  ) {
    score += 8;
  }

  return clamp(score);
}

/** Score how much current gochar supports a life theme (0–18). */
export function scoreGocharForCategory(
  category: LifeEventCategory,
  gochar: GocharLite[] | undefined | null,
): { boost: number; note?: string; caution?: string } {
  if (!gochar?.length) return { boost: 0 };

  const meta = CATEGORY_META[category];
  const hits: string[] = [];
  let boost = 0;
  let caution: string | undefined;

  for (const g of gochar) {
    const house = g.houseFromNatalLagna;
    const planetHit = meta.gocharPlanets.has(g.planet);
    const houseHit = meta.gocharHouses.includes(house);
    if (planetHit && houseHit) {
      boost += g.isRetrograde ? 4 : 6;
      hits.push(`${g.planet} transit house ${house}${g.isRetrograde ? " (retrograde)" : ""}`);
    } else if (planetHit && (house === 6 || house === 8 || house === 12) && category !== "health") {
      // mild friction for non-health themes
      boost -= 1;
    }

    if (category === "marriage" && g.planet === "Saturn" && (house === 1 || house === 7)) {
      caution = `Saturn transit on house ${house} may slow formalisation — patience over haste.`;
      boost -= 2;
    }
  }

  boost = clamp(Math.max(0, boost));
  if (boost > 18) boost = 18;

  return {
    boost,
    note: hits.length ? `Gochar support: ${hits.slice(0, 3).join("; ")}.` : undefined,
    caution,
  };
}

function probabilityFrom(
  score: number,
  gocharBoost: number,
  phase: LifeEventPhase,
): {
  probability: EventProbability;
  probabilityLabel: string;
} {
  if (phase === "past") {
    if (score >= 86 || (score >= 78 && gocharBoost >= 6)) {
      return { probability: "high", probabilityLabel: "Retrospective high likelihood" };
    }
    if (score >= 74 || gocharBoost >= 6) {
      return { probability: "elevated", probabilityLabel: "Retrospective elevated" };
    }
    return { probability: "moderate", probabilityLabel: "Past supportive window" };
  }
  if (score >= 86 || (score >= 78 && gocharBoost >= 8)) {
    return { probability: "high", probabilityLabel: "High probability window" };
  }
  if (score >= 80 || (score >= 72 && gocharBoost >= 6)) {
    return { probability: "elevated", probabilityLabel: "Elevated likelihood" };
  }
  return { probability: "moderate", probabilityLabel: "Moderate / supportive" };
}

function titleFor(
  category: LifeEventCategory,
  score: number,
  houseHit: boolean,
  probability: EventProbability,
) {
  const base = CATEGORY_META[category].title;
  if (probability === "high") return `High-probability ${base.toLowerCase()}`;
  if (houseHit) return `${base} · house-lord activation`;
  if (score >= 88) return `Prime ${base.toLowerCase()}`;
  if (score >= 78) return `Favorable ${base.toLowerCase()}`;
  return `Supportive ${base.toLowerCase()}`;
}

function cleanPlace(city?: string | null, country?: string | null) {
  const c = (city || "").trim();
  const countryTrim = (country || "").trim();
  if (!c && !countryTrim) return "your lived place";
  if (!countryTrim) return c;
  if (!c) return countryTrim;
  if (c.toLowerCase().endsWith(countryTrim.toLowerCase())) return c;
  return `${c}, ${countryTrim}`;
}

export function buildDeshKaalPatra(input: {
  birthDate?: Date | string | null;
  city?: string | null;
  country?: string | null;
  now?: Date;
}): DeshKaalPatraContext {
  const now = input.now || new Date();
  let ageYears: number | null = null;
  let birthIso: string | null = null;
  if (input.birthDate) {
    const b = new Date(input.birthDate);
    if (!Number.isNaN(b.getTime())) {
      ageYears = ageAt(now, b);
      birthIso = b.toISOString();
    }
  }
  const place = cleanPlace(input.city, input.country);
  return {
    ageYears,
    birthDate: birthIso,
    placeNote: `Desha — guidance is read for life in ${place}; local custom and law still shape what is practical.`,
    timeNote:
      ageYears != null
        ? `Kaala — you are about ${ageYears} years old; windows favour age-appropriate themes and near-term dasha + gochar confluence.`
        : "Kaala — add birth details so age-aware (Kaala) filtering can refine suggestions.",
    vesselNote:
      "Patra — suggestions respect capacity and stage of life; high-probability means dasha + transit agreement, not a guarantee.",
  };
}

function monthsFromNow(date: Date, now: Date) {
  return (date.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000);
}

const MILESTONE_CATEGORIES = new Set<LifeEventCategory>([
  "job",
  "career",
  "marriage",
  "education",
  "wealth",
]);

export function computeLifeEventsCalendar(input: {
  periods: DashaPeriod[];
  lagnaSign?: string | null;
  birthDate?: Date | string | null;
  city?: string | null;
  country?: string | null;
  currentMaha?: string | null;
  currentAntar?: string | null;
  gocharPlanets?: GocharLite[] | null;
  gocharHighlights?: string[] | null;
  /** Historical gochar keyed by Antardasha start ISO — sky at period midpoint */
  historicalGocharByAntarStart?: Record<string, GocharLite[]> | null;
  now?: Date;
}): {
  context: DeshKaalPatraContext;
  events: LifeEventItem[];
  byPhase: Record<LifeEventPhase, LifeEventItem[]>;
  highProbability: LifeEventItem[];
  pastHighlights: LifeEventItem[];
  presentHighlights: LifeEventItem[];
  futureHighlights: LifeEventItem[];
  categories: LifeEventCategory[];
  gocharSummary: string;
} {
  const now = input.now || new Date();
  const context = buildDeshKaalPatra({
    birthDate: input.birthDate,
    city: input.city,
    country: input.country,
    now,
  });
  const birth = input.birthDate ? new Date(input.birthDate) : null;
  const validBirth = birth && !Number.isNaN(birth.getTime()) ? birth : null;

  const lagna = input.lagnaSign || "Aries";
  const houseLords = {
    seventh: lordOfHouse(lagna, 7),
    tenth: lordOfHouse(lagna, 10),
    fourth: lordOfHouse(lagna, 4),
    second: lordOfHouse(lagna, 2),
    ninth: lordOfHouse(lagna, 9),
    twelfth: lordOfHouse(lagna, 12),
  };

  const full = ensureAntardashaCoverage(input.periods);
  const antars = full.filter((p) => p.level === "ANTAR");
  const events: LifeEventItem[] = [];
  const categories = Object.keys(CATEGORY_META) as LifeEventCategory[];
  const pastCutoff = new Date(now);
  pastCutoff.setFullYear(pastCutoff.getFullYear() - 12);

  const gocharSummary = input.gocharHighlights?.length
    ? `Live gochar: ${input.gocharHighlights.slice(0, 3).join(" · ")}`
    : input.gocharPlanets?.length
      ? "Live gochar raises probability when transits agree; past windows use sky at that Antardasha midpoint."
      : "Gochar unavailable — windows use dasha lords only.";

  for (const period of antars) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    const mahaLord = period.parentLord || "—";
    const antarLord = period.lord;
    const phase = phaseOf(start, end, now);
    const mid = new Date((start.getTime() + end.getTime()) / 2);
    const ageAtWindow = validBirth ? ageAt(mid, validBirth) : null;
    const antarKey = start.toISOString();

    if (phase === "past" && end < pastCutoff) continue;
    if (phase === "future" && monthsFromNow(start, now) > 18 * 12) continue;

    for (const category of categories) {
      const meta = CATEGORY_META[category];
      if (ageAtWindow != null && (ageAtWindow < meta.ageMin || ageAtWindow > meta.ageMax)) {
        continue;
      }
      if (
        phase === "future" &&
        context.ageYears != null &&
        (context.ageYears + 2 < meta.ageMin || context.ageYears > meta.ageMax + 8)
      ) {
        continue;
      }
      if (phase === "past" && category === "health" && ageAtWindow != null && ageAtWindow < 18) {
        continue;
      }

      let score = scoreTheme(category, mahaLord, antarLord, houseLords);

      const hist = phase === "past" ? input.historicalGocharByAntarStart?.[antarKey] || null : null;
      const liveNear =
        phase === "present" ||
        (phase === "future" && monthsFromNow(start, now) <= 24) ||
        (phase === "past" && monthsFromNow(end, now) >= -2);

      const gocharPlanetsForScore =
        phase === "past"
          ? hist || (liveNear ? input.gocharPlanets : null)
          : liveNear
            ? input.gocharPlanets
            : null;

      const gochar = gocharPlanetsForScore
        ? scoreGocharForCategory(category, gocharPlanetsForScore)
        : {
            boost: 0,
            note: undefined as string | undefined,
            caution: undefined as string | undefined,
          };

      if (phase === "present") score += gochar.boost;
      else if (phase === "future" && monthsFromNow(start, now) <= 24) {
        score += Math.round(gochar.boost * 0.85);
      } else if (phase === "past") {
        score += Math.round(gochar.boost * 0.9);
      }
      score = clamp(score);

      // Soft themes (travel / spiritual / health) use a gentler bar than career milestones
      const softTheme = category === "travel" || category === "spiritual" || category === "health";
      const pastMilestone = phase === "past" && MILESTONE_CATEGORIES.has(category);
      if (phase === "past" && pastMilestone && score < 70) continue;
      if (phase === "past" && softTheme && score < 66) continue;
      if (phase === "past" && !pastMilestone && !softTheme && score < 74) continue;
      if (phase === "future" && softTheme && score < 64) continue;
      if (phase === "future" && !softTheme && score < 70) continue;
      if (phase === "present" && softTheme && score < 58) continue;
      if (phase === "present" && !softTheme && score < 64) continue;

      const houseHit =
        (category === "marriage" &&
          (mahaLord === houseLords.seventh || antarLord === houseLords.seventh)) ||
        ((category === "career" || category === "job") &&
          (mahaLord === houseLords.tenth || antarLord === houseLords.tenth)) ||
        (category === "property" &&
          (mahaLord === houseLords.fourth || antarLord === houseLords.fourth)) ||
        ((category === "travel" || category === "spiritual") &&
          (mahaLord === houseLords.ninth ||
            antarLord === houseLords.ninth ||
            mahaLord === houseLords.twelfth ||
            antarLord === houseLords.twelfth));

      const { probability, probabilityLabel } = probabilityFrom(score, gochar.boost, phase);
      const dashaLabel = `${mahaLord}–${antarLord}`;
      const range = fmtRange(start, end);
      const gocharParts = [gochar.note, gochar.caution].filter(Boolean);
      const gocharNote =
        gocharParts.length > 0
          ? `${phase === "past" ? "Sky then · " : ""}${gocharParts.join(" ")}`
          : undefined;

      const explain =
        phase === "present"
          ? `Active now (${range}). ${dashaLabel} Antardasha is running${
              gochar.boost >= 6
                ? ", and current gochar agrees — high probability for this theme"
                : gochar.boost > 0
                  ? "; gochar adds mild support"
                  : "; watch gochar month-to-month for confirmation"
            }.`
          : phase === "future"
            ? `Upcoming window ${range}. Probability rises when dasha lords stay favourable and gochar activates houses ${meta.gocharHouses.join("/")}.`
            : `Past window ${range} under ${dashaLabel}. Scored with dasha${
                hist ? " + gochar at the period midpoint" : ""
              }.`;

      events.push({
        id: `${category}-${start.toISOString()}-${antarLord}`,
        category,
        title: titleFor(category, score, Boolean(houseHit), probability),
        window: range,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        score,
        phase,
        dashaLabel,
        reason: `${meta.title} in ${dashaLabel} Antardasha (${range}). Score ${score}/100 from dasha lords${
          gochar.boost ? ` + gochar (+${gochar.boost})` : ""
        }.`,
        ageHint: ageAtWindow != null ? `Approx. age ${ageAtWindow}` : undefined,
        suggestion: meta.suggestion,
        probability,
        probabilityLabel,
        gocharNote,
        explain,
      });
    }
  }

  const sorted = events.sort((a, b) => {
    const phaseRank = { present: 0, future: 1, past: 2 } as const;
    const probRank = { high: 0, elevated: 1, moderate: 2 } as const;
    if (a.phase !== b.phase) return phaseRank[a.phase] - phaseRank[b.phase];
    if (a.phase === "past") {
      return b.endDate.localeCompare(a.endDate) || b.score - a.score;
    }
    return (
      probRank[a.probability] - probRank[b.probability] ||
      b.score - a.score ||
      a.startDate.localeCompare(b.startDate)
    );
  });

  const seen = new Set<string>();
  const unique: LifeEventItem[] = [];
  for (const e of sorted) {
    const year = e.startDate.slice(0, 4);
    const key = `${e.category}-${e.phase}-${year}-${e.dashaLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(e);
  }

  const byPhase: Record<LifeEventPhase, LifeEventItem[]> = {
    past: unique.filter((e) => e.phase === "past").slice(0, 16),
    present: unique.filter((e) => e.phase === "present").slice(0, 12),
    future: unique.filter((e) => e.phase === "future").slice(0, 20),
  };

  const presentHighlights = byPhase.present
    .filter((e) => e.probability === "high" || e.probability === "elevated")
    .slice(0, 8);
  const futureHighlights = byPhase.future
    .filter((e) => e.probability === "high" || e.probability === "elevated")
    .slice(0, 10);
  const pastHighlights = byPhase.past
    .filter(
      (e) =>
        MILESTONE_CATEGORIES.has(e.category) &&
        (e.probability === "high" || e.probability === "elevated" || e.score >= 74),
    )
    .slice(0, 10);

  const highProbability = [...presentHighlights, ...futureHighlights].slice(0, 14);

  return {
    context,
    events: [...byPhase.present, ...byPhase.future, ...byPhase.past],
    byPhase,
    highProbability,
    pastHighlights,
    presentHighlights,
    futureHighlights,
    categories,
    gocharSummary,
  };
}
