import { HOUSE_LORDS, longitudeToSign } from "@/application/horoscope/vedic-constants";

/**
 * Jaimini Chara Karaka ranking from exact sidereal longitudes.
 *
 * Default convention (JHora-style Saptakaraka):
 * - 7 grahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
 * - Rank by degree-in-sign descending (highest = Atmakaraka)
 * - Retrograde planets use the same in-sign degree (direct mode)
 *
 * Optional Ashtakaraka:
 * - Includes Rahu; Ketu is never a Chara Karaka
 * - Rahu’s ranking degree is 30° minus in-sign degree (always retrograde)
 *
 * Optional remaining-longitude mode:
 * - For retrograde grahas (except the Rahu special case above), rank by 30° − degree
 *
 * These two systems are never mixed in one result.
 */

export type KarakaCode = "AK" | "AmK" | "BK" | "MK" | "PiK" | "PK" | "GK" | "DK";
export type KarakaConvention = "sapta" | "ashta";
export type RetrogradeMode = "direct" | "remaining";

export type KarakaPlanetInput = {
  planet: string;
  sign: string;
  house: number;
  longitude: number;
  isRetrograde?: boolean;
  dignity?: string | null;
  nakshatra?: string;
};

export type CharaKarakaOptions = {
  convention?: KarakaConvention;
  retrogradeMode?: RetrogradeMode;
};

export type DegreeParts = {
  degreeInSign: number;
  rankingDegree: number;
  d: number;
  m: number;
  s: number;
  formatted: string;
};

export type CharaKarakaRow = {
  code: KarakaCode;
  sanskrit: string;
  abbreviation: string;
  englishRole: string;
  shortMeaning: string;
  planet: string;
  symbol: string;
  sign: string;
  house: number;
  longitude: number;
  degree: DegreeParts;
  isRetrograde: boolean;
  dignity: string | null;
  nakshatra: string | null;
  signLord: string;
  tiedWith: string[];
};

export type CharaKarakaResult = {
  convention: KarakaConvention;
  conventionLabel: string;
  retrogradeMode: RetrogradeMode;
  methodology: string;
  rows: CharaKarakaRow[];
  byCode: Partial<Record<KarakaCode, CharaKarakaRow>>;
  notes: string[];
};

export const SAPTA_ORDER: KarakaCode[] = ["AK", "AmK", "BK", "MK", "PiK", "PK", "DK"];
export const ASHTA_ORDER: KarakaCode[] = ["AK", "AmK", "BK", "MK", "PiK", "PK", "GK", "DK"];

const SAPTA_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
const ASHTA_PLANETS = [...SAPTA_PLANETS, "Rahu"] as const;

const KARAKA_META: Record<
  KarakaCode,
  { sanskrit: string; abbreviation: string; englishRole: string; shortMeaning: string }
> = {
  AK: {
    sanskrit: "Atmakaraka",
    abbreviation: "AK",
    englishRole: "Soul / core life direction",
    shortMeaning:
      "The graha with the highest in-sign degree — the significator of the self in Jaimini.",
  },
  AmK: {
    sanskrit: "Amatyakaraka",
    abbreviation: "AmK",
    englishRole: "Career / counsel / contribution",
    shortMeaning:
      "Second-highest degree — traditionally associated with vocation, advisors, and how one serves.",
  },
  BK: {
    sanskrit: "Bhratrikaraka",
    abbreviation: "BK",
    englishRole: "Siblings / courage / peers",
    shortMeaning: "Third-highest degree — siblings, co-workers, and the courage to act.",
  },
  MK: {
    sanskrit: "Matrikaraka",
    abbreviation: "MK",
    englishRole: "Mother / home / emotional roots",
    shortMeaning: "Fourth-highest degree — mother, home, and the emotional foundation.",
  },
  PiK: {
    sanskrit: "Pitrikaraka",
    abbreviation: "PiK",
    englishRole: "Father / dharma / authority",
    shortMeaning: "Fifth-highest degree — father, mentors, and duty toward authority.",
  },
  PK: {
    sanskrit: "Putrakaraka",
    abbreviation: "PK",
    englishRole: "Children / creativity / intelligence",
    shortMeaning: "Sixth-highest degree — children, creative intelligence, and students.",
  },
  GK: {
    sanskrit: "Gnatikaraka",
    abbreviation: "GK",
    englishRole: "Obstacles / kin / disputes",
    shortMeaning:
      "Seventh-highest degree in the 8-karaka scheme — kin, rivals, and friction that shapes growth.",
  },
  DK: {
    sanskrit: "Darakaraka",
    abbreviation: "DK",
    englishRole: "Spouse / partnership",
    shortMeaning:
      "Lowest ranked degree among the counted grahas — the significator of the partner, not a sole marriage predictor.",
  },
};

export const PLANET_SYMBOL: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

const TIE_EPSILON = 1e-8;

export function splitDegreeInSign(longitude: number): Omit<DegreeParts, "rankingDegree"> {
  const degreeInSign = longitudeToSign(longitude).degreeInSign;
  const d = Math.floor(degreeInSign);
  const minutesFloat = (degreeInSign - d) * 60;
  const m = Math.floor(minutesFloat);
  const s = Math.min(59.999, (minutesFloat - m) * 60);
  const sRounded = Math.round(s * 100) / 100;
  return {
    degreeInSign,
    d,
    m,
    s: sRounded,
    formatted: `${d}°${String(m).padStart(2, "0")}'${sRounded.toFixed(2).padStart(5, "0")}"`,
  };
}

