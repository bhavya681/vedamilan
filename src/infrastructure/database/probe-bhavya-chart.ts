/**
 * Probe: AstroSage parity for 11 Oct 2003 20:05 Boisar
 * Expected: Asc Aries, Moon Aries, Lagna nakshatra Bharani, Rahu H1
 */
import "dotenv/config";

import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";
import { parseBirthDateTime } from "@/application/horoscope/horoscope.service";
import {
  longitudeToNakshatra,
  longitudeToSign,
  wholeSignHouse,
} from "@/application/horoscope/vedic-constants";
import { buildPlanetRows } from "@/application/horoscope/chart-builder";

function main() {
  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  swissEphemerisService.setAyanamsha("LAHIRI");

  const birthDate = new Date(Date.UTC(2003, 9, 11));
  const utc = parseBirthDateTime(birthDate, "20:05:00", "Asia/Kolkata");
  const jd = swissEphemerisService.julDay(utc);

  // Boisar, Palghar, Maharashtra
  const lat = 19.8036;
  const lon = 72.7561;

  const houses = swissEphemerisService.calculateHouses(jd, lat, lon, "P");
  const ascLon = houses.ascmc[0] ?? 0;
  const positions = swissEphemerisService.calculatePlanets(jd);
  const planets = buildPlanetRows(positions, ascLon);

  const asc = longitudeToSign(ascLon);
  const ascNak = longitudeToNakshatra(ascLon);
  const moon = planets.find((p) => p.planet === "Moon")!;
  const rahu = planets.find((p) => p.planet === "Rahu")!;
  const _moonNak = longitudeToNakshatra(moon.longitude);

  const out = {
    utc: utc.toISOString(),
    ayanamsa: swissEphemerisService.getAyanamsa(jd),
    lagna: `${asc.sign} ${asc.degreeInSign.toFixed(2)}°`,
    lagnaNakshatra: `${ascNak.nakshatra} pada ${ascNak.nakshatraPada}`,
    moon: `${moon.sign} ${(moon.longitude % 30).toFixed(2)}° H${moon.house}`,
    moonNakshatra: `${moon.nakshatra} pada ${moon.nakshatraPada}`,
    rahu: `${rahu.sign} ${(rahu.longitude % 30).toFixed(2)}° H${rahu.house}`,
    rahuWholeSignHouse: wholeSignHouse(rahu.signId, asc.signId),
    planets: planets
      .filter((p) =>
        ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(
          p.planet,
        ),
      )
      .map((p) => `${p.planet}: ${p.sign} H${p.house}`),
    expect: {
      lagna: "Aries",
      moon: "Aries",
      lagnaNak: "Bharani",
      rahuHouse: 1,
    },
    ok: {
      lagna: asc.sign === "Aries",
      moon: moon.sign === "Aries",
      lagnaNak: ascNak.nakshatra === "Bharani",
      rahuH1: rahu.house === 1,
    },
  };
  console.log(JSON.stringify(out, null, 2));
}

main();
