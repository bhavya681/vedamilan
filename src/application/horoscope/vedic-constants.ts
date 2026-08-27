export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

/** Vimshottari lords in order starting from Ketu for Ashwini */
export const VIMSHOTTARI_LORDS = [
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

export const VIMSHOTTARI_YEARS: Record<(typeof VIMSHOTTARI_LORDS)[number], number> = {
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

export const HOUSE_LORDS: Record<(typeof SIGNS)[number], string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

export const ENGINE_VERSION = "vedamilan-horoscope-1.2.0-sidereal-lahiri-lagna-nak";

export function longitudeToSign(longitude: number) {
  const norm = ((longitude % 360) + 360) % 360;
  const signId = Math.min(11, Math.max(0, Math.floor(norm / 30)));
  const degreeInSign = norm % 30;
  return {
    sign: SIGNS[signId] ?? "Aries",
    signId,
    degreeInSign,
    longitude: norm,
  };
}

export function longitudeToNakshatra(longitude: number) {
  const norm = ((longitude % 360) + 360) % 360;
  const span = 360 / 27;
  const index = Math.min(26, Math.max(0, Math.floor(norm / span)));
  const within = norm % span;
  const pada = Math.floor(within / (span / 4)) + 1;
  return {
    nakshatra: NAKSHATRAS[index] ?? "Ashwini",
    nakshatraIndex: index,
    nakshatraPada: Math.min(4, Math.max(1, pada)) as 1 | 2 | 3 | 4,
  };
}

/** Vimshottari lord of a named nakshatra (Ashwini = Ketu). */
export function nakshatraLord(nakshatra: string): (typeof VIMSHOTTARI_LORDS)[number] {
  const index = NAKSHATRAS.indexOf(nakshatra as (typeof NAKSHATRAS)[number]);
  const safe = index >= 0 ? index : 0;
  return VIMSHOTTARI_LORDS[safe % 9] ?? "Ketu";
}

/** Shortest arc in degrees between two longitudes (0–180). */
export function angularDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/**
 * Classical exaltation longitudes (sidereal, start of Aries = 0).
 * Sun 10° Ari, Moon 3° Tau, Mars 28° Cap, Mercury 15° Vir,
 * Jupiter 5° Can, Venus 27° Pis, Saturn 20° Lib.
 */
export const EXALTATION_LONGITUDE: Record<string, number> = {
  Sun: 10,
  Moon: 33,
  Mars: 298,
  Mercury: 165,
  Jupiter: 95,
  Venus: 357,
  Saturn: 200,
};

/** Dig Bala peak house from lagna (BPHS): Su/Ma 10, Mo/Ve 4, Me/Ju 1, Sa 7. */
export const DIG_POWER_HOUSE: Record<string, number> = {
  Sun: 10,
  Moon: 4,
  Mars: 10,
  Mercury: 1,
  Jupiter: 1,
  Venus: 4,
  Saturn: 7,
};

/** Uchcha Bala 0–60 from natal longitude vs the exaltation degree. */
export function uchchaVirupas(planet: string, longitude: number): number {
  const exalt = EXALTATION_LONGITUDE[planet];
  if (exalt == null) return 30;
  const dist = angularDistance(longitude, exalt);
  return Math.max(0, Math.min(60, 60 * (1 - dist / 180)));
}

/** Equal-house bhava from exact Lagna degree (Chalit-style span). */
export function houseFromLongitude(longitude: number, lagnaLongitude: number): number {
  const norm = (longitude - lagnaLongitude + 360) % 360;
  return Math.floor(norm / 30) + 1;
}

/**
 * Whole-sign house (Rasi / AstroSage D1): every planet in a rashi shares one house from Lagna.
 * House 1 = Lagna sign; House 2 = next sign, etc.
 */
export function wholeSignHouse(planetSignId: number, lagnaSignId: number): number {
  const p = ((planetSignId % 12) + 12) % 12;
  const l = ((lagnaSignId % 12) + 12) % 12;
  return ((p - l + 12) % 12) + 1;
}

export function dignityForPlanet(planet: string, sign: string): string {
  const exaltation: Record<string, string> = {
    Sun: "Aries",
    Moon: "Taurus",
    Mars: "Capricorn",
    Mercury: "Virgo",
    Jupiter: "Cancer",
    Venus: "Pisces",
    Saturn: "Libra",
  };
  const debilitation: Record<string, string> = {
    Sun: "Libra",
    Moon: "Scorpio",
    Mars: "Cancer",
    Mercury: "Pisces",
    Jupiter: "Capricorn",
    Venus: "Virgo",
    Saturn: "Aries",
  };
  const own: Record<string, string[]> = {
    Sun: ["Leo"],
    Moon: ["Cancer"],
    Mars: ["Aries", "Scorpio"],
    Mercury: ["Gemini", "Virgo"],
    Jupiter: ["Sagittarius", "Pisces"],
    Venus: ["Taurus", "Libra"],
    Saturn: ["Capricorn", "Aquarius"],
  };
  if (exaltation[planet] === sign) return "Exalted";
  if (debilitation[planet] === sign) return "Debilitated";
  if (own[planet]?.includes(sign)) return "Own";
  return "Neutral";
}

/** AstroSage-style dignity mark: Ucch ↑ · Neech ↓ · Own ◉ */
export function dignityMark(dignity: string | null | undefined): string {
  if (dignity === "Exalted") return "↑";
  if (dignity === "Debilitated") return "↓";
  if (dignity === "Own") return "◉";
  return "";
}

export function formatDegreeInSign(longitude: number): string {
  const deg = ((longitude % 360) + 360) % 360;
  const inSign = deg % 30;
  const d = Math.floor(inSign);
  const m = Math.floor((inSign - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
}
