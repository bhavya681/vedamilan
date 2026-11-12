import { ChartPlanet } from "./chart-builder";
import { SIGNS } from "./vedic-constants";

export type AspectType = "conjunction" | "opposition" | "trine" | "square" | "sextile" | "special";

export type PlanetaryAspect = {
  fromPlanet: string;
  toPlanet: string;
  fromHouse: number;
  toHouse: number;
  aspectType: AspectType;
  isApplying: boolean;
  degrees: number;
};

/**
 * Parashari Graha Drishti (Planetary Aspects)
 * Based on Brihat Parashara Hora Shastra
 * 
 * All planets aspect the 7th house (180°) - Opposition
 * Special aspects:
 * - Mars: 4th (90°) and 8th (210°) houses
 * - Jupiter: 5th (120°) and 9th (240°) houses  
 * - Saturn: 3rd (60°) and 10th (270°) houses
 * - Rahu/Ketu: 5th (120°) and 9th (240°) houses (some traditions)
 */

const SPECIAL_ASPECTS: Record<string, number[]> = {
  Mars: [4, 8], // 4th and 8th from the planet
  Jupiter: [5, 9], // 5th and 9th from the planet
  Saturn: [3, 10], // 3rd and 10th from the planet
  Rahu: [5, 9],
  Ketu: [5, 9],
};

export function getParashariAspects(fromPlanet: string): number[] {
  const base = [7]; // All planets aspect 7th house
  const special = SPECIAL_ASPECTS[fromPlanet] || [];
  return [...base, ...special];
}

export function doesPlanetAspectHouse(
  planet: string,
  fromHouse: number,
  targetHouse: number
): boolean {
  const aspects = getParashariAspects(planet);
  const diff = ((targetHouse - fromHouse + 12) % 12) + 1; // 1-indexed house offset
  return aspects.includes(diff);
}

export function getMutualAspect(planet1: string, planet2: string, house1: number, house2: number): boolean {
  return (
    doesPlanetAspectHouse(planet1, house1, house2) &&
    doesPlanetAspectHouse(planet2, house2, house1)
  );
}

export function isConjunct(p1: ChartPlanet, p2: ChartPlanet): boolean {
  return p1.house === p2.house;
}

export function isExchange(p1: ChartPlanet, p2: ChartPlanet, lagnaSignId: number, houseLords: Record<string, string>): boolean {
  // Parivartana Yoga - exchange of houses between two planets
  // Planet A is in the sign ruled by Planet B, and Planet B is in the sign ruled by Planet A
  const sign1 = SIGNS[p1.signId];
  const sign2 = SIGNS[p2.signId];
  if (!sign1 || !sign2) return false;
  const lordOfP1Sign = houseLords[sign1];
  const lordOfP2Sign = houseLords[sign2];
  if (!lordOfP1Sign || !lordOfP2Sign) return false;
  
  return lordOfP1Sign === p2.planet && lordOfP2Sign === p1.planet;
}

/**
 * Check if two planets are in Kendra (angular) relationship
 * Kendra houses: 1, 4, 7, 10
 */
