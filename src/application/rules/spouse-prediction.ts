/**
 * Single-chart spouse / alliance tendencies (directional, not guarantees).
 * Classical cues: 5th–7th–Venus–Rahu (love / foreign), Saturn–Jupiter–2nd (arranged / same culture).
 */

import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";

export type MarriagePath = "love" | "arranged" | "mixed";
export type SpouseOrigin = "same_culture" | "foreign" | "mixed";

export type ChartPlanetInput = {
  planet: string;
  sign: string;
  house: number;
  isRetrograde?: boolean;
};

export type SpouseTendencies = {
  marriagePath: MarriagePath;
  marriagePathLabel: string;
  marriagePathNote: string;
  marriagePathScore: number;
  spouseOrigin: SpouseOrigin;
  spouseOriginLabel: string;
  spouseOriginNote: string;
  spouseOriginScore: number;
  reasons: string[];
  methodology: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function lordOfHouse(lagnaSign: string, house: number): string | null {
  const idx = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
  if (idx < 0) return null;
  const sign = SIGNS[(idx + house - 1 + 12) % 12] as (typeof SIGNS)[number] | undefined;
  if (!sign) return null;
  return HOUSE_LORDS[sign] ?? null;
}

function findPlanet(planets: ChartPlanetInput[], name: string) {
  return planets.find((p) => p.planet === name) || null;
}

function occupantsOfHouse(planets: ChartPlanetInput[], house: number) {
  return planets.filter((p) => p.house === house);
}

/**
 * Predict marriage path (love / arranged / mixed) and spouse origin from D1.
 * Interpretive guidance only — never a fixed prediction.
 */
export function predictSpouseTendencies(input: {
  lagnaSign?: string | null;
  planets?: ChartPlanetInput[] | null;
}): SpouseTendencies {
  const lagna = input.lagnaSign || "Aries";
  const planets = (input.planets || []).filter((p) => p.planet && p.house >= 1 && p.house <= 12);

  const seventhLord = lordOfHouse(lagna, 7);
  const fifthLord = lordOfHouse(lagna, 5);

  const venus = findPlanet(planets, "Venus");
  const jupiter = findPlanet(planets, "Jupiter");
  const saturn = findPlanet(planets, "Saturn");
  const moon = findPlanet(planets, "Moon");
  const rahu = findPlanet(planets, "Rahu");
  const ketu = findPlanet(planets, "Ketu");
  const mars = findPlanet(planets, "Mars");

  const h5 = occupantsOfHouse(planets, 5);
  const h12 = occupantsOfHouse(planets, 12);
  const h9 = occupantsOfHouse(planets, 9);
  const h2 = occupantsOfHouse(planets, 2);

  let love = 0;
  let arranged = 0;
  let foreign = 0;
  let same = 0;
  const reasons: string[] = [];

  // ——— Love vs arranged ———
  if (h5.some((p) => ["Venus", "Moon", "Rahu", "Mars"].includes(p.planet))) {
    love += 3;
    reasons.push("5th-house romance markers support a love-led path.");
  }
  if (venus && (venus.house === 5 || venus.house === 7)) {
    love += 3;
    reasons.push(`Venus in house ${venus.house} emphasises personal choice in alliance.`);
  }
  if (rahu && (rahu.house === 5 || rahu.house === 7)) {
    love += 3;
    foreign += 2;
    reasons.push("Rahu on the 5th/7th axis often marks unconventional or self-chosen bonding.");
  }
  if (mars && (mars.house === 5 || mars.house === 7) && venus) {
    love += 2;
  }
  if (
    fifthLord &&
    seventhLord &&
    (fifthLord === seventhLord ||
      findPlanet(planets, fifthLord)?.house === 7 ||
      findPlanet(planets, seventhLord)?.house === 5)
  ) {
    love += 3;
    reasons.push("5th–7th lord link traditionally supports affection-first marriage.");
  }

  if (saturn && (saturn.house === 7 || saturn.house === 2 || saturn.house === 4)) {
    arranged += 3;
    same += 1;
    reasons.push(
      `Saturn in house ${saturn.house} leans toward duty, family process, and timed alliance.`,
    );
  }
  if (jupiter && (jupiter.house === 7 || jupiter.house === 2 || jupiter.house === 9)) {
    arranged += 2;
    same += 1;
    reasons.push("Jupiter on alliance/family houses favours elders’ blessing and formal pathways.");
  }
  if (h2.some((p) => ["Moon", "Jupiter", "Venus", "Saturn"].includes(p.planet))) {
    arranged += 2;
    same += 1;
  }
  if (seventhLord === "Saturn" || seventhLord === "Jupiter") {
    arranged += 2;
  }
  if (moon && (moon.house === 2 || moon.house === 4)) {
    arranged += 1;
    same += 1;
  }

  // ——— Spouse origin ———
  if (rahu && rahu.house === 7) {
    foreign += 4;
    reasons.push(
      "Rahu in the 7th classically hints at a partner from a different background or place.",
    );
  }
  if (ketu && ketu.house === 7) {
    foreign += 2;
    love += 1;
  }
  if (venus && (venus.house === 12 || venus.house === 9)) {
    foreign += 3;
    reasons.push(`Venus in house ${venus.house} may point beyond the immediate cultural circle.`);
  }
  if (seventhLord && findPlanet(planets, seventhLord)?.house === 12) {
    foreign += 4;
    reasons.push("7th lord in the 12th is a traditional foreign / distant-spouse indicator.");
  }
  if (seventhLord && findPlanet(planets, seventhLord)?.house === 9) {
    foreign += 2;
    reasons.push("7th lord in the 9th can show a partner from afar or a different community.");
  }
  if (
    h12.some((p) => ["Venus", "Rahu", "Moon"].includes(p.planet)) ||
    (seventhLord != null && h12.some((p) => p.planet === seventhLord))
  ) {
    foreign += 2;
  }
  if (h9.some((p) => ["Venus", "Rahu", "Jupiter"].includes(p.planet))) {
    foreign += 1;
  }

  if (!rahu || (rahu.house !== 7 && rahu.house !== 12)) {
    same += 1;
  }
  if (jupiter && [2, 4, 7, 10].includes(jupiter.house)) {
    same += 2;
  }
  if (saturn && [2, 7, 10].includes(saturn.house) && (!rahu || rahu.house !== 7)) {
    same += 2;
  }
  if (seventhLord && [1, 2, 4, 5, 7, 10].includes(findPlanet(planets, seventhLord)?.house ?? 0)) {
    same += 2;
  }
  if (
    venus &&
    [1, 2, 4, 5, 7, 10, 11].includes(venus.house) &&
    venus.house !== 12 &&
    venus.house !== 9
  ) {
    same += 1;
  }

  // Default baseline so empty charts still resolve
  if (love === 0 && arranged === 0) {
    arranged += 1;
    love += 1;
  }
  if (foreign === 0 && same === 0) {
    same += 2;
  }

  const marriagePath: MarriagePath =
    love >= arranged + 2 ? "love" : arranged >= love + 2 ? "arranged" : "mixed";
  const spouseOrigin: SpouseOrigin =
    foreign >= same + 2 ? "foreign" : same >= foreign + 2 ? "same_culture" : "mixed";

  const marriagePathScore = clamp(
    50 + Math.abs(love - arranged) * 6 + Math.max(love, arranged) * 2,
  );
  const spouseOriginScore = clamp(50 + Math.abs(foreign - same) * 6 + Math.max(foreign, same) * 2);

  const PATH_COPY: Record<MarriagePath, { label: string; note: string }> = {
    love: {
      label: "Love marriage leaning",
      note: "Chart cues favour meeting through personal choice, friendship, or attraction first — family blessing may follow.",
    },
    arranged: {
      label: "Arranged / family-led leaning",
      note: "Chart cues favour introductions through family, elders, or formal alliance channels with structured timing.",
    },
    mixed: {
      label: "Love + arranged blend",
      note: "Both personal choice and family process appear — many alliances form as “arranged with consent” or love with elders’ support.",
    },
  };

  const ORIGIN_COPY: Record<SpouseOrigin, { label: string; note: string }> = {
    foreign: {
      label: "Spouse may be from another place / culture",
      note: "7th/12th/Rahu–Venus patterns suggest a partner from another region, country, or cultural background. Confirm with D9 and lived context.",
    },
    same_culture: {
      label: "Spouse likely from similar culture / region",
      note: "Traditional 2nd/7th/Jupiter–Saturn cues lean toward a partner from a familiar community, faith, or region.",
    },
    mixed: {
      label: "Same-culture or cross-background both possible",
      note: "Signals are mixed — partner may share your culture or come from a neighbouring / different background. Keep both open.",
    },
  };

  return {
    marriagePath,
    marriagePathLabel: PATH_COPY[marriagePath].label,
    marriagePathNote: PATH_COPY[marriagePath].note,
    marriagePathScore,
    spouseOrigin,
    spouseOriginLabel: ORIGIN_COPY[spouseOrigin].label,
    spouseOriginNote: ORIGIN_COPY[spouseOrigin].note,
    spouseOriginScore,
    reasons: reasons.slice(0, 5),
    methodology:
      "Directional D1 reading from 5th/7th/Venus/Rahu (path) and 7th/9th/12th/Rahu–Venus (origin). Not a guarantee — confirm with Navamsa, family context, and free will.",
  };
}

/** Short labels for calendar marriage cards */
export function marriageDetailFromTendencies(t: SpouseTendencies): {
  detailLabel: string;
  title: string;
  suggestion: string;
} {
  const pathBit =
    t.marriagePath === "love"
      ? "Love marriage"
      : t.marriagePath === "arranged"
        ? "Arranged marriage"
        : "Love–arranged blend";
  const originBit =
    t.spouseOrigin === "foreign"
      ? "foreign / cross-cultural spouse cues"
      : t.spouseOrigin === "same_culture"
        ? "same-culture / regional spouse cues"
        : "spouse background mixed";

  return {
    detailLabel: pathBit,
    title: `Marriage · ${pathBit.toLowerCase()}`,
    suggestion: `${t.marriagePathNote} Also: ${originBit}. ${t.spouseOriginNote}`,
  };
}
