import { BirthDetails, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService, type PlanetKey } from "@/lib/services/swiss-ephemeris";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { buildPlanetRows } from "@/application/horoscope/chart-builder";
import { parseBirthDateTime } from "@/application/horoscope/horoscope.service";
import {
  SIGNS,
  formatDegreeInSign,
  longitudeToNakshatra,
  longitudeToSign,
  wholeSignHouse,
} from "@/application/horoscope/vedic-constants";
import {
  eclipticToHorizontal,
  horizonStatus,
  norm360,
} from "@/application/horoscope/horizon-coordinates";
import type {
  CelestialBody,
  CelestialMode,
  CelestialSnapshot,
} from "@/application/horoscope/celestial-horizon.types";

const PLANET_KEY: Record<string, PlanetKey> = {
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Mercury: "mercury",
  Jupiter: "jupiter",
  Venus: "venus",
  Saturn: "saturn",
  Rahu: "rahu",
  Ketu: "ketu",
};

export type CelestialHorizonInput = {
  mode: CelestialMode;
  at?: Date;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  locationLabel?: string;
  locationSource?: "birth" | "device" | "query";
};

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function assertWhen(date: Date) {
  const y = date.getUTCFullYear();
  if (y < 1800 || y > 2200 || Number.isNaN(date.getTime())) {
    throw new ValidationError("Choose a date between 1800 and 2200.");
  }
}

function toHorizontal(
  siderealLon: number,
  eclipticLat: number,
  ayanamsa: number,
  jd: number,
  latitude: number,
  longitude: number,
) {
  return eclipticToHorizontal({
    tropicalLon: norm360(siderealLon + ayanamsa),
    eclipticLat,
    jd,
    latitude,
    longitude,
  });
}