export function isKendraHouse(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

/**
 * Check if two planets are in Trikona (trinal) relationship  
 * Trikona houses: 1, 5, 9
 */
export function isTrikonaHouse(house: number): boolean {
  return [1, 5, 9].includes(house);
}

/**
 * Check Kendra-Trikona relationship between two planets
 * One planet in Kendra, other in Trikona from each other
 * OR both in Kendra OR both in Trikona
 */
export function hasKendraTrikonaRelationship(house1: number, house2: number): boolean {
  const k1 = isKendraHouse(house1);
  const k2 = isKendraHouse(house2);
  const t1 = isTrikonaHouse(house1);
  const t2 = isTrikonaHouse(house2);
  
  return (k1 && t2) || (k2 && t1) || (k1 && k2) || (t1 && t2);
}

/**
 * Get the house relationship between two planets
 * Returns the angular distance in houses
 */
export function getHouseDistance(house1: number, house2: number): number {
  return ((house2 - house1 + 12) % 12) || 12;
}

/**
 * Check if planet is retrograde
 */
export function isRetrograde(planet: ChartPlanet): boolean {
  return planet.isRetrograde;
}

/**
 * Check if planet is combust (within specific degrees of Sun)
 * Traditional combustion degrees:
 * - Moon: 12°
 * - Mars: 17°
 * - Mercury: 14° (12° when retrograde)
 * - Jupiter: 11°
 * - Venus: 10° (8° when retrograde)
 * - Saturn: 15°
 */
export function isCombust(planet: ChartPlanet, sun: ChartPlanet | undefined): boolean {
  if (!sun || planet.planet === "Sun") return false;
  
  const combustionDegrees: Record<string, number> = {
    Moon: 12,
    Mars: 17,
    Mercury: 14,
    Jupiter: 11,
    Venus: 10,
    Saturn: 15,
  };
  
  const limit = combustionDegrees[planet.planet];
  if (!limit) return false;
  
  const distance = Math.abs(planet.longitude - sun.longitude);
  const angularDist = distance > 180 ? 360 - distance : distance;
  
  // Adjust for retrograde Mercury and Venus
  if ((planet.planet === "Mercury" || planet.planet === "Venus") && planet.isRetrograde) {
    return angularDist <= (limit - 2);
  }
  
  return angularDist <= limit;
}

/**
 * Get exaltation sign for a planet
 */
export function getExaltationSign(planet: string): string | null {
  const exaltation: Record<string, string> = {
    Sun: "Aries",
    Moon: "Taurus",
    Mars: "Capricorn",
    Mercury: "Virgo",
    Jupiter: "Cancer",
    Venus: "Pisces",
    Saturn: "Libra",
  };
  return exaltation[planet] || null;
}

/**
 * Get debilitation sign for a planet
 */
export function getDebilitationSign(planet: string): string | null {
  const debilitation: Record<string, string> = {
    Sun: "Libra",
    Moon: "Scorpio",
    Mars: "Cancer",
    Mercury: "Pisces",
    Jupiter: "Capricorn",
    Venus: "Virgo",
    Saturn: "Aries",
  };
  return debilitation[planet] || null;
}

/**
 * Check if a planet is in its exaltation sign
 */
export function isExalted(planet: ChartPlanet): boolean {
  const exaltSign = getExaltationSign(planet.planet);
  return exaltSign === planet.sign;
}

/**
 * Check if a planet is in its debilitation sign
 */
export function isDebilitated(planet: ChartPlanet): boolean {
  const debilSign = getDebilitationSign(planet.planet);
  return debilSign === planet.sign;
}

/**
 * Check if a planet is in its own sign
 */
export function isInOwnSign(planet: ChartPlanet): boolean {
  const ownSigns: Record<string, string[]> = {
    Sun: ["Leo"],
    Moon: ["Cancer"],
    Mars: ["Aries", "Scorpio"],
    Mercury: ["Gemini", "Virgo"],
    Jupiter: ["Sagittarius", "Pisces"],
    Venus: ["Taurus", "Libra"],
    Saturn: ["Capricorn", "Aquarius"],
  };
  return ownSigns[planet.planet]?.includes(planet.sign) || false;
}

/**
 * Check if a planet is in a friendly sign
 */
export function isInFriendlySign(planet: ChartPlanet): boolean {
  const friendlySigns: Record<string, string[]> = {
    Sun: ["Aries", "Leo", "Sagittarius", "Scorpio"],
    Moon: ["Taurus", "Cancer", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Pisces"],
    Mars: ["Aries", "Scorpio", "Capricorn", "Leo", "Sagittarius", "Pisces"],
    Mercury: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
    Jupiter: ["Sagittarius", "Pisces", "Cancer", "Aries", "Leo", "Scorpio"],
    Venus: ["Taurus", "Libra", "Pisces", "Gemini", "Virgo", "Capricorn", "Aquarius"],
    Saturn: ["Capricorn", "Aquarius", "Libra", "Gemini", "Virgo", "Taurus"],
  };
  return friendlySigns[planet.planet]?.includes(planet.sign) || false;
}

/**
 * Check if a planet is in an enemy sign
 */
export function isInEnemySign(planet: ChartPlanet): boolean {
  const enemySigns: Record<string, string[]> = {
    Sun: ["Libra", "Aquarius", "Gemini", "Taurus"],
    Moon: [], // Moon has no enemies
    Mars: ["Gemini", "Virgo", "Libra", "Taurus"],
    Mercury: ["Cancer", "Leo", "Scorpio", "Pisces"],
    Jupiter: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
    Venus: ["Aries", "Scorpio", "Leo", "Sagittarius", "Cancer"],
    Saturn: ["Aries", "Leo", "Scorpio", "Sagittarius", "Pisces", "Cancer"],
  };
  return enemySigns[planet.planet]?.includes(planet.sign) || false;
}

/**
 * Get house position from Moon's perspective
 */
export function getHouseFromMoon(planetHouse: number, moonHouse: number): number {
  return ((planetHouse - moonHouse + 12) % 12) + 1;
}