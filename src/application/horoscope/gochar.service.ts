import { BirthDetails, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";
import { NotFoundError } from "@/lib/utils/error-handler";
import { longitudeToSign } from "@/application/horoscope/vedic-constants";
import { buildPlanetRows } from "@/application/horoscope/chart-builder";

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

  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  const now = new Date();
  const jd = swissEphemerisService.julDay(now);
  const houses = swissEphemerisService.calculateHouses(jd, birth.latitude, birth.longitude, "P");
  const transitLagnaLong = houses.ascmc[0] ?? 0;
  const positions = swissEphemerisService.calculatePlanets(jd);
  // House from natal lagna degree (stored via lagnaDegree + lagnaSign reconstruction is complex);
  // use natal chart North houses planet lagna reference: approximate natal lagna longitude from sign+degree
  const natalLagnaSignId = Math.max(
    0,
    [
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
    ].indexOf(natal.lagnaSign),
  );
  const natalLagnaLong = natalLagnaSignId * 30 + (natal.lagnaDegree || 0);

  const rows = buildPlanetRows(positions, natalLagnaLong);
  const classical = rows.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(
      p.planet,
    ),
  );

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
    asOf: now.toISOString(),
    timezoneNote: birth.timezone || "Asia/Kolkata",
    transitAscendant: transitAsc.sign,
    natalLagna: natal.lagnaSign,
    natalMoon: natal.moonSign,
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
  };
}
