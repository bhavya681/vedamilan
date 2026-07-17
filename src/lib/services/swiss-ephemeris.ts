/**
 * Server-only Swiss Ephemeris wrapper.
 * Do not import this module from Client Components.
 */
import sweph from "sweph";

import { AppError } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "rahu"
  | "ketu";

export type PlanetPosition = {
  longitude: number;
  latitude: number;
  distance: number;
  speedLongitude: number;
};

export type HouseSystemResult = {
  cusps: number[];
  ascmc: number[];
};

const PLANET_BODIES: Record<Exclude<PlanetKey, "ketu">, number> = {
  sun: sweph.constants.SE_SUN,
  moon: sweph.constants.SE_MOON,
  mercury: sweph.constants.SE_MERCURY,
  venus: sweph.constants.SE_VENUS,
  mars: sweph.constants.SE_MARS,
  jupiter: sweph.constants.SE_JUPITER,
  saturn: sweph.constants.SE_SATURN,
  uranus: sweph.constants.SE_URANUS,
  neptune: sweph.constants.SE_NEPTUNE,
  pluto: sweph.constants.SE_PLUTO,
  rahu: sweph.constants.SE_TRUE_NODE,
};

export class SwissEphemerisService {
  private initialized = false;

  initialize(ephePath?: string): void {
    if (this.initialized) return;

    try {
      const path = ephePath || process.env.SWISS_EPHEMERIS_PATH || "./ephe";
      sweph.set_ephe_path(path);
      this.initialized = true;
      logger.info({ path }, "Swiss Ephemeris initialized");
    } catch (error) {
      throw new AppError(
        "SWISS_EPHEMERIS_INIT_FAILED",
        "Failed to initialize Swiss Ephemeris",
        500,
        error,
      );
    }
  }

  julDay(date: Date, calendar: "g" | "j" = "g"): number {
    this.ensureInitialized();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600 +
      date.getUTCMilliseconds() / 3_600_000;

    const flag = calendar === "g" ? sweph.constants.SE_GREG_CAL : sweph.constants.SE_JUL_CAL;
    return sweph.julday(year, month, day, hour, flag);
  }

  calculatePlanets(jd: number): Record<PlanetKey, PlanetPosition> {
    this.ensureInitialized();
    // Prefer Swiss Ephemeris files; fall back to built-in Moshier (no ephe pack required).
    const preferred = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;
    const fallback = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED;
    const result = {} as Record<PlanetKey, PlanetPosition>;

    (Object.keys(PLANET_BODIES) as Array<Exclude<PlanetKey, "ketu">>).forEach((key) => {
      const body = PLANET_BODIES[key];
      let calc = sweph.calc_ut(jd, body, preferred);
      if (calc.flag < 0) {
        calc = sweph.calc_ut(jd, body, fallback);
      }
      if (calc.flag < 0) {
        throw new AppError(
          "SWISS_EPHEMERIS_CALC_FAILED",
          `Failed calculating ${key}: ${calc.error || "unknown error"}`,
          500,
        );
      }

      const data = calc.data;
      result[key] = {
        longitude: data[0] ?? 0,
        latitude: data[1] ?? 0,
        distance: data[2] ?? 0,
        speedLongitude: data[3] ?? 0,
      };
    });

    const rahuLongitude = result.rahu.longitude;
    result.ketu = {
      longitude: (rahuLongitude + 180) % 360,
      latitude: -result.rahu.latitude,
      distance: result.rahu.distance,
      speedLongitude: result.rahu.speedLongitude,
    };

    return result;
  }

  calculateHouses(jd: number, latitude: number, longitude: number, hsys = "P"): HouseSystemResult {
    this.ensureInitialized();
    const houses = sweph.houses_ex2(jd, 0, latitude, longitude, hsys);
    if (houses.flag !== sweph.constants.OK) {
      throw new AppError(
        "SWISS_EPHEMERIS_HOUSES_FAILED",
        `Failed calculating houses: ${houses.error || "unknown error"}`,
        500,
      );
    }

    const houseList = houses.data.houses;
    const points = houses.data.points;

    return {
      cusps: Array.isArray(houseList) ? [...houseList] : Object.values(houseList),
      ascmc: Array.isArray(points) ? [...points] : Object.values(points),
    };
  }

  close(): void {
    if (!this.initialized) return;
    try {
      sweph.close();
    } finally {
      this.initialized = false;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}

export const swissEphemerisService = new SwissEphemerisService();
