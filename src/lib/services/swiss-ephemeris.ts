/**
 * Server-only Swiss Ephemeris wrapper.
 * Do not import this module from Client Components.
 *
 * Vedic (AstroSage-style) charts use the **sidereal** zodiac with **Lahiri** ayanamsa.
 * Tropical longitudes without ayanamsa will typically shift Lagna/Moon by ~1 sign today.
 *
 * The native `sweph.node` binary is loaded lazily so a Windows Application Control
 * block does not crash the whole Next.js process at import time.
 */
import { createRequire } from "node:module";
import path from "node:path";

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

export type AyanamshaMode = "LAHIRI" | "RAMAN" | "KRISHNAMURTI" | "FAGAN_BRADLEY";

type SwephModule = {
  constants: Record<string, number>;
  set_ephe_path: (path: string) => void;
  set_sid_mode: (mode: number, t0: number, ayan_t0: number) => void;
  get_ayanamsa_ut: (jd: number) => number;
  julday: (y: number, m: number, d: number, hour: number, flag: number) => number;
  calc_ut: (
    jd: number,
    body: number,
    flag: number,
  ) => { flag: number; error?: string; data: number[] };
  houses_ex2: (
    jd: number,
    flag: number,
    lat: number,
    lon: number,
    hsys: string,
  ) => {
    flag: number;
    error?: string;
    data: { houses: number[] | Record<string, number>; points: number[] | Record<string, number> };
  };
  close: () => void;
};

/** Resolve from package root so Turbopack/webpack bundling does not break native require. */
const requireSweph = createRequire(path.join(process.cwd(), "package.json"));

let swephCached: SwephModule | null = null;
let swephLoadError: AppError | null = null;

function loadSweph(): SwephModule {
  if (swephCached) return swephCached;
  if (swephLoadError) throw swephLoadError;

  try {
    swephCached = requireSweph("sweph") as SwephModule;
    return swephCached;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const blocked = /Application Control|blocked this file|EPERM|access is denied/i.test(message);
    swephLoadError = new AppError(
      blocked ? "SWISS_EPHEMERIS_BLOCKED" : "SWISS_EPHEMERIS_LOAD_FAILED",
      blocked
        ? "Swiss Ephemeris is blocked by Windows Application Control (sweph.node). Allow the file or run outside the restricted policy, then restart the server."
        : `Failed to load Swiss Ephemeris native module (${message.slice(0, 180)}). Run "npm rebuild sweph" and restart the dev server.`,
      blocked ? 503 : 500,
      error,
    );
    logger.error({ err: error, blocked }, "Swiss Ephemeris native module failed to load");
    throw swephLoadError;
  }
}

function sweConst(sweph: SwephModule, key: string): number {
  const value = sweph.constants[key];
  if (typeof value !== "number") {
    throw new AppError(
      "SWISS_EPHEMERIS_LOAD_FAILED",
      `Missing Swiss Ephemeris constant: ${key}`,
      500,
    );
  }
  return value;
}

function planetBodies(sweph: SwephModule): Record<Exclude<PlanetKey, "ketu">, number> {
  return {
    sun: sweConst(sweph, "SE_SUN"),
    moon: sweConst(sweph, "SE_MOON"),
    mercury: sweConst(sweph, "SE_MERCURY"),
    venus: sweConst(sweph, "SE_VENUS"),
    mars: sweConst(sweph, "SE_MARS"),
    jupiter: sweConst(sweph, "SE_JUPITER"),
    saturn: sweConst(sweph, "SE_SATURN"),
    uranus: sweConst(sweph, "SE_URANUS"),
    neptune: sweConst(sweph, "SE_NEPTUNE"),
    pluto: sweConst(sweph, "SE_PLUTO"),
    rahu: sweConst(sweph, "SE_TRUE_NODE"),
  };
}

function ayanamshaMap(sweph: SwephModule): Record<AyanamshaMode, number> {
  return {
    LAHIRI: sweConst(sweph, "SE_SIDM_LAHIRI"),
    RAMAN: sweConst(sweph, "SE_SIDM_RAMAN"),
    KRISHNAMURTI: sweConst(sweph, "SE_SIDM_KRISHNAMURTI"),
    FAGAN_BRADLEY: sweConst(sweph, "SE_SIDM_FAGAN_BRADLEY"),
  };
}

export class SwissEphemerisService {
  private initialized = false;
  private ayanamsha: AyanamshaMode = "LAHIRI";

  initialize(ephePath?: string): void {
    if (this.initialized) return;

    try {
      const sweph = loadSweph();
      const configured = ephePath || process.env.SWISS_EPHEMERIS_PATH || "./ephe";
      const resolved = path.isAbsolute(configured)
        ? configured
        : path.resolve(process.cwd(), configured);
      sweph.set_ephe_path(resolved);
      this.setAyanamsha("LAHIRI");
      this.initialized = true;
      logger.info(
        { path: resolved, ayanamsha: this.ayanamsha },
        "Swiss Ephemeris initialized (sidereal)",
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "SWISS_EPHEMERIS_INIT_FAILED",
        "Failed to initialize Swiss Ephemeris",
        500,
        error,
      );
    }
  }

  setAyanamsha(mode: AyanamshaMode = "LAHIRI"): void {
    const sweph = loadSweph();
    const map = ayanamshaMap(sweph);
    const sidMode = map[mode] ?? sweConst(sweph, "SE_SIDM_LAHIRI");
    sweph.set_sid_mode(sidMode, 0, 0);
    this.ayanamsha = mode;
  }

  getAyanamsa(jd: number): number {
    this.ensureInitialized();
    return loadSweph().get_ayanamsa_ut(jd);
  }

  julDay(date: Date, calendar: "g" | "j" = "g"): number {
    this.ensureInitialized();
    const sweph = loadSweph();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600 +
      date.getUTCMilliseconds() / 3_600_000;

    const flag = calendar === "g" ? sweConst(sweph, "SE_GREG_CAL") : sweConst(sweph, "SE_JUL_CAL");
    return sweph.julday(year, month, day, hour, flag);
  }

  calculatePlanets(jd: number): Record<PlanetKey, PlanetPosition> {
    this.ensureInitialized();
    const sweph = loadSweph();
    const bodies = planetBodies(sweph);
    // Sidereal (Lahiri by default) — matches AstroSage / Indian Vedic apps
    const preferred =
      sweConst(sweph, "SEFLG_SWIEPH") |
      sweConst(sweph, "SEFLG_SPEED") |
      sweConst(sweph, "SEFLG_SIDEREAL");
    const fallback =
      sweConst(sweph, "SEFLG_MOSEPH") |
      sweConst(sweph, "SEFLG_SPEED") |
      sweConst(sweph, "SEFLG_SIDEREAL");
    const result = {} as Record<PlanetKey, PlanetPosition>;

    (Object.keys(bodies) as Array<Exclude<PlanetKey, "ketu">>).forEach((key) => {
      const body = bodies[key];
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
    const sweph = loadSweph();
    // SEFLG_SIDEREAL so Ascendant / cusps are sidereal (Lahiri), not tropical
    const houses = sweph.houses_ex2(
      jd,
      sweConst(sweph, "SEFLG_SIDEREAL"),
      latitude,
      longitude,
      hsys,
    );
    if (houses.flag !== sweConst(sweph, "OK")) {
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
      loadSweph().close();
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
