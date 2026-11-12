import { describe, expect, it } from "vitest";
import {
  doesPlanetAspectHouse,
  getMutualAspect,
  isConjunct,
  isRetrograde,
  isCombust,
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInFriendlySign,
  isInEnemySign,
  getExaltationSign,
  getDebilitationSign,
  hasKendraTrikonaRelationship,
  isKendraHouse,
  isTrikonaHouse,
  getHouseFromMoon,
} from "@/application/horoscope/planetary-aspects";
import { ChartPlanet } from "@/application/horoscope/chart-builder";

describe("planetary aspects", () => {
  it("identifies kendra houses correctly", () => {
    expect(isKendraHouse(1)).toBe(true);
    expect(isKendraHouse(4)).toBe(true);
    expect(isKendraHouse(7)).toBe(true);
    expect(isKendraHouse(10)).toBe(true);
    expect(isKendraHouse(2)).toBe(false);
    expect(isKendraHouse(5)).toBe(false);
  });

  it("identifies trikona houses correctly", () => {
    expect(isTrikonaHouse(1)).toBe(true);
    expect(isTrikonaHouse(5)).toBe(true);
    expect(isTrikonaHouse(9)).toBe(true);
    expect(isTrikonaHouse(2)).toBe(false);
    expect(isTrikonaHouse(4)).toBe(false);
  });

  it("checks kendra-trikona relationship", () => {
    expect(hasKendraTrikonaRelationship(1, 5)).toBe(true); // Kendra + Trikona
    expect(hasKendraTrikonaRelationship(4, 9)).toBe(true); // Kendra + Trikona
    expect(hasKendraTrikonaRelationship(1, 4)).toBe(true); // Both Kendra
    expect(hasKendraTrikonaRelationship(5, 9)).toBe(true); // Both Trikona
    expect(hasKendraTrikonaRelationship(2, 3)).toBe(false); // Neither
  });

  it("calculates house from Moon correctly", () => {
    // Moon in house 4, planet in house 7 = 4th from Moon
    expect(getHouseFromMoon(7, 4)).toBe(4);
    // Moon in house 10, planet in house 1 = 4th from Moon
    expect(getHouseFromMoon(1, 10)).toBe(4);
    // Moon in house 1, planet in house 10 = 10th from Moon
    expect(getHouseFromMoon(10, 1)).toBe(10);
  });

  it("detects conjunction correctly", () => {
    const p1: ChartPlanet = { house: 5, planet: "Jupiter", sign: "Cancer", signId: 3, longitude: 100, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Pushya", nakshatraPada: 1, dignity: "Own" };
    const p2: ChartPlanet = { house: 5, planet: "Moon", sign: "Cancer", signId: 3, longitude: 105, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Pushya", nakshatraPada: 2, dignity: "Own" };
    const p3: ChartPlanet = { house: 3, planet: "Mars", sign: "Aries", signId: 0, longitude: 10, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Own" };
    
    expect(isConjunct(p1, p2)).toBe(true);
    expect(isConjunct(p1, p3)).toBe(false);
  });

  it("detects Parashari aspects correctly", () => {
    // All planets aspect 7th house
    expect(doesPlanetAspectHouse("Jupiter", 1, 7)).toBe(true);
    expect(doesPlanetAspectHouse("Mars", 1, 7)).toBe(true);
    expect(doesPlanetAspectHouse("Saturn", 1, 7)).toBe(true);
    
    // Mars aspects 4th and 8th
    expect(doesPlanetAspectHouse("Mars", 1, 4)).toBe(true);
    expect(doesPlanetAspectHouse("Mars", 1, 8)).toBe(true);
    expect(doesPlanetAspectHouse("Mars", 1, 5)).toBe(false);
    
    // Jupiter aspects 5th and 9th
    expect(doesPlanetAspectHouse("Jupiter", 1, 5)).toBe(true);
    expect(doesPlanetAspectHouse("Jupiter", 1, 9)).toBe(true);
    
    // Saturn aspects 3rd and 10th
    expect(doesPlanetAspectHouse("Saturn", 1, 3)).toBe(true);
    expect(doesPlanetAspectHouse("Saturn", 1, 10)).toBe(true);
  });

  it("detects mutual aspect", () => {
    // Jupiter in 1, Mars in 7 - both aspect each other (7th aspect)
    expect(getMutualAspect("Jupiter", "Mars", 1, 7)).toBe(true);
    
    // Jupiter in 1, Mars in 5 - Jupiter aspects 5th, Mars doesn't aspect 9th from 5
    expect(getMutualAspect("Jupiter", "Mars", 1, 5)).toBe(false);
  });

  it("identifies exaltation signs", () => {
    expect(getExaltationSign("Sun")).toBe("Aries");
    expect(getExaltationSign("Moon")).toBe("Taurus");
    expect(getExaltationSign("Mars")).toBe("Capricorn");
    expect(getExaltationSign("Mercury")).toBe("Virgo");
    expect(getExaltationSign("Jupiter")).toBe("Cancer");
    expect(getExaltationSign("Venus")).toBe("Pisces");
    expect(getExaltationSign("Saturn")).toBe("Libra");
  });

  it("identifies debilitation signs", () => {
    expect(getDebilitationSign("Sun")).toBe("Libra");
    expect(getDebilitationSign("Moon")).toBe("Scorpio");
    expect(getDebilitationSign("Mars")).toBe("Cancer");
    expect(getDebilitationSign("Mercury")).toBe("Pisces");
    expect(getDebilitationSign("Jupiter")).toBe("Capricorn");
    expect(getDebilitationSign("Venus")).toBe("Virgo");
    expect(getDebilitationSign("Saturn")).toBe("Aries");
  });

  it("checks planet dignity correctly", () => {
    const exaltedSun: ChartPlanet = { planet: "Sun", sign: "Aries", signId: 0, house: 1, longitude: 10, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Exalted" };
    const debilitatedSun: ChartPlanet = { planet: "Sun", sign: "Libra", signId: 6, house: 7, longitude: 190, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Swati", nakshatraPada: 1, dignity: "Debilitated" };
    const ownSignMars: ChartPlanet = { planet: "Mars", sign: "Aries", signId: 0, house: 1, longitude: 10, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Own" };
    const friendlyMoon: ChartPlanet = { planet: "Moon", sign: "Taurus", signId: 1, house: 2, longitude: 33, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Rohini", nakshatraPada: 1, dignity: "Exalted" };
    const enemySaturn: ChartPlanet = { planet: "Saturn", sign: "Aries", signId: 0, house: 1, longitude: 10, latitude: 0, speed: 0, isRetrograde: false, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Debilitated" };
    
    expect(isExalted(exaltedSun)).toBe(true);
    expect(isDebilitated(debilitatedSun)).toBe(true);
    expect(isInOwnSign(ownSignMars)).toBe(true);
    expect(isInFriendlySign(friendlyMoon)).toBe(true);
    expect(isInEnemySign(enemySaturn)).toBe(true);
  });

  it("checks retrograde status", () => {
    const retroPlanet: ChartPlanet = { planet: "Mars", sign: "Aries", signId: 0, house: 1, longitude: 10, latitude: 0, speed: -0.5, isRetrograde: true, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Own" };
    const directPlanet: ChartPlanet = { planet: "Mars", sign: "Aries", signId: 0, house: 1, longitude: 10, latitude: 0, speed: 0.5, isRetrograde: false, nakshatra: "Ashwini", nakshatraPada: 1, dignity: "Own" };
    
    expect(isRetrograde(retroPlanet)).toBe(true);
    expect(isRetrograde(directPlanet)).toBe(false);
  });

  it("checks combustion", () => {
    const sun: ChartPlanet = { planet: "Sun", sign: "Cancer", signId: 3, house: 4, longitude: 100, latitude: 0, speed: 1, isRetrograde: false, nakshatra: "Pushya", nakshatraPada: 1, dignity: "Neutral" };
    const combustMercury: ChartPlanet = { planet: "Mercury", sign: "Cancer", signId: 3, house: 4, longitude: 105, latitude: 0, speed: 1, isRetrograde: false, nakshatra: "Pushya", nakshatraPada: 2, dignity: "Neutral" };
    const notCombustMercury: ChartPlanet = { planet: "Mercury", sign: "Leo", signId: 4, house: 5, longitude: 130, latitude: 0, speed: 1, isRetrograde: false, nakshatra: "Magha", nakshatraPada: 1, dignity: "Neutral" };
    
    expect(isCombust(combustMercury, sun)).toBe(true);
    expect(isCombust(notCombustMercury, sun)).toBe(false);
  });
});

describe("yoga filters", () => {
  it("detects raja-style yogas", async () => {
    const { isRajaStyleYoga } = await import("@/application/horoscope/yoga-filters");
    expect(isRajaStyleYoga({ name: "Raja Yoga", code: "RAJA_YOGA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Gajakesari Yoga", code: "GAJAKESARI" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Dharma-Karmadhipati Yoga", code: "DHARMA_KARMADHIPATI" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Neecha Bhanga Raja Yoga", code: "NEECHA_BHANGA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Harsha Yoga", code: "HARSHA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Ruchaka Yoga", code: "RUCHAKA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Dhana Yoga", code: "DHANA_YOGA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Kemadruma", code: "KEMADRUMA" })).toBe(false);
  });

  it("partitions raja vs other", async () => {
    const { partitionYogas } = await import("@/application/horoscope/yoga-filters");
    const { rajaYogas, otherYogas } = partitionYogas([
      { name: "Raja Yoga", code: "RAJA_YOGA" },
      { name: "Gajakesari", code: "GAJAKESARI" },
      { name: "Other", code: "OTHER" },
    ]);
    expect(rajaYogas).toHaveLength(2);
    expect(otherYogas).toHaveLength(1);
  });
});