import type { PlanetKey, PlanetPosition } from "@/lib/services/swiss-ephemeris";

import {
  HOUSE_LORDS,
  SIGNS,
  dignityForPlanet,
  dignityMark,
  formatDegreeInSign,
  longitudeToNakshatra,
  longitudeToSign,
  wholeSignHouse,
} from "./vedic-constants";

const DISPLAY_NAMES: Record<PlanetKey, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  rahu: "Rahu",
  ketu: "Ketu",
};

export type ChartPlanet = {
  planet: string;
  sign: string;
  signId: number;
  house: number;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
  dignity: string | null;
};

/** Compact glyph stored inside chart boxes (AstroSage-style). */
export type ChartPlanetGlyph = {
  planet: string;
  abbr: string;
  label: string;
  degree: string;
  degreeValue: number;
  dignity: string | null;
  mark: string;
  isRetrograde: boolean;
  house: number;
  signId: number;
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const CLASSICAL = new Set([
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
]);

export function toPlanetGlyph(p: ChartPlanet): ChartPlanetGlyph {
  const abbr = PLANET_ABBR[p.planet] ?? p.planet.slice(0, 2);
  const mark = dignityMark(p.dignity);
  const degree = formatDegreeInSign(p.longitude);
  const retro = p.isRetrograde ? "℞" : "";
  return {
    planet: p.planet,
    abbr,
    label: `${abbr}${mark}${retro}`,
    degree,
    degreeValue: (((p.longitude % 360) + 360) % 360) % 30,
    dignity: p.dignity,
    mark,
    isRetrograde: p.isRetrograde,
    house: p.house,
    signId: p.signId,
  };
}

export function buildPlanetRows(
  positions: Record<PlanetKey, PlanetPosition>,
  lagnaLongitude: number,
): ChartPlanet[] {
  const lagna = longitudeToSign(lagnaLongitude);
  return (Object.keys(positions) as PlanetKey[]).map((key) => {
    const pos = positions[key];
    const sign = longitudeToSign(pos.longitude);
    const nak = longitudeToNakshatra(pos.longitude);
    const name = DISPLAY_NAMES[key];
    return {
      planet: name,
      sign: sign.sign,
      signId: sign.signId,
      // Rasi / AstroSage D1: whole-sign houses from Lagna rashi (not equal bhava from degree)
      house: wholeSignHouse(sign.signId, lagna.signId),
      longitude: sign.longitude,
      latitude: pos.latitude,
      speed: pos.speedLongitude,
      isRetrograde: pos.speedLongitude < 0,
      nakshatra: nak.nakshatra,
      nakshatraPada: nak.nakshatraPada,
      dignity: ["Rahu", "Ketu", "Uranus", "Neptune", "Pluto"].includes(name)
        ? null
        : dignityForPlanet(name, sign.sign),
    };
  });
}

export function buildHouseLords(lagnaSignId: number): Record<string, string> {
  const lords: Record<string, string> = {};
  for (let i = 0; i < 12; i += 1) {
    const sign = SIGNS[(lagnaSignId + i) % 12] ?? "Aries";
    lords[String(i + 1)] = HOUSE_LORDS[sign];
  }
  return lords;
}

export function detectManglik(planets: ChartPlanet[]): {
  status: "NON_MANGLIK" | "PARTIAL" | "MANGLIK";
  notes: string;
} {
  const mars = planets.find((p) => p.planet === "Mars");
  if (!mars) return { status: "NON_MANGLIK", notes: "Mars not found in chart." };
  const manglikHouses = new Set([1, 2, 4, 7, 8, 12]);
  if (manglikHouses.has(mars.house)) {
    if (mars.house === 2 || mars.house === 8) {
      return {
        status: "PARTIAL",
        notes: `Mars in house ${mars.house} (${mars.sign}) — traditionally partial Manglik consideration.`,
      };
    }
    return {
      status: "MANGLIK",
      notes: `Mars in house ${mars.house} (${mars.sign}) — Manglik yoga indicated by classical house rule.`,
    };
  }
  return {
    status: "NON_MANGLIK",
    notes: `Mars in house ${mars.house} (${mars.sign}) — not in classical Manglik houses.`,
  };
}

export function detectDoshas(planets: ChartPlanet[], manglikStatus: string) {
  return [
    {
      code: "MANGLIK",
      name: "Manglik Dosha",
      present: manglikStatus !== "NON_MANGLIK",
      severity:
        manglikStatus === "MANGLIK" ? "HIGH" : manglikStatus === "PARTIAL" ? "MEDIUM" : "NONE",
      notes: "",
    },
    {
      code: "KALA_SARPA",
      name: "Kaal Sarp hint",
      present: false,
      severity: "NONE",
      notes: "Full axis sweep reserved for detailed engine pass.",
    },
  ];
}

export function detectYogas(planets: ChartPlanet[], lagnaSign: string) {
  const yogas: Array<{
    code: string;
    name: string;
    category: "MARRIAGE" | "CAREER" | "WEALTH" | "HEALTH" | "GENERAL";
    strength: number;
    description: string;
  }> = [];

  const byName = (name: string) => planets.find((p) => p.planet === name);
  const jupiter = byName("Jupiter");
  const venus = byName("Venus");
  const moon = byName("Moon");
  const mercury = byName("Mercury");
  const sun = byName("Sun");
  const mars = byName("Mars");

  const lagnaSignId = Math.max(0, SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]));
  const houseLords = buildHouseLords(lagnaSignId);
  const kendra = new Set([1, 4, 7, 10]);
  const trikona = new Set([1, 5, 9]);

  const lordOf = (house: number) => houseLords[String(house)];
  const placement = (lordName: string | undefined) =>
    lordName ? planets.find((p) => p.planet === lordName) : undefined;

  // Classical Raja Yoga hint: kendra lord + trikona lord association (same house / mutual aspect proxy via same/adjacent house)
  const kendraLords = [1, 4, 7, 10].map(lordOf).filter(Boolean) as string[];
  const trikonaLords = [1, 5, 9].map(lordOf).filter(Boolean) as string[];
  for (const kLord of kendraLords) {
    for (const tLord of trikonaLords) {
      if (kLord === tLord) continue;
      const k = placement(kLord);
      const t = placement(tLord);
      if (!k || !t) continue;
      const conjunct = k.house === t.house;
      // Simplified association: conjunction or mutual kendra/trikona placement
      if (
        conjunct ||
        (kendra.has(k.house) && trikona.has(t.house)) ||
        (trikona.has(k.house) && kendra.has(t.house))
      ) {
        yogas.push({
          code: "RAJA_YOGA",
          name: "Raja Yoga",
          category: "CAREER",
          strength: conjunct ? 85 : 72,
          description: `${kLord} (kendra themes) and ${tLord} (trikona themes) associate via houses ${k.house} & ${t.house}${conjunct ? " (conjunction)" : ""}. Classically supports recognition, authority, and life elevation when dasha supports.`,
        });
        break;
      }
    }
    if (yogas.some((y) => y.code === "RAJA_YOGA")) break;
  }

  // Gajakesari: Jupiter in kendra from Moon
  if (jupiter && moon) {
    const fromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(fromMoon) || jupiter.house === moon.house) {
      yogas.push({
        code: "GAJAKESARI",
        name: "Gajakesari Yoga",
        category: "WEALTH",
        strength: 78,
        description: `Jupiter stands in a kendra from Moon (Moon house ${moon.house}, Jupiter house ${jupiter.house}). Favors wisdom, reputation, and steady prosperity themes.`,
      });
    }
  }

  // Budhaditya: Sun–Mercury conjunction
  if (sun && mercury && sun.house === mercury.house) {
    yogas.push({
      code: "BUDHADITYA",
      name: "Budhaditya Yoga",
      category: "CAREER",
      strength: 70,
      description: `Sun and Mercury conjunct in house ${sun.house} (${sun.sign}). Supports intellect, communication, and professional clarity.`,
    });
  }

  // Dharma-Karma: 9th & 10th lords associated
  const ninth = placement(lordOf(9));
  const tenth = placement(lordOf(10));
  if (
    ninth &&
    tenth &&
    (ninth.house === tenth.house || (kendra.has(ninth.house) && trikona.has(tenth.house)))
  ) {
    yogas.push({
      code: "DHARMA_KARMA",
      name: "Dharma-Karma Adhipati Yoga",
      category: "CAREER",
      strength: 80,
      description: `9th-lord and 10th-lord themes associate (houses ${ninth.house} & ${tenth.house}). Classic support for purposeful vocation and public standing.`,
    });
  }

  if (jupiter && [1, 4, 5, 7, 9, 10].includes(jupiter.house)) {
    yogas.push({
      code: "GURU_BHAVA",
      name: "Benefic Jupiter placement",
      category: "GENERAL",
      strength: 70,
      description: `Jupiter in house ${jupiter.house} supports growth, counsel, and dharmic expansion.`,
    });
  }
  if (venus && [1, 2, 4, 5, 7, 11].includes(venus.house)) {
    yogas.push({
      code: "VENUS_HARMONY",
      name: "Venus relationship support",
      category: "MARRIAGE",
      strength: 65,
      description: `Venus in house ${venus.house} favors affection, aesthetics, and relational harmony.`,
    });
  }
  if (moon && moon.dignity === "Own") {
    yogas.push({
      code: "MOON_OWN",
      name: "Moon in own sign",
      category: "HEALTH",
      strength: 60,
      description: "Moon in Cancer supports emotional steadiness and nurturing capacity.",
    });
  }
  if (mars && [1, 10].includes(mars.house) && mars.dignity !== "Debilitated") {
    yogas.push({
      code: "RUCHAKA_HINT",
      name: "Ruchaka-like Mars strength",
      category: "CAREER",
      strength: 62,
      description: `Mars in house ${mars.house} (${mars.sign}) shows assertive drive and competitive stamina.`,
    });
  }
  if (lagnaSign) {
    yogas.push({
      code: "LAGNA_SET",
      name: "Ascendant established",
      category: "GENERAL",
      strength: 50,
      description: `Lagna set as ${lagnaSign} — personality and path are read from this rising sign.`,
    });
  }

  // Deduplicate by code
  const seen = new Set<string>();
  return yogas.filter((y) => {
    if (seen.has(y.code)) return false;
    seen.add(y.code);
    return true;
  });
}

