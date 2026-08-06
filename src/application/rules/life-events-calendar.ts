/**
 * Lifetime event calendar from Vimshottari dasha + Gochar + Desh–Kaal–Patra.
 * Surfaces major life chapters only (one primary theme per Antardasha).
 * Mild / background windows are filtered out so the calendar stays readable.
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

/** Travel specificity — classical 3rd / 9th / 12th house framing */
export type TravelKind = "foreign" | "long_distance" | "local" | "relocation" | "pilgrimage";

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
  /** One-line actionable guidance for this window */
  acceptLine: string;
  /** Likelihood band from dasha + gochar confluence */
  probability: EventProbability;
  probabilityLabel: string;
  /** How current gochar supports (or cautions) this window */
  gocharNote?: string;
  /** Plain-language timing explanation */
  explain: string;
  /** Always major for shipped events — mild windows are not returned */
  significance: "major";
  /** Antardasha span in whole months — helps users see “big period” scale */
  spanMonths: number;
  /** For travel events — foreign / local / relocation etc. */
  travelKind?: TravelKind;
  /** Short human label for chips (e.g. “Foreign travel”) */
  detailLabel?: string;
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
    /** One-line actionable guidance for this window */
    acceptLine: string;
    gocharHouses: number[];
    gocharPlanets: Set<string>;
  }
