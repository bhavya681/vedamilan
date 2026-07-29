import { BirthDetails, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";
import { NotFoundError } from "@/lib/utils/error-handler";
import { longitudeToSign } from "@/application/horoscope/vedic-constants";
import {
  buildEastChart,
  buildNorthChart,
  buildPlanetRows,
  buildSouthChart,
} from "@/application/horoscope/chart-builder";

export type GocharPlanet = {
  planet: string;
  sign: string;
  houseFromNatalLagna: number;
  nakshatra: string;
  isRetrograde: boolean;
  note: string;
};

function gocharNote(planet: string, house: number): string {
  const map: Record<number, string> = {
    1: "Activates identity, vitality, and fresh starts",
    2: "Touches speech, family resources, and values",
    3: "Supports effort, siblings, and short travel",
    4: "Highlights home, emotional roots, and peace",
    5: "Colors creativity, romance, and counsel themes",
    6: "Asks for health discipline and service focus",
    7: "Brings partnership and public-facing themes forward",
    8: "Deepens transformation, shared resources, research",
    9: "Favors dharma, mentors, and longer journeys",
    10: "Amplifies career visibility and duty",
    11: "Supports gains, networks, and fulfilled wishes",
    12: "Invites rest, foreign links, and inner retreat",
  };
  return `${planet}: ${map[house] || "Transit influence active"}`;
}

const SIGN_ORDER = [
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

type BirthNatal = {
  latitude: number;
  longitude: number;
  timezone?: string | null;
  lagnaSign: string;
  lagnaDegree?: number | null;
  moonSign?: string | null;
};

function buildGocharSnapshot(
  asOf: Date,
  birth: BirthNatal,
  natalLagnaSign: string,
  natalLagnaDegree: number,
) {
  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  const jd = swissEphemerisService.julDay(asOf);
  const houses = swissEphemerisService.calculateHouses(jd, birth.latitude, birth.longitude, "P");
  const transitLagnaLong = houses.ascmc[0] ?? 0;
  const positions = swissEphemerisService.calculatePlanets(jd);

  const natalLagnaSignId = Math.max(
    0,
    SIGN_ORDER.indexOf(natalLagnaSign as (typeof SIGN_ORDER)[number]),
  );
  const natalLagnaLong = natalLagnaSignId * 30 + (natalLagnaDegree || 0);

  const rows = buildPlanetRows(positions, natalLagnaLong);
  const classical = rows.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(
      p.planet,
    ),
  );

  const chartNorth = buildNorthChart(classical, natalLagnaSignId, natalLagnaDegree || 0);
  const chartSouth = buildSouthChart(classical, natalLagnaSignId, natalLagnaDegree || 0);
  const chartEast = buildEastChart(classical, natalLagnaSignId, natalLagnaDegree || 0);

  const planets: GocharPlanet[] = classical.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    houseFromNatalLagna: p.house,
    nakshatra: p.nakshatra,
    isRetrograde: p.isRetrograde,
    note: gocharNote(p.planet, p.house),
  }));

  const transitAsc = longitudeToSign(transitLagnaLong);
  const moon = planets.find((p) => p.planet === "Moon");
  const jupiter = planets.find((p) => p.planet === "Jupiter");
  const saturn = planets.find((p) => p.planet === "Saturn");

  return {
    asOf: asOf.toISOString(),
    timezoneNote: birth.timezone || "Asia/Kolkata",
    transitAscendant: transitAsc.sign,
    natalLagna: natalLagnaSign,
    natalMoon: birth.moonSign || null,
    highlights: [
      moon
        ? `Transit Moon in ${moon.sign} (house ${moon.houseFromNatalLagna} from natal Lagna)`
        : null,
      jupiter ? `Transit Jupiter in ${jupiter.sign} (house ${jupiter.houseFromNatalLagna})` : null,
      saturn
        ? `Transit Saturn in ${saturn.sign} (house ${saturn.houseFromNatalLagna})${saturn.isRetrograde ? " — retrograde" : ""}`
        : null,
    ].filter(Boolean) as string[],
    planets,
    chartNorth,
    chartSouth,
    chartEast,
  };
}

/**
 * Current sky (Gochar) read against the member's natal Lagna longitude.
 * Deterministic Swiss Ephemeris calculation — AI only explains this output.
 */
export async function computeGocharForUser(userId: string) {
  await connectMongo();
  const [birth, natal] = await Promise.all([
    BirthDetails.findOne({ userId }).lean(),
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!birth || !natal) {
    throw new NotFoundError("Birth details and kundli required for Gochar");
  }

  return buildGocharSnapshot(
    new Date(),
    {
      latitude: birth.latitude,
      longitude: birth.longitude,
      timezone: birth.timezone,
      lagnaSign: natal.lagnaSign,
      lagnaDegree: natal.lagnaDegree,
      moonSign: natal.moonSign,
    },
    natal.lagnaSign,
    natal.lagnaDegree || 0,
  );
}

/**
 * Historical gochar at a past/future calendar date — used to score life-event windows
 * with sky conditions at the Antardasha midpoint.
 */
export async function computeGocharAtDate(userId: string, asOf: Date) {
  await connectMongo();
  const [birth, natal] = await Promise.all([
    BirthDetails.findOne({ userId }).lean(),
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!birth || !natal) {
    throw new NotFoundError("Birth details and kundli required for Gochar");
  }

  return buildGocharSnapshot(
    asOf,
    {
      latitude: birth.latitude,
      longitude: birth.longitude,
      timezone: birth.timezone,
      lagnaSign: natal.lagnaSign,
      lagnaDegree: natal.lagnaDegree,
      moonSign: natal.moonSign,
    },
    natal.lagnaSign,
    natal.lagnaDegree || 0,
  );
}
