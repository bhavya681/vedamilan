import { describe, expect, it } from "vitest";

import {
  houseFromLongitude,
  longitudeToNakshatra,
  longitudeToSign,
} from "@/application/horoscope/vedic-constants";
import { detectManglik, buildPlanetRows } from "@/application/horoscope/chart-builder";
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

  it("computes houses from lagna", () => {
    expect(houseFromLongitude(10, 0)).toBe(1);
    expect(houseFromLongitude(40, 0)).toBe(2);
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
    expect(dasha.balanceAtBirth.lord).toBeTruthy();
  });
});
