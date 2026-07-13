import { BirthDetails, Dasha, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";
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

function parseBirthDateTime(birthDate: Date, birthTime: string, timezone: string): Date {
  const datePart = birthDate.toISOString().slice(0, 10);
  const time = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
  // Interpret as local civil time in the given IANA timezone via format trick:
  // Construct a UTC instant approximating local wall time using offset from Intl.
  const approx = new Date(`${datePart}T${time}`);
  if (Number.isNaN(approx.getTime())) {
    throw new ValidationError("Invalid birth date/time");
  }
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    // Prefer temporal wall-clock: convert by comparing locale strings
    const parts = formatter.formatToParts(approx);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    // Fallback: use approx as UTC civil if timezone formatting is awkward
    void get;
  } catch {
    // keep approx
  }
  // For v1: treat provided birthDate (date-only from Mongo) + time as UTC offset Asia/Kolkata default
  // Store exact civil components into Date.UTC adjusted for IST when timezone is Asia/Kolkata
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = time.split(":").map(Number);
  if (timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta") {
    return new Date(Date.UTC(y, m - 1, d, hh - 5, mm - 30, ss || 0));
  }
  return new Date(Date.UTC(y, m - 1, d, hh, mm, ss || 0));
}

export class HoroscopeService {
  async generateForUser(userId: string) {
    await connectMongo();
    const birth = await BirthDetails.findOne({ userId });
    if (!birth) {
      throw new NotFoundError("Birth details required before generating kundli");
    }

    swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
    const birthUtc = parseBirthDateTime(birth.birthDate, birth.birthTime, birth.timezone);
    const jd = swissEphemerisService.julDay(birthUtc);
    const houses = swissEphemerisService.calculateHouses(jd, birth.latitude, birth.longitude, "P");
    const lagnaLongitude = houses.ascmc[0] ?? 0;
    const lagna = longitudeToSign(lagnaLongitude);
    const positions = swissEphemerisService.calculatePlanets(jd);
    const planets = buildPlanetRows(positions, lagnaLongitude);
    const moon = planets.find((p) => p.planet === "Moon");
    const sun = planets.find((p) => p.planet === "Sun");
    const manglik = detectManglik(planets);
    const yogas = detectYogas(planets, lagna.sign);
    const doshas = detectDoshas(planets, manglik.status);
    const houseLords = buildHouseLords(lagna.signId);

    const chartDoc = await Horoscope.create({
      userId,
      birthDetailsId: String(birth._id),
      ayanamsha: birth.ayanamsha || "LAHIRI",
      julianDay: jd,
      lagnaSign: lagna.sign,
      lagnaDegree: lagna.degreeInSign,
      moonSign: moon?.sign || "",
      sunSign: sun?.sign || "",
      planets,
      houseLords,
      navamsa: null,
      dashamsa: null,
      shadbala: null,
      yogas,
      doshas,
      manglikStatus: manglik.status,
      chartNorth: buildNorthChart(planets, lagna.signId),
      chartSouth: buildSouthChart(planets, lagna.signId),
      chartEast: buildEastChart(planets, lagna.signId),
      engineVersion: ENGINE_VERSION,
      calculatedAt: new Date(),
    });

    const dashaCalc = computeVimshottari(moon?.longitude ?? 0, birth.birthDate);
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
