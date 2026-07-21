import { BirthDetails, Dasha, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService, type AyanamshaMode } from "@/lib/services/swiss-ephemeris";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { ENGINE_VERSION, longitudeToSign } from "./vedic-constants";
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
import { computeVimshottari } from "./dasha-engine";

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

export class HoroscopeService {
  async generateForUser(userId: string) {
    await connectMongo();
    const birth = await BirthDetails.findOne({ userId });
    if (!birth) {
      throw new NotFoundError("Birth details required before generating kundli");
    }

    swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
    const ayanamsha = resolveAyanamsha(birth.ayanamsha);
    swissEphemerisService.setAyanamsha(ayanamsha);

    const birthUtc = parseBirthDateTime(birth.birthDate, birth.birthTime, birth.timezone);
    const jd = swissEphemerisService.julDay(birthUtc);
    const ayanamsaDeg = swissEphemerisService.getAyanamsa(jd);

    // Whole-sign rasi charts in Vedic apps still need accurate sidereal ASC;
    // Placidus ASC longitude is standard for Lagna degree (AstroSage-compatible).
    const houses = swissEphemerisService.calculateHouses(jd, birth.latitude, birth.longitude, "P");
    const lagnaLongitude = houses.ascmc[0] ?? 0;
    const lagna = longitudeToSign(lagnaLongitude);
    const positions = swissEphemerisService.calculatePlanets(jd);
    const planets = buildPlanetRows(positions, lagnaLongitude);
    const moon = planets.find((p) => p.planet === "Moon");
    const sun = planets.find((p) => p.planet === "Sun");
    const manglik = detectManglik(planets);
    const yogas = detectYogas(planets, lagna.sign ?? "Aries");
    const doshas = detectDoshas(planets, manglik.status);
    const houseLords = buildHouseLords(lagna.signId);

    const chartDoc = await Horoscope.create({
      userId,
      birthDetailsId: String(birth._id),
      ayanamsha,
      julianDay: jd,
      lagnaSign: lagna.sign,
      lagnaDegree: lagna.degreeInSign,
      moonSign: moon?.sign || "",
      sunSign: sun?.sign || "",
      planets,
      houseLords,
      navamsa: null,
      dashamsa: null,
      shadbala: { ayanamsaDeg },
      yogas,
      doshas,
      manglikStatus: manglik.status,
      chartNorth: buildNorthChart(planets, lagna.signId),
      chartSouth: buildSouthChart(planets, lagna.signId),
      chartEast: buildEastChart(planets, lagna.signId),
      engineVersion: ENGINE_VERSION,
      calculatedAt: new Date(),
    });

    const dashaCalc = computeVimshottari(moon?.longitude ?? 0, birthUtc);
    const dashaDoc = await Dasha.create({
      userId,
      horoscopeId: String(chartDoc._id),
      system: "VIMSHOTTARI",
      balanceAtBirth: dashaCalc.balanceAtBirth,
      periods: dashaCalc.periods,
      currentMaha: dashaCalc.currentMaha,
      currentAntar: dashaCalc.currentAntar,
      engineVersion: ENGINE_VERSION,
      calculatedAt: new Date(),
    });

    return {
      horoscope: chartDoc.toObject(),
      dasha: dashaDoc.toObject(),
      manglikNote: manglik.notes,
      meta: {
        zodiac: "sidereal",
        ayanamsha,
        ayanamsaDeg,
        birthUtc: birthUtc.toISOString(),
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
    return { horoscope, dasha };
  }
}

export const horoscopeService = new HoroscopeService();