export function buildNorthChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const houses: Record<string, ChartPlanetGlyph[]> = {};
  for (let i = 1; i <= 12; i += 1) houses[String(i)] = [];
  for (const p of planets) {
    if (!CLASSICAL.has(p.planet)) continue;
    // Always derive from sign vs Lagna so same-rashi planets stay together
    const houseNo = wholeSignHouse(p.signId, lagnaSignId);
    const bucket = houses[String(houseNo)] ?? (houses[String(houseNo)] = []);
    bucket.push({ ...toPlanetGlyph(p), house: houseNo });
  }
  for (const key of Object.keys(houses)) {
    houses[key]?.sort((a, b) => a.degreeValue - b.degreeValue);
  }
  const deg = Math.floor(lagnaDegree);
  const min = Math.floor((lagnaDegree - deg) * 60);
  return {
    style: "NORTH" as const,
    lagnaSignId,
    lagnaDegree,
    lagnaLabel: `Asc ${deg}°${String(min).padStart(2, "0")}'`,
    houses,
  };
}

export function buildSouthChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const deg = Math.floor(lagnaDegree);
  const min = Math.floor((lagnaDegree - deg) * 60);
  return {
    style: "SOUTH" as const,
    lagnaSignId,
    lagnaDegree,
    lagnaLabel: `Asc ${deg}°${String(min).padStart(2, "0")}'`,
    signs: SIGNS.map((sign, idx) => ({
      sign,
      signId: idx,
      house: wholeSignHouse(idx, lagnaSignId),
      planets: planets
        .filter((p) => p.signId === idx && CLASSICAL.has(p.planet))
        .map((p) => ({ ...toPlanetGlyph(p), house: wholeSignHouse(idx, lagnaSignId) }))
        .sort((a, b) => a.degreeValue - b.degreeValue),
    })),
  };
}

/** East Indian diamond: fixed rashis; house number = count from Lagna sign. */
export function buildEastChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const south = buildSouthChart(planets, lagnaSignId, lagnaDegree);
  return { ...south, style: "EAST" as const };
}