> = {
  marriage: {
    title: "Marriage / partnership",
    lords: new Set(["Venus", "Jupiter", "Moon"]),
    ageMin: 18,
    ageMax: 45,
    suggestion:
      "Confirm vivaha muhurta with panchang; keep introductions sincere in supportive windows.",
    acceptLine:
      "Accept sincere proposals, family meetings, and alliance steps aligned with your values.",
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
    acceptLine:
      "Accept leadership offers, interviews, and skill-building opportunities when aligned.",
    gocharHouses: [2, 6, 10, 11],
    gocharPlanets: new Set(["Sun", "Saturn", "Mercury", "Jupiter", "Mars", "Venus"]),
  },
  job: {
    title: "Job change / new role",
    lords: new Set(["Sun", "Saturn", "Mercury", "Rahu", "Mars", "Venus", "Ketu", "Jupiter"]),
    ageMin: 20,
    ageMax: 65,
    suggestion:
      "Prefer role changes when Antardasha supports 10th-house themes; keep documents ready.",
    acceptLine: "Accept role changes when documents, timing, and growth align.",
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
    acceptLine: "Accept exams, certifications, and mentorships aligned with your goals.",
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
    acceptLine: "Accept steady income plans and honest partnerships; avoid speculative leaps.",
    gocharHouses: [2, 11],
    gocharPlanets: new Set(["Jupiter", "Venus", "Mercury"]),
  },
  property: {
    title: "Home / property",
    lords: new Set(["Mars", "Moon", "Venus", "Saturn"]),
    ageMin: 24,
    ageMax: 70,
    suggestion: "Property steps suit Mars–Moon–4th themes; verify legal paperwork independently.",
    acceptLine: "Accept property steps when legal paperwork, location, and budget align.",
    gocharHouses: [4, 11],
    gocharPlanets: new Set(["Mars", "Moon", "Venus", "Saturn"]),
  },
  travel: {
    title: "Travel",
    lords: new Set(["Rahu", "Moon", "Mercury", "Jupiter", "Venus", "Ketu", "Sun"]),
    ageMin: 16,
    ageMax: 70,
    suggestion:
      "Plan purposeful movement in this Antardasha; confirm visas, leave, and muhurta when the type is foreign or long-distance.",
    acceptLine: "Accept travel when visas, leave, and purpose align.",
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
    acceptLine: "Accept rest, routine, and medical check-ups when needed.",
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
    acceptLine: "Accept spiritual practices that deepen without withdrawing from duties.",
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
  detailTitle?: string,
) {
  const base = detailTitle || CATEGORY_META[category].title;
  if (probability === "high") return `Major · ${base}`;
  if (houseHit && score >= 80) return `Major · ${base}`;
  if (score >= 88) return `Major · ${base}`;
  return `Key chapter · ${base}`;
}

/**
 * Classify travel flavour from dasha lords + house lords + gochar.
 * Classical: 3rd = short/local, 9th = long/far, 12th = foreign/abroad, Ketu/Jupiter = pilgrimage.
 */
export function classifyTravelKind(input: {
  mahaLord: string;
  antarLord: string;
  ninthLord?: string | null;
  twelfthLord?: string | null;
  thirdLord?: string | null;
  fourthLord?: string | null;
  gochar?: GocharLite[] | null;
  spanMonths: number;
}): { kind: TravelKind; label: string; title: string; suggestion: string; acceptLine: string } {
  const { mahaLord, antarLord, spanMonths } = input;
  const lords = new Set([mahaLord, antarLord]);
  const hit = (lord?: string | null) => Boolean(lord && lords.has(lord));

  const gochar = input.gochar || [];
  const gHouse = (h: number) => gochar.some((g) => g.houseFromNatalLagna === h);
  const gPlanetHouse = (planet: string, houses: number[]) =>
    gochar.some((g) => g.planet === planet && houses.includes(g.houseFromNatalLagna));

  let foreignPts = 0;
  let longPts = 0;
  let localPts = 0;
  let relocatePts = 0;
  let pilgrimPts = 0;

  // Dasha lord affinities
  if (lords.has("Rahu")) {
    foreignPts += 3;
    longPts += 1;
  }
  if (lords.has("Ketu")) {
    pilgrimPts += 2;
    foreignPts += 1;
  }
  if (lords.has("Venus")) {
    foreignPts += 1;
    longPts += 1;
  }
  if (lords.has("Jupiter")) {
    longPts += 2;
    pilgrimPts += 2;
  }
  if (lords.has("Mercury") || lords.has("Moon")) {
    localPts += 2;
    longPts += 1;
  }
  if (lords.has("Mars") || lords.has("Saturn")) {
    relocatePts += 2;
  }
  if (lords.has("Sun")) longPts += 1;

  // House-lord activation
  if (hit(input.twelfthLord)) foreignPts += 4;
  if (hit(input.ninthLord)) {
    longPts += 3;
    pilgrimPts += 1;
  }
  if (hit(input.thirdLord)) localPts += 4;
  if (hit(input.fourthLord)) relocatePts += 3;

  // Gochar confirmation
  if (gHouse(12) || gPlanetHouse("Rahu", [9, 12]) || gPlanetHouse("Venus", [12])) foreignPts += 3;
  if (gHouse(9) || gPlanetHouse("Jupiter", [3, 9])) longPts += 2;
  if (gHouse(3) || gPlanetHouse("Moon", [3]) || gPlanetHouse("Mercury", [3])) localPts += 3;
  if (gHouse(4) || gPlanetHouse("Mars", [4, 12]) || gPlanetHouse("Saturn", [4])) relocatePts += 2;
  if (gPlanetHouse("Ketu", [9, 12]) || gPlanetHouse("Jupiter", [12])) pilgrimPts += 2;

  // Longer Antardasha leans relocation vs short trips
  if (spanMonths >= 14) relocatePts += 2;
  if (spanMonths <= 6) localPts += 1;

  const ranked: Array<{ kind: TravelKind; pts: number }> = [
    { kind: "foreign", pts: foreignPts },
    { kind: "pilgrimage", pts: pilgrimPts },
    { kind: "relocation", pts: relocatePts },
    { kind: "long_distance", pts: longPts },
    { kind: "local", pts: localPts },
  ];
  ranked.sort((a, b) => b.pts - a.pts);

  const top = ranked[0]!;
  // Tie-break: if foreign and long are close, prefer foreign when 12th/Rahu present
  let kind = top.kind;
  if (
    top.kind === "long_distance" &&
    foreignPts >= longPts - 1 &&
    (hit(input.twelfthLord) || lords.has("Rahu"))
  ) {
    kind = "foreign";
  }
  if (top.pts <= 0) kind = "long_distance";

  const COPY: Record<
    TravelKind,
    { label: string; title: string; suggestion: string; acceptLine: string }
  > = {
    foreign: {
      label: "Foreign travel",
      title: "Foreign travel / abroad",
      suggestion:
        "Favour passport, visa, and overseas plans in this window; confirm muhurta before long stays abroad.",
      acceptLine: "Accept passport, visa, and overseas plans when aligned.",
    },
    long_distance: {
      label: "Long-distance travel",
      title: "Long-distance / interstate travel",
      suggestion:
        "Strong for far domestic journeys, transfers, or multi-city work trips — book with buffer days.",
      acceptLine: "Accept far journeys, transfers, and multi-city trips with buffer days.",
    },
    local: {
      label: "Local travel",
      title: "Local / short travel",
      suggestion:
        "Good for nearby trips, commuting changes, and short stays within your region — keep plans flexible.",
      acceptLine: "Accept nearby trips and commuting changes when flexible.",
    },
    relocation: {
      label: "Relocation",
      title: "Relocation / change of place",
      suggestion:
        "Points to shifting base or settling elsewhere; align housing, paperwork, and family timing first.",
      acceptLine: "Accept relocation when housing, paperwork, and family timing align.",
    },
    pilgrimage: {
      label: "Pilgrimage travel",
      title: "Pilgrimage / sacred travel",
      suggestion:
        "Favour tirtha, temple journeys, or retreat travel; pair with quiet practice rather than rushed tourism.",
      acceptLine: "Accept sacred journeys paired with quiet practice.",
    },
  };

  return { kind, ...COPY[kind] };
}

function spanMonthsBetween(start: Date, end: Date) {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.round(ms / (30.44 * 24 * 60 * 60 * 1000)));
}