export async function computeCelestialSnapshot(
  userId: string,
  input: CelestialHorizonInput,
): Promise<CelestialSnapshot> {
  await connectMongo();
  const [birth, natal] = await Promise.all([
    BirthDetails.findOne({ userId }).lean(),
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  const mode = input.mode;
  if (mode === "birth" && !birth) {
    throw new NotFoundError("Complete your birth details to explore your Birth Sky.");
  }

  const lat = typeof input.latitude === "number" ? input.latitude : birth?.latitude;
  const lon = typeof input.longitude === "number" ? input.longitude : birth?.longitude;
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new ValidationError("Choose a location to explore the sky.");
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ValidationError("Location coordinates are out of range.");
  }

  const timezone = input.timezone || birth?.timezone || "Asia/Kolkata";
  let when = input.at ?? new Date();
  if (mode === "birth" && birth) {
    when = parseBirthDateTime(
      new Date(birth.birthDate),
      birth.birthTimeUnknown ? "12:00:00" : birth.birthTime,
      birth.timezone || timezone,
    );
  }
  assertWhen(when);

  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  swissEphemerisService.setAyanamsha("LAHIRI");
  const jd = swissEphemerisService.julDay(when);
  const ayanamsa = swissEphemerisService.getAyanamsa(jd);
  const houses = swissEphemerisService.calculateHouses(jd, lat, lon, "P");
  const lagnaLon = houses.ascmc[0] ?? 0;
  const positions = swissEphemerisService.calculatePlanets(jd);
  const rows = buildPlanetRows(positions, lagnaLon).filter((p) => PLANET_KEY[p.planet]);

  const natalLagnaSignId = natal?.lagnaSign
    ? SIGNS.indexOf(natal.lagnaSign as (typeof SIGNS)[number])
    : -1;
  const natalHouseId = natalLagnaSignId >= 0 ? natalLagnaSignId : null;

  const lagnaHoriz = toHorizontal(lagnaLon, 0, ayanamsa, jd, lat, lon);
  const dscLon = norm360(lagnaLon + 180);
  const dscHoriz = toHorizontal(dscLon, 0, ayanamsa, jd, lat, lon);
  const lagnaSign = longitudeToSign(lagnaLon);
  const lagnaNak = longitudeToNakshatra(lagnaLon);

  const planets: CelestialBody[] = rows.map((p) => {
    const raw = positions[PLANET_KEY[p.planet]!];
    const horiz = toHorizontal(p.longitude, raw?.latitude ?? 0, ayanamsa, jd, lat, lon);
    const status = horizonStatus(
      horiz.altitude,
      horiz.azimuth,
      lagnaHoriz.azimuth,
      dscHoriz.azimuth,
    );
    return {
      planet: p.planet,
      sign: p.sign,
      degreeInSign: formatDegreeInSign(p.longitude),
      longitude: p.longitude,
      nakshatra: p.nakshatra,
      nakshatraPada: p.nakshatraPada,
      houseFromCurrentLagna: p.house,
      houseFromNatalLagna: natalHouseId != null ? wholeSignHouse(p.signId, natalHouseId) : null,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
      altitude: Math.round(horiz.altitude * 10) / 10,
      azimuth: Math.round(horiz.azimuth * 10) / 10,
      aboveHorizon: horiz.altitude > 0,
      status,
    };
  });

  const eclipticPath = Array.from({ length: 37 }, (_, i) => {
    const siderealLongitude = i * 10;
    const horiz = toHorizontal(siderealLongitude, 0, ayanamsa, jd, lat, lon);
    return {
      altitude: Math.round(horiz.altitude * 10) / 10,
      azimuth: Math.round(horiz.azimuth * 10) / 10,
      siderealLongitude,
    };
  });

  const visible = planets.filter((p) => p.altitude > 0);
  const strongestVisible =
    visible.sort((a, b) => b.altitude - a.altitude)[0]?.planet ??
    planets.filter((p) => p.status === "rising" || p.status === "near-rising")[0]?.planet ??
    null;
  const closestToHorizon =
    [...planets].sort((a, b) => Math.abs(a.altitude) - Math.abs(b.altitude))[0]?.planet ?? null;
  const moon = planets.find((p) => p.planet === "Moon");

  const locationSource = input.locationSource
    ? input.locationSource
    : typeof input.latitude === "number"
      ? "query"
      : "birth";

  const birthDay = birth?.birthDate ? new Date(birth.birthDate) : null;
  const birthLabel = birth
    ? `${birth.placeName} · ${birthDay && !Number.isNaN(birthDay.getTime()) ? birthDay.toISOString().slice(0, 10) : ""} ${birth.birthTimeUnknown ? "time unknown" : birth.birthTime}`.trim()
    : "";

  return {
    timestamp: when.toISOString(),
    julianDay: jd,
    mode,
    location: {
      label: input.locationLabel || birth?.placeName || "Selected location",
      timezone,
      latitude: roundCoord(lat),
      longitude: roundCoord(lon),
      source: locationSource,
    },
    ayanamsaDeg: Math.round(ayanamsa * 10000) / 10000,
    engine: "swiss-ephemeris-lahiri",
    ascendant: {
      sign: lagnaSign.sign,
      degreeInSign: formatDegreeInSign(lagnaLon),
      longitude: lagnaLon,
      nakshatra: lagnaNak.nakshatra,
      nakshatraPada: lagnaNak.nakshatraPada,
      altitude: Math.round(lagnaHoriz.altitude * 10) / 10,
      azimuth: Math.round(lagnaHoriz.azimuth * 10) / 10,
    },
    midheaven: (() => {
      const mcLon = houses.ascmc[1];
      if (typeof mcLon !== "number") return null;
      const mcHoriz = toHorizontal(mcLon, 0, ayanamsa, jd, lat, lon);
      const mcSign = longitudeToSign(mcLon);
      const mcNak = longitudeToNakshatra(mcLon);
      return {
        sign: mcSign.sign,
        degreeInSign: formatDegreeInSign(mcLon),
        longitude: mcLon,
        nakshatra: mcNak.nakshatra,
        nakshatraPada: mcNak.nakshatraPada,
        altitude: Math.round(mcHoriz.altitude * 10) / 10,
        azimuth: Math.round(mcHoriz.azimuth * 10) / 10,
      };
    })(),
    descendantAzimuth: Math.round(dscHoriz.azimuth * 10) / 10,
    moonNakshatra: moon?.nakshatra ?? null,
    moonSign: moon?.sign ?? natal?.moonSign ?? null,
    planets,
    eclipticPath,
    natal: natal
      ? {
          lagnaSign: natal.lagnaSign,
          moonSign: natal.moonSign,
          birthLabel,
        }
      : birth
        ? { lagnaSign: lagnaSign.sign, moonSign: moon?.sign ?? null, birthLabel }
        : null,
    snapshot: {
      risingSign: lagnaSign.sign,
      currentNakshatra: lagnaNak.nakshatra,
      closestToHorizon,
      strongestVisible,
      risingPlanets: planets
        .filter((p) => p.status === "rising" || p.status === "near-rising")
        .map((p) => p.planet),
      settingPlanets: planets.filter((p) => p.status === "setting").map((p) => p.planet),
    },
  };
}
