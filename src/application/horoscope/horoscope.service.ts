import { BirthDetails, Dasha, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService, type AyanamshaMode } from "@/lib/services/swiss-ephemeris";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { ENGINE_VERSION, longitudeToNakshatra, longitudeToSign } from "./vedic-constants";
import {
  buildEastChart,
  buildHouseLords,
  buildNorthChart,
  buildPlanetRows,
  buildSouthChart,
  detectDoshas,
  detectManglik,
  detectYogas,
} from "./chart-builder";
import { computeVimshottari, hydrateStoredDasha } from "./dasha-engine";

/**
 * Convert local civil birth date+time in an IANA timezone to a UTC Date.
 * Swiss Ephemeris julday expects UT.
 */
export function parseBirthDateTime(birthDate: Date, birthTime: string, timezone: string): Date {
  const time = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
  const [hhRaw, mmRaw, ssRaw] = time.split(":").map(Number);
  const hour = hhRaw ?? 0;
  const minute = mmRaw ?? 0;
  const second = ssRaw ?? 0;

  // Birth date is stored as a calendar day (UTC midnight of that civil date).
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new ValidationError("Invalid birth date/time");
  }

  const tz = timezone || "Asia/Kolkata";
  const desiredAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    let guess = desiredAsUtcMs;
    for (let i = 0; i < 6; i += 1) {
      const parts = formatter.formatToParts(new Date(guess));
      const get = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((p) => p.type === type)?.value || "0");
      let wallHour = get("hour");
      if (wallHour === 24) wallHour = 0;
      const asIfUtc = Date.UTC(
        get("year"),
        get("month") - 1,
        get("day"),
        wallHour,
        get("minute"),
        get("second"),
      );
      const diff = desiredAsUtcMs - asIfUtc;
      guess += diff;
      if (Math.abs(diff) < 500) break;
    }
    return new Date(guess);
  } catch {
    // Fallback IST if Intl timezone fails
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
      return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, second));
    }
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }
}

function resolveAyanamsha(raw?: string | null): AyanamshaMode {
  const key = (raw || "LAHIRI").toUpperCase().replace(/\s+/g, "_");
  if (key === "RAMAN") return "RAMAN";
  if (key === "KRISHNAMURTI" || key === "KP") return "KRISHNAMURTI";
  if (key === "FAGAN_BRADLEY" || key === "FAGAN") return "FAGAN_BRADLEY";
  return "LAHIRI";
}

export type NatalComputeInput = {
  birthDate: Date;
  birthTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
  ayanamsha?: string | null;
};

export class HoroscopeService {
  computeNatal(input: NatalComputeInput) {
    swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
    const ayanamsha = resolveAyanamsha(input.ayanamsha);
    swissEphemerisService.setAyanamsha(ayanamsha);

    const birthUtc = parseBirthDateTime(input.birthDate, input.birthTime, input.timezone);
    const jd = swissEphemerisService.julDay(birthUtc);
    const ayanamsaDeg = swissEphemerisService.getAyanamsa(jd);

    // Whole-sign rasi charts in Vedic apps still need accurate sidereal ASC;
    // Placidus ASC longitude is standard for Lagna degree (AstroSage-compatible).
    const houses = swissEphemerisService.calculateHouses(jd, input.latitude, input.longitude, "P");
    const lagnaLongitude = houses.ascmc[0] ?? 0;
    const lagna = longitudeToSign(lagnaLongitude);
    const lagnaNak = longitudeToNakshatra(lagnaLongitude);
    const positions = swissEphemerisService.calculatePlanets(jd);
    const planets = buildPlanetRows(positions, lagnaLongitude);
    const moon = planets.find((p) => p.planet === "Moon");
    const sun = planets.find((p) => p.planet === "Sun");
    const manglik = detectManglik(planets);
    const yogas = detectYogas(planets, lagna.sign ?? "Aries");
    const doshas = detectDoshas(planets, manglik.status);
    const houseLords = buildHouseLords(lagna.signId);
    const dasha = computeVimshottari(moon?.longitude ?? 0, birthUtc);
    const moonNak = moon ? longitudeToNakshatra(moon.longitude) : null;

    return {
      ayanamsha,
      julianDay: jd,
      ayanamsaDeg,
      lagnaLongitude,
      lagnaSign: lagna.sign,
      lagnaDegree: lagna.degreeInSign,
      lagnaNakshatra: lagnaNak.nakshatra,
      lagnaNakshatraPada: lagnaNak.nakshatraPada,
      moonSign: moon?.sign || "",
      sunSign: sun?.sign || "",
      moonNakshatra: moonNak?.nakshatra || null,
      planets,
      houseLords,
      yogas,
      doshas,
      manglikStatus: manglik.status,
      manglikNote: manglik.notes,
      chartNorth: buildNorthChart(planets, lagna.signId, lagna.degreeInSign),
      chartSouth: buildSouthChart(planets, lagna.signId, lagna.degreeInSign),
      chartEast: buildEastChart(planets, lagna.signId, lagna.degreeInSign),
      dasha,
      birthUtc,
    };
  }