function isSoftTheme(category: LifeEventCategory) {
  return category === "travel" || category === "spiritual" || category === "health";
}

/** Keep only windows strong enough to present as a major life chapter. */
function meetsMajorBar(
  category: LifeEventCategory,
  phase: LifeEventPhase,
  score: number,
  probability: EventProbability,
  spanMonths: number,
): boolean {
  // Short blips confuse users — keep brief windows only if currently active & strong
  if (spanMonths < 3 && !(phase === "present" && score >= 78)) return false;

  if (isSoftTheme(category)) {
    // Soft themes only when clearly major (not background support)
    if (probability !== "high" && score < 82) return false;
    if (phase === "past" && score < 80) return false;
    if (phase === "future" && score < 78) return false;
    if (phase === "present" && score < 74) return false;
    return true;
  }

  // Milestone themes (marriage, career, job, education, wealth, property)
  if (phase === "past" && score < 76) return false;
  if (phase === "future" && score < 74) return false;
  if (phase === "present" && score < 70) return false;
  // Drop moderate-only noise unless score is clearly decisive
  if (probability === "moderate" && score < 80) return false;
  return true;
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
      "Patra — only major Antardasha chapters are shown; mild windows are hidden so the calendar stays clear. Agreement is directional, not a guarantee.",
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
    third: lordOfHouse(lagna, 3),
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
      const spanMonths = spanMonthsBetween(start, end);
      if (!meetsMajorBar(category, phase, score, probability, spanMonths)) continue;

      const dashaLabel = `${mahaLord}–${antarLord}`;
      const range = fmtRange(start, end);
      const gocharParts = [gochar.note, gochar.caution].filter(Boolean);
      const gocharNote =
        gocharParts.length > 0
          ? `${phase === "past" ? "Sky then · " : ""}${gocharParts.join(" ")}`
          : undefined;

      const spanLabel =
        spanMonths >= 12
          ? `${Math.round(spanMonths / 12)}-year chapter`
          : `${spanMonths}-month chapter`;

      const travel =
        category === "travel"
          ? classifyTravelKind({
              mahaLord,
              antarLord,
              ninthLord: houseLords.ninth,
              twelfthLord: houseLords.twelfth,
              thirdLord: houseLords.third,
              fourthLord: houseLords.fourth,
              gochar: gocharPlanetsForScore,
              spanMonths,
            })
          : null;

      const explain =
        phase === "present"
          ? `Active major period (${range}, ${spanLabel}). ${dashaLabel} Antardasha is the primary theme now${
              gochar.boost >= 6
                ? ", and current gochar agrees"
                : gochar.boost > 0
                  ? "; gochar adds confirming support"
                  : ""
            }${travel ? ` — read as ${travel.label.toLowerCase()}` : ""}.`
          : phase === "future"
            ? `Upcoming major period ${range} (${spanLabel})${
                travel ? ` for ${travel.label.toLowerCase()}` : ""
              }. Watch when gochar activates houses ${meta.gocharHouses.join("/")}.`
            : `Past major period ${range} (${spanLabel}) under ${dashaLabel}${
                travel ? ` · ${travel.label}` : ""
              }${hist ? " — scored with dasha + sky at the midpoint" : ""}.`;

      events.push({
        id: `${category}-${start.toISOString()}-${antarLord}`,
        category,
        title: titleFor(category, score, Boolean(houseHit), probability, travel?.title),
        window: `${range} · ${spanLabel}`,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        score,
        phase,
        dashaLabel,
        reason: `Primary theme of ${dashaLabel} Antardasha (${range})${
          travel ? ` · ${travel.label}` : ""
        }. Score ${score}/100 from dasha lords${gochar.boost ? ` + gochar (+${gochar.boost})` : ""}.`,
        ageHint: ageAtWindow != null ? `Approx. age ${ageAtWindow}` : undefined,
        suggestion: travel?.suggestion ?? meta.suggestion,
        acceptLine: travel?.acceptLine ?? meta.acceptLine,
        probability,
        probabilityLabel,
        gocharNote,
        explain,
        significance: "major",
        spanMonths,
        travelKind: travel?.kind,
        detailLabel: travel?.label,
      });
    }
  }

  // One primary life theme per Antardasha — avoid flooding the user with every category
  const bestByAntar = new Map<string, LifeEventItem>();
  for (const e of events) {
    const key = `${e.startDate}|${e.dashaLabel}`;
    const prev = bestByAntar.get(key);
    if (!prev) {
      bestByAntar.set(key, e);
      continue;
    }
    const prevMilestone = MILESTONE_CATEGORIES.has(prev.category) || prev.category === "property";
    const nextMilestone = MILESTONE_CATEGORIES.has(e.category) || e.category === "property";
    // Prefer milestone themes when scores are close; otherwise take the higher score
    if (e.score > prev.score + 2) {
      bestByAntar.set(key, e);
    } else if (Math.abs(e.score - prev.score) <= 2 && nextMilestone && !prevMilestone) {
      bestByAntar.set(key, e);
    } else if (e.score > prev.score) {
      bestByAntar.set(key, e);
    }
  }

  const sorted = [...bestByAntar.values()].sort((a, b) => {
    const phaseRank = { present: 0, future: 1, past: 2 } as const;
    const probRank = { high: 0, elevated: 1, moderate: 2 } as const;
    if (a.phase !== b.phase) return phaseRank[a.phase] - phaseRank[b.phase];
    if (a.phase === "past") {
      return b.endDate.localeCompare(a.endDate) || b.score - a.score;
    }
    return (
      probRank[a.probability] - probRank[b.probability] ||
      b.score - a.score ||
      b.spanMonths - a.spanMonths ||
      a.startDate.localeCompare(b.startDate)
    );
  });

  // Tight caps — major chapters only
  const byPhase: Record<LifeEventPhase, LifeEventItem[]> = {
    past: sorted.filter((e) => e.phase === "past").slice(0, 6),
    present: sorted.filter((e) => e.phase === "present").slice(0, 4),
    future: sorted.filter((e) => e.phase === "future").slice(0, 8),
  };

  const presentHighlights = byPhase.present.slice(0, 4);
  const futureHighlights = byPhase.future
    .filter((e) => e.probability === "high" || e.probability === "elevated" || e.score >= 78)
    .slice(0, 6);
  const pastHighlights = byPhase.past
    .filter(
      (e) =>
        (MILESTONE_CATEGORIES.has(e.category) || e.category === "property") &&
        (e.probability === "high" || e.probability === "elevated" || e.score >= 78),
    )
    .slice(0, 6);

  const highProbability = [...presentHighlights, ...futureHighlights].slice(0, 8);

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
