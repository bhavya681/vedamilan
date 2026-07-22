import { describe, expect, it } from "vitest";

import {
  dignityForPlanet,
  dignityMark,
  formatDegreeInSign,
  houseFromLongitude,
  longitudeToNakshatra,
  longitudeToSign,
  wholeSignHouse,
} from "@/application/horoscope/vedic-constants";
import {
  detectManglik,
  buildPlanetRows,
  buildNorthChart,
} from "@/application/horoscope/chart-builder";
import { computeVimshottari } from "@/application/horoscope/dasha-engine";
import { parseBirthDateTime } from "@/application/horoscope/horoscope.service";
import type { PlanetKey, PlanetPosition } from "@/lib/services/swiss-ephemeris";

describe("Module 4 — Vedic math", () => {
  it("maps longitude to sign and nakshatra", () => {
    expect(longitudeToSign(0).sign).toBe("Aries");
    expect(longitudeToSign(35).sign).toBe("Taurus");
    expect(longitudeToNakshatra(0).nakshatra).toBe("Ashwini");
    expect(longitudeToNakshatra(0).nakshatraPada).toBe(1);
  });

  it("computes equal and whole-sign houses", () => {
    expect(houseFromLongitude(10, 0)).toBe(1);
    expect(houseFromLongitude(40, 0)).toBe(2);
    // Same rashi → same whole-sign house from Lagna (AstroSage D1)
    expect(wholeSignHouse(6, 0)).toBe(7); // Libra from Aries Lagna = H7
    expect(wholeSignHouse(6, 6)).toBe(1); // Libra Lagna → Libra = H1
  });

  it("keeps same-sign planets in one north-chart house", () => {
    const lagnaSignId = 0; // Aries
    const positions = {
      sun: { longitude: 10, latitude: 0, distance: 1, speedLongitude: 1 },
      moon: { longitude: 40, latitude: 0, distance: 1, speedLongitude: 13 },
      mercury: { longitude: 20, latitude: 0, distance: 1, speedLongitude: 1 },
      venus: { longitude: 185, latitude: 0, distance: 1, speedLongitude: 1 }, // Libra
      mars: { longitude: 80, latitude: 0, distance: 1, speedLongitude: 0.5 },
      jupiter: { longitude: 100, latitude: 0, distance: 1, speedLongitude: 0.1 },
      saturn: { longitude: 220, latitude: 0, distance: 1, speedLongitude: 0.05 },
      uranus: { longitude: 1, latitude: 0, distance: 1, speedLongitude: 0 },
      neptune: { longitude: 2, latitude: 0, distance: 1, speedLongitude: 0 },
      pluto: { longitude: 3, latitude: 0, distance: 1, speedLongitude: 0 },
      rahu: { longitude: 5, latitude: 0, distance: 1, speedLongitude: -0.05 },
      ketu: { longitude: 200, latitude: 0, distance: 1, speedLongitude: -0.05 }, // Libra
    } as Record<PlanetKey, PlanetPosition>;

    const rows = buildPlanetRows(positions, 5); // late Aries Lagna degree
    const venus = rows.find((p) => p.planet === "Venus")!;
    const ketu = rows.find((p) => p.planet === "Ketu")!;
    expect(venus.sign).toBe("Libra");
    expect(ketu.sign).toBe("Libra");
    expect(venus.house).toBe(ketu.house);
    expect(venus.house).toBe(wholeSignHouse(6, lagnaSignId));

    const north = buildNorthChart(rows, lagnaSignId, 5);
    const names = (north.houses[String(venus.house)] || []).map((g) =>
      typeof g === "string" ? g : g.planet,
    );
    expect(names).toContain("Venus");
    expect(names).toContain("Ketu");
  });

  it("marks ucch / neech dignity and formats degree", () => {
    expect(dignityForPlanet("Sun", "Aries")).toBe("Exalted");
    expect(dignityForPlanet("Sun", "Libra")).toBe("Debilitated");
    expect(dignityMark("Exalted")).toBe("↑");
    expect(dignityMark("Debilitated")).toBe("↓");
    expect(formatDegreeInSign(35.5)).toMatch(/5°/);
  });

  it("builds north chart glyphs into houses with Asc metadata", () => {
    const rows = buildPlanetRows(
      {
        sun: { longitude: 10, latitude: 0, distance: 1, speedLongitude: 1 },
        moon: { longitude: 40, latitude: 0, distance: 1, speedLongitude: 13 },
        mercury: { longitude: 20, latitude: 0, distance: 1, speedLongitude: 1 },
        venus: { longitude: 50, latitude: 0, distance: 1, speedLongitude: 1 },
        mars: { longitude: 80, latitude: 0, distance: 1, speedLongitude: 0.5 },
        jupiter: { longitude: 100, latitude: 0, distance: 1, speedLongitude: 0.1 },
        saturn: { longitude: 200, latitude: 0, distance: 1, speedLongitude: 0.05 },
        uranus: { longitude: 1, latitude: 0, distance: 1, speedLongitude: 0 },
        neptune: { longitude: 2, latitude: 0, distance: 1, speedLongitude: 0 },
        pluto: { longitude: 3, latitude: 0, distance: 1, speedLongitude: 0 },
        rahu: { longitude: 120, latitude: 0, distance: 1, speedLongitude: -0.05 },
        ketu: { longitude: 300, latitude: 0, distance: 1, speedLongitude: -0.05 },
      } as Record<PlanetKey, PlanetPosition>,
      0,
    );
    const north = buildNorthChart(rows, 0, 12.5);
    expect(north.houses["1"]?.length).toBeGreaterThan(0);
    expect(north.houses["1"]?.[0]?.degree).toBeTruthy();
    expect(north.lagnaLabel).toContain("Asc");
  });

  it("detects manglik when Mars in 7th", () => {
    const planets = [
      {
        planet: "Mars",
        sign: "Libra",
        signId: 6,
        house: 7,
        longitude: 180,
        latitude: 0,
        speed: 0.5,
        isRetrograde: false,
        nakshatra: "Swati",
        nakshatraPada: 1,
        dignity: "Own",
      },
    ];
    expect(detectManglik(planets).status).toBe("MANGLIK");
  });

  it("converts Asia/Kolkata civil time to UTC (IST = UTC+5:30)", () => {
    const birthDate = new Date(Date.UTC(1995, 4, 15)); // 1995-05-15 calendar day
    const utc = parseBirthDateTime(birthDate, "12:00:00", "Asia/Kolkata");
    expect(utc.toISOString()).toBe("1995-05-15T06:30:00.000Z");
  });

  it("builds planet rows and vimshottari periods", () => {
    const positions = {
      sun: { longitude: 10, latitude: 0, distance: 1, speedLongitude: 1 },
      moon: { longitude: 40, latitude: 0, distance: 1, speedLongitude: 13 },
      mercury: { longitude: 20, latitude: 0, distance: 1, speedLongitude: 1 },
      venus: { longitude: 50, latitude: 0, distance: 1, speedLongitude: 1 },
      mars: { longitude: 80, latitude: 0, distance: 1, speedLongitude: 0.5 },
      jupiter: { longitude: 100, latitude: 0, distance: 1, speedLongitude: 0.1 },
      saturn: { longitude: 200, latitude: 0, distance: 1, speedLongitude: 0.05 },
      uranus: { longitude: 1, latitude: 0, distance: 1, speedLongitude: 0 },
      neptune: { longitude: 2, latitude: 0, distance: 1, speedLongitude: 0 },
      pluto: { longitude: 3, latitude: 0, distance: 1, speedLongitude: 0 },
      rahu: { longitude: 120, latitude: 0, distance: 1, speedLongitude: -0.05 },
      ketu: { longitude: 300, latitude: 0, distance: 1, speedLongitude: -0.05 },
    } as Record<PlanetKey, PlanetPosition>;

    const rows = buildPlanetRows(positions, 0);
    expect(rows.find((p) => p.planet === "Ketu")).toBeTruthy();

    const dasha = computeVimshottari(40, new Date("1996-03-12T00:00:00Z"));
    expect(dasha.periods.some((p) => p.level === "MAHA")).toBe(true);
    expect(dasha.periods.filter((p) => p.level === "MAHA").length).toBe(9);
    expect(dasha.periods.filter((p) => p.level === "ANTAR").length).toBe(81);
    expect(dasha.balanceAtBirth.lord).toBeTruthy();
  });
});
