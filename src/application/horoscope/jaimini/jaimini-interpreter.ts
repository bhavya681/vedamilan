import { longitudeToNavamsaSign } from "@/application/horoscope/navamsa";
import { buildNavamsaChart, navamsaPlanet } from "@/application/horoscope/navamsa-chart";
import { SIGNS } from "@/application/horoscope/vedic-constants";
import { seventhLord } from "@/application/rules/shukra-milan";
import type { CharaKarakaResult, CharaKarakaRow } from "./chara-karaka";
import { describeLink, karakaLink, type JaiminiLink } from "./jaimini-aspects";

const HOUSE_THEME: Record<number, string> = {
  1: "identity, vitality, and the body",
  2: "speech, family resources, and values",
  3: "effort, siblings, and short journeys",
  4: "home, mother, and emotional roots",
  5: "intelligence, children, and creative output",
  6: "service, health discipline, and obstacles",
  7: "partnership, the public, and contracts",
  8: "shared resources, research, and transformation",
  9: "dharma, mentors, and longer journeys",
  10: "profession, status, and duty",
  11: "gains, networks, and fulfilled aims",
  12: "retreat, foreign links, and expenditure",
};

const PLANET_NATURE: Record<string, string> = {
  Sun: "authority, vitality, and self-expression",
  Moon: "mind, nourishment, and adaptability",
  Mars: "drive, courage, and decisive action",
  Mercury: "analysis, speech, and commerce",
  Jupiter: "wisdom, expansion, and counsel",
  Venus: "harmony, affection, and aesthetic sense",
  Saturn: "structure, endurance, and responsibility",
  Rahu: "unconventional aims, foreign or amplifying influence",
};

export type KarakaProfile = {
  row: CharaKarakaRow;
  coreThemes: string[];
  growthThemes: string[];
  strengths: string[];
  challenges: string[];
  jaiminiNote: string;
  calculation: string[];
};

export type KarakamshaSnapshot = {
  available: boolean;
  sign: string | null;
  signId: number | null;
  planetsInKarakamsha: string[];
  note: string;
};

export type DaraPartnership = {
  row: CharaKarakaRow;
  partnerArchetype: string;
  communication: string;
  expectations: string;
  strengths: string[];
  challenges: string[];
  develop: string[];
  seventhHouse: {
    seventhSign: string;
    seventhLord: string;
    dkIsSeventhLord: boolean;
    dkInSeventh: boolean;
    occupants: string[];
  };
  navamsa: {
    available: boolean;
    dkSign: string | null;
    dkHouse: number | null;
    note: string;
  };
  aspects: string[];
  disclaimer: string;
};

export type AmatyaCareer = {
  row: CharaKarakaRow;
  akLink: JaiminiLink;
  akLinkNote: string;
  careerThemes: string[];
  workingEnvironments: string[];
  leadership: string;
  challenges: string[];
  jaiminiPerspective: string;
};

export type KarakaMapEdge = {
  fromCode: string;
  toCode: string;
  fromPlanet: string;
  toPlanet: string;
  link: JaiminiLink;
  note: string;
};

function houseLine(house: number): string {
  return HOUSE_THEME[house] ?? "this life area";
}

function planetNature(planet: string): string {
  return PLANET_NATURE[planet] ?? "this graha's natural significations";
}

export function interpretKaraka(row: CharaKarakaRow): KarakaProfile {
  const dignity =
    row.dignity === "Exalted"
      ? "exaltation may support easier expression of this karaka"
      : row.dignity === "Debilitated"
        ? "debilitation can make this karaka's themes require more conscious effort"
        : row.dignity === "Own"
          ? "own-sign placement supports a native, self-directed expression"
          : "neutral dignity — expression depends more on house and aspects";

  return {
    row,
    coreThemes: [
      `${row.sanskrit} is ${row.planet} in ${row.sign}, house ${row.house}.`,
      `This karaka is traditionally associated with ${row.englishRole.toLowerCase()}.`,
      `${row.planet} naturally signifies ${planetNature(row.planet)}.`,
    ],
    growthThemes: [
      `House ${row.house} colours this karaka through ${houseLine(row.house)}.`,
      `Sign lord ${row.signLord} becomes a supporting actor for how ${row.abbreviation} manifests.`,
    ],
    strengths: [
      `When well-supported, ${row.planet} as ${row.abbreviation} can emphasise ${planetNature(row.planet)} in the field of ${row.englishRole.toLowerCase()}.`,
    ],
    challenges: [
      dignity,
      row.isRetrograde
        ? `Retrograde ${row.planet} may internalise this karaka — results often come through review rather than first attempts.`
        : `Direct motion — this karaka tends to express outwardly along its natural grain.`,
    ],
    jaiminiNote: `${row.sanskrit} (${row.abbreviation}) is assigned because ${row.planet} holds ${row.degree.formatted} in ${row.sign} (ranking degree ${row.degree.rankingDegree.toFixed(4)}°).`,
    calculation: [
      `Planet = ${row.planet}`,
      `Longitude = ${row.longitude.toFixed(6)}° sidereal`,
      `Degree in sign = ${row.degree.formatted}`,
      `Ranking degree = ${row.degree.rankingDegree.toFixed(6)}°`,
      `Sign = ${row.sign}`,
      `House = ${row.house}`,
      `Dignity = ${row.dignity ?? "—"}`,
      row.tiedWith.length ? `Tied with = ${row.tiedWith.join(", ")}` : "No ranking tie",
    ],
  };
}