/**
 * Degree used only for ranking. Display always uses the true in-sign degree.
 */
export function rankingDegreeForPlanet(
  planet: string,
  longitude: number,
  isRetrograde: boolean,
  convention: KarakaConvention,
  retrogradeMode: RetrogradeMode,
): number {
  const deg = longitudeToSign(longitude).degreeInSign;
  if (planet === "Rahu" && convention === "ashta") {
    return 30 - deg;
  }
  if (retrogradeMode === "remaining" && isRetrograde && planet !== "Rahu") {
    return 30 - deg;
  }
  return deg;
}

export function computeCharaKarakas(
  planets: KarakaPlanetInput[],
  options: CharaKarakaOptions = {},
): CharaKarakaResult {
  const convention: KarakaConvention = options.convention === "ashta" ? "ashta" : "sapta";
  const retrogradeMode: RetrogradeMode =
    options.retrogradeMode === "remaining" ? "remaining" : "direct";
  const order = convention === "ashta" ? ASHTA_ORDER : SAPTA_ORDER;
  const allowed = new Set(convention === "ashta" ? ASHTA_PLANETS : SAPTA_PLANETS);
  const notes: string[] = [];

  const candidates = planets.filter((p) => allowed.has(p.planet as (typeof ASHTA_PLANETS)[number]));
  const missing = [...allowed].filter((name) => !candidates.some((p) => p.planet === name));
  if (missing.length) {
    notes.push(`Missing grahas for this convention: ${missing.join(", ")}.`);
  }

  const usable = candidates.filter(
    (p) => typeof p.longitude === "number" && Number.isFinite(p.longitude),
  );
  if (usable.length < order.length) {
    notes.push(
      `Need ${order.length} grahas with exact longitude; found ${usable.length}. Regenerate kundli if longitudes are missing.`,
    );
  }

  const ranked = usable
    .map((p) => {
      const parts = splitDegreeInSign(p.longitude);
      const rankDeg = rankingDegreeForPlanet(
        p.planet,
        p.longitude,
        Boolean(p.isRetrograde),
        convention,
        retrogradeMode,
      );
      return { planet: p, parts, rankDeg };
    })
    .sort((a, b) => {
      const diff = b.rankDeg - a.rankDeg;
      if (Math.abs(diff) > TIE_EPSILON) return diff;
      return a.planet.planet.localeCompare(b.planet.planet);
    });

  const tiedWith: Record<string, string[]> = {};
  for (let i = 0; i < ranked.length; i++) {
    const ties: string[] = [];
    for (let j = 0; j < ranked.length; j++) {
      if (i === j) continue;
      if (Math.abs(ranked[i]!.rankDeg - ranked[j]!.rankDeg) <= TIE_EPSILON) {
        ties.push(ranked[j]!.planet.planet);
      }
    }
    if (ties.length) {
      tiedWith[ranked[i]!.planet.planet] = ties;
      notes.push(
        `${ranked[i]!.planet.planet} is tied in ranking degree with ${ties.join(", ")} — ordered by planet name for stability.`,
      );
    }
  }

  const rows: CharaKarakaRow[] = [];
  const byCode: Partial<Record<KarakaCode, CharaKarakaRow>> = {};
  const count = Math.min(order.length, ranked.length);
  for (let i = 0; i < count; i++) {
    const code = order[i]!;
    const meta = KARAKA_META[code];
    const item = ranked[i]!;
    const p = item.planet;
    const sign = longitudeToSign(p.longitude).sign;
    const row: CharaKarakaRow = {
      code,
      sanskrit: meta.sanskrit,
      abbreviation: meta.abbreviation,
      englishRole: meta.englishRole,
      shortMeaning: meta.shortMeaning,
      planet: p.planet,
      symbol: PLANET_SYMBOL[p.planet] ?? p.planet.slice(0, 2),
      sign: p.sign || sign,
      house: p.house,
      longitude: p.longitude,
      degree: { ...item.parts, rankingDegree: item.rankDeg },
      isRetrograde: Boolean(p.isRetrograde),
      dignity: p.dignity ?? null,
      nakshatra: p.nakshatra ?? null,
      signLord: HOUSE_LORDS[sign as keyof typeof HOUSE_LORDS] ?? "—",
      tiedWith: tiedWith[p.planet] ?? [],
    };
    rows.push(row);
    byCode[code] = row;
  }

  const conventionLabel =
    convention === "ashta"
      ? "8 Chara Karakas (Ashtakaraka, including Rahu; Ketu excluded)"
      : "7 Chara Karakas (Saptakaraka — Sun through Saturn; Rahu/Ketu excluded)";

  const methodology =
    convention === "ashta"
      ? `Ashtakaraka: eight grahas ranked by in-sign degree (Rahu ranked at 30° − degree). Retrograde mode: ${retrogradeMode}. Ketu is never used.`
      : `Saptakaraka: seven grahas ranked by in-sign degree descending. Retrograde mode: ${retrogradeMode}. Rahu and Ketu are excluded.`;

  return {
    convention,
    conventionLabel,
    retrogradeMode,
    methodology,
    rows,
    byCode,
    notes: [...new Set(notes)],
  };
}

export function karakaOfPlanet(
  result: CharaKarakaResult,
  planet: string,
): CharaKarakaRow | undefined {
  return result.rows.find((row) => row.planet === planet);
}