  async generateForUser(userId: string) {
    await connectMongo();
    const birth = await BirthDetails.findOne({ userId });
    if (!birth) {
      throw new NotFoundError("Birth details required before generating kundli");
    }

    const natal = this.computeNatal({
      birthDate: birth.birthDate,
      birthTime: birth.birthTime,
      timezone: birth.timezone,
      latitude: birth.latitude,
      longitude: birth.longitude,
      ayanamsha: birth.ayanamsha,
    });

    const chartDoc = await Horoscope.create({
      userId,
      birthDetailsId: String(birth._id),
      ayanamsha: natal.ayanamsha,
      julianDay: natal.julianDay,
      lagnaSign: natal.lagnaSign,
      lagnaDegree: natal.lagnaDegree,
      lagnaNakshatra: natal.lagnaNakshatra,
      lagnaNakshatraPada: natal.lagnaNakshatraPada,
      moonSign: natal.moonSign,
      sunSign: natal.sunSign,
      planets: natal.planets,
      houseLords: natal.houseLords,
      navamsa: null,
      dashamsa: null,
      shadbala: { ayanamsaDeg: natal.ayanamsaDeg, lagnaLongitude: natal.lagnaLongitude },
      yogas: natal.yogas,
      doshas: natal.doshas,
      manglikStatus: natal.manglikStatus,
      chartNorth: natal.chartNorth,
      chartSouth: natal.chartSouth,
      chartEast: natal.chartEast,
      engineVersion: ENGINE_VERSION,
      calculatedAt: new Date(),
    });

    const dashaDoc = await Dasha.create({
      userId,
      horoscopeId: String(chartDoc._id),
      system: "VIMSHOTTARI",
      balanceAtBirth: natal.dasha.balanceAtBirth,
      periods: natal.dasha.periods,
      currentMaha: natal.dasha.currentMaha,
      currentAntar: natal.dasha.currentAntar,
      engineVersion: ENGINE_VERSION,
      calculatedAt: new Date(),
    });

    return {
      horoscope: chartDoc.toObject(),
      dasha: dashaDoc.toObject(),
      manglikNote: natal.manglikNote,
      meta: {
        zodiac: "sidereal",
        ayanamsha: natal.ayanamsha,
        ayanamsaDeg: natal.ayanamsaDeg,
        birthUtc: natal.birthUtc.toISOString(),
        engineVersion: ENGINE_VERSION,
      },
    };
  }

  async getLatest(userId: string) {
    await connectMongo();
    const horoscope = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!horoscope) return null;
    const dasha = await Dasha.findOne({ horoscopeId: String(horoscope._id) })
      .sort({ calculatedAt: -1 })
      .lean();
    return { horoscope, dasha: dasha ? hydrateStoredDasha(dasha) : dasha };
  }
}

export const horoscopeService = new HoroscopeService();