export function interpretAtmakaraka(
  result: CharaKarakaResult,
  planets: Array<{ planet: string; longitude?: number; sign: string }>,
  lagna: { lagnaSign: string; lagnaDegree?: number | null; lagnaLongitude?: number | null },
): { profile: KarakaProfile | null; karakamsha: KarakamshaSnapshot } {
  const ak = result.byCode.AK;
  if (!ak) {
    return {
      profile: null,
      karakamsha: {
        available: false,
        sign: null,
        signId: null,
        planetsInKarakamsha: [],
        note: "Atmakaraka could not be computed — regenerate kundli.",
      },
    };
  }
  const profile = interpretKaraka(ak);
  const withLong = planets.filter((p) => typeof p.longitude === "number") as Array<{
    planet: string;
    longitude: number;
    sign: string;
  }>;
  if (!withLong.length) {
    return {
      profile,
      karakamsha: {
        available: false,
        sign: longitudeToNavamsaSign(ak.longitude).sign,
        signId: longitudeToNavamsaSign(ak.longitude).signId,
        planetsInKarakamsha: [],
        note: "Karakamsha sign is the D9 sign of the Atmakaraka. Other D9 occupants need exact longitudes.",
      },
    };
  }
  const d9 = buildNavamsaChart({
    planets: withLong.map((p) => ({ ...p, house: 1 })),
    lagnaSign: lagna.lagnaSign,
    lagnaDegree: lagna.lagnaDegree,
    lagnaLongitude: lagna.lagnaLongitude,
  });
  const akD9 = longitudeToNavamsaSign(ak.longitude);
  const occupants = d9.planets.filter((p) => p.sign === akD9.sign).map((p) => p.planet);
  return {
    profile,
    karakamsha: {
      available: true,
      sign: akD9.sign,
      signId: akD9.signId,
      planetsInKarakamsha: occupants,
      note: `Karakamsha is the Navamsa (D9) sign of the Atmakaraka (${ak.planet}). Occupants listed are planets whose D9 sign is ${akD9.sign}.`,
    },
  };
}

export function interpretAmatyakaraka(result: CharaKarakaResult): AmatyaCareer | null {
  const amk = result.byCode.AmK;
  const ak = result.byCode.AK;
  if (!amk) return null;
  const link = ak
    ? karakaLink(ak.planet, ak.sign, amk.planet, amk.sign)
    : { kind: "none" as const, from: "AK", to: amk.planet };
  const environments: string[] = [
    `${amk.planet} as Amatyakaraka is traditionally associated with work that uses ${planetNature(amk.planet)}.`,
    `House ${amk.house} suggests the field of ${houseLine(amk.house)} as a Jaimini vocational colour — not a job title.`,
  ];
  if (amk.house === 10 || amk.house === 6 || amk.house === 11) {
    environments.push(
      "Placement in a work-related house (6, 10, or 11) is traditionally read as vocation showing more visibly in public duty or service.",
    );
  }
  return {
    row: amk,
    akLink: link,
    akLinkNote: ak
      ? describeLink(link)
      : "Atmakaraka unavailable — AK–AmK relationship cannot be scored.",
    careerThemes: [
      `${amk.planet} in ${amk.sign} as AmK — Jaimini perspective on contribution, not a D10 replacement.`,
      `Sign lord ${amk.signLord} is a supporting vocational actor.`,
    ],
    workingEnvironments: environments,
    leadership:
      amk.planet === "Sun" || amk.planet === "Mars" || amk.planet === "Jupiter"
        ? `This AmK is traditionally associated with more visible leadership or counsel roles — still dependent on dasha and the 10th house.`
        : `This AmK is traditionally associated with specialised, supportive, or structured contribution rather than a single leadership style.`,
    challenges: [
      amk.dignity === "Debilitated"
        ? "Debilitated AmK can indicate vocational self-doubt — skill still develops through repetition."
        : "Vocational friction, if any, is read from house, dignity, and the AK–AmK link — not from AmK alone.",
    ],
    jaiminiPerspective: `Read Amatyakaraka alongside the existing Dashamsa (D10) and 10th-house analysis. This is an additional Jaimini layer.`,
  };
}

