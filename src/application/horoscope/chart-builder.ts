import type { PlanetKey, PlanetPosition } from "@/lib/services/swiss-ephemeris";

import {
  HOUSE_LORDS,
  SIGNS,
  dignityForPlanet,
  houseFromLongitude,
  longitudeToNakshatra,
  longitudeToSign,
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

export function buildPlanetRows(
  positions: Record<PlanetKey, PlanetPosition>,
  lagnaLongitude: number,
): ChartPlanet[] {
  return (Object.keys(positions) as PlanetKey[]).map((key) => {
    const pos = positions[key];
    const sign = longitudeToSign(pos.longitude);
    const nak = longitudeToNakshatra(pos.longitude);
    const name = DISPLAY_NAMES[key];
    return {
      planet: name,
      sign: sign.sign,
      signId: sign.signId,
      house: houseFromLongitude(pos.longitude, lagnaLongitude),
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
    const sign = SIGNS[(lagnaSignId + i) % 12];
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

  const jupiter = planets.find((p) => p.planet === "Jupiter");
  const venus = planets.find((p) => p.planet === "Venus");
  const moon = planets.find((p) => p.planet === "Moon");

  if (jupiter && [1, 4, 5, 7, 9, 10].includes(jupiter.house)) {
    yogas.push({
      code: "GURU_BHAVA",
      name: "Benefic Jupiter placement",
      category: "GENERAL",
      strength: 70,
      description: `Jupiter in house ${jupiter.house} supports growth themes.`,
    });
  }
  if (venus && [1, 2, 4, 5, 7, 11].includes(venus.house)) {
    yogas.push({
      code: "VENUS_HARMONY",
      name: "Venus relationship support",
      category: "MARRIAGE",
      strength: 65,
      description: `Venus in house ${venus.house} favors relational harmony themes.`,
    });
  }
  if (moon && moon.dignity === "Own") {
    yogas.push({
      code: "MOON_OWN",
      name: "Moon in own sign",
      category: "HEALTH",
      strength: 60,
      description: "Moon in Cancer supports emotional steadiness.",
    });
  }
  if (lagnaSign) {
    yogas.push({
      code: "LAGNA_SET",
      name: "Ascendant established",
      category: "GENERAL",
      strength: 50,
      description: `Lagna set as ${lagnaSign}.`,
    });
  }
  return yogas;
}

export function buildNorthChart(planets: ChartPlanet[], lagnaSignId: number) {
  const houses: Record<string, string[]> = {};
  for (let i = 1; i <= 12; i += 1) houses[String(i)] = [];
  for (const p of planets) {
    houses[String(p.house)].push(p.planet);
  }
  return { style: "NORTH", lagnaSignId, houses };
}

export function buildSouthChart(planets: ChartPlanet[], lagnaSignId: number) {
  return {
    style: "SOUTH",
    lagnaSignId,
    signs: SIGNS.map((sign, idx) => ({
      sign,
      signId: idx,
      planets: planets.filter((p) => p.signId === idx).map((p) => p.planet),
    })),
  };
}

export function buildEastChart(planets: ChartPlanet[], lagnaSignId: number) {
  return buildSouthChart(planets, lagnaSignId);
}