export function interpretDarakaraka(
  result: CharaKarakaResult,
  planets: Array<{ planet: string; sign: string; house: number; longitude?: number }>,
  lagnaSign: string,
  lagna: { lagnaDegree?: number | null; lagnaLongitude?: number | null },
): DaraPartnership | null {
  const dk = result.byCode.DK;
  if (!dk) return null;
  const seventhSign =
    SIGNS[(SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]) + 6) % 12] ?? "Libra";
  const lord = seventhLord(lagnaSign);
  const occupants = planets.filter((p) => p.house === 7).map((p) => p.planet);
  const conjunctions = planets
    .filter((p) => p.planet !== dk.planet && p.sign === dk.sign)
    .map((p) => p.planet);

  const aspectNotes: string[] = [];
  if (conjunctions.length) {
    aspectNotes.push(`Conjoined in ${dk.sign} with ${conjunctions.join(", ")}.`);
  }
  for (const p of planets) {
    if (p.planet === dk.planet) continue;
    const link = karakaLink(dk.planet, dk.sign, p.planet, p.sign);
    if (link.kind === "rashi-drishti" && ["Venus", "Jupiter", "Moon", lord].includes(p.planet)) {
      aspectNotes.push(describeLink(link));
    }
  }
  if (!aspectNotes.length) {
    aspectNotes.push(
      "No additional Jaimini rashi-drishti to Venus, Jupiter, Moon, or the 7th lord was recorded for DK.",
    );
  }

  const withLong = planets.filter((p) => typeof p.longitude === "number") as Array<{
    planet: string;
    longitude: number;
    sign: string;
    house: number;
  }>;
  let navamsa: DaraPartnership["navamsa"] = {
    available: false,
    dkSign: null,
    dkHouse: null,
    note: "Navamsa of DK requires exact longitudes.",
  };
  if (withLong.length) {
    const d9 = buildNavamsaChart({
      planets: withLong,
      lagnaSign,
      lagnaDegree: lagna.lagnaDegree,
      lagnaLongitude: lagna.lagnaLongitude,
    });
    const dkD9 = navamsaPlanet(d9, dk.planet);
    navamsa = {
      available: Boolean(dkD9),
      dkSign: dkD9?.sign ?? longitudeToNavamsaSign(dk.longitude).sign,
      dkHouse: dkD9?.house ?? null,
      note: dkD9
        ? `DK occupies ${dkD9.sign} in Navamsa, house ${dkD9.house} from D9 lagna.`
        : "DK D9 sign computed from longitude; house unavailable.",
    };
  }

  return {
    row: dk,
    partnerArchetype: `Darakaraka ${dk.planet} in ${dk.sign} is traditionally associated with a partner who expresses ${planetNature(dk.planet)} — an archetype, not a physical description.`,
    communication: `${dk.planet} as DK may colour how partnership is discussed and negotiated, especially through house ${dk.house} (${houseLine(dk.house)}).`,
    expectations: `This combination is traditionally associated with expecting ${planetNature(dk.planet)} from close partnership. It does not determine who one will marry.`,
    strengths: [
      dk.dignity === "Exalted" || dk.dignity === "Own"
        ? "Dignity of DK is supportive — partnership themes may feel more native to the person."
        : "Partnership capacity is read from the whole chart; DK is one indicator among several.",
      dk.house === 7
        ? "DK in the 7th is traditionally associated with partnership themes showing more directly in the life."
        : `DK in house ${dk.house} weaves partnership through ${houseLine(dk.house)}.`,
    ],
    challenges: [
      dk.dignity === "Debilitated"
        ? "Debilitated DK can indicate extra work on fairness, timing, or self-worth in partnership — not a verdict."
        : "Challenges, if any, appear when DK, the 7th lord, and dasha disagree — see Marriage Intelligence.",
    ],
    develop: [
      "Treat DK as a mirror for what one seeks in partnership, then verify against D9, 7th lord, Venus/Jupiter, dasha, and compatibility.",
      "Conscious development: honour the planet's ethics (e.g. Saturn → reliability, Venus → mutual respect) without assuming a single partner type.",
    ],
    seventhHouse: {
      seventhSign,
      seventhLord: lord,
      dkIsSeventhLord: dk.planet === lord,
      dkInSeventh: dk.house === 7,
      occupants,
    },
    navamsa,
    aspects: aspectNotes,
    disclaimer:
      "Darakaraka is one Jaimini indicator. It does not replace Parashari 7th house, Navamsa, dasha, transit, or compatibility analysis.",
  };
}

export function karakaRelationshipMap(result: CharaKarakaResult): KarakaMapEdge[] {
  const pairs: Array<[keyof typeof result.byCode, keyof typeof result.byCode]> = [
    ["AK", "AmK"],
    ["AmK", "DK"],
    ["AK", "DK"],
    ["AK", "PK"],
    ["MK", "PiK"],
  ];
  const edges: KarakaMapEdge[] = [];
  for (const [from, to] of pairs) {
    const a = result.byCode[from];
    const b = result.byCode[to];
    if (!a || !b) continue;
    const link = karakaLink(a.planet, a.sign, b.planet, b.sign);
    edges.push({
      fromCode: String(from),
      toCode: String(to),
      fromPlanet: a.planet,
      toPlanet: b.planet,
      link,
      note: describeLink(link),
    });
  }
  return edges;
}
