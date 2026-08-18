import { describe, expect, it } from "vitest";

import {
  angularDiff,
  eclipticToEquatorial,
  equatorialToHorizontal,
  horizonStatus,
  lerpAngle,
  meanObliquity,
  stereographicPoint,
} from "@/application/horoscope/horizon-coordinates";

describe("horizon coordinates", () => {
  it("maps vernal-point ecliptic to RA 0 / Dec 0", () => {
    const eq = eclipticToEquatorial(0, 0, 23.4393);
    expect(eq.ra).toBeCloseTo(0, 5);
    expect(eq.dec).toBeCloseTo(0, 5);
  });

  it("maps ecliptic 90° to declination equal to obliquity", () => {
    const eps = 23.4393;
    const eq = eclipticToEquatorial(90, 0, eps);
    expect(eq.ra).toBeCloseTo(90, 1);
    expect(eq.dec).toBeCloseTo(eps, 2);
  });

  it("places an equatorial object on the meridian in the south", () => {
    const lat = 51.5;
    const { altitude, azimuth } = equatorialToHorizontal(0, 0, 0, lat);
    expect(azimuth).toBeCloseTo(180, 0);
    expect(altitude).toBeCloseTo(90 - lat, 1);
  });

  it("only labels rising when near the ascendant and the horizon", () => {
    expect(horizonStatus(2, 88, 90, 270)).toBe("rising");
    expect(horizonStatus(40, 90, 90, 270)).toBe("above");
    expect(horizonStatus(2, 270, 90, 270)).toBe("setting");
    expect(horizonStatus(-20, 90, 90, 270)).toBe("below");
  });

  it("puts north at the top of the stereographic disc", () => {
    const p = stereographicPoint(0, 0, 50, 50, 40);
    expect(p.x).toBeCloseTo(50, 5);
    expect(p.y).toBeCloseTo(10, 5);
    const east = stereographicPoint(0, 90, 50, 50, 40);
    expect(east.x).toBeCloseTo(90, 5);
    expect(east.y).toBeCloseTo(50, 5);
  });

  it("keeps obliquity near 23.4° at J2000", () => {
    expect(meanObliquity(2451545.0)).toBeCloseTo(23.4393, 3);
  });

  it("measures shortest azimuth gap", () => {
    expect(angularDiff(10, 350)).toBeCloseTo(20, 5);
  });

  it("interpolates azimuth across north without spinning the long way", () => {
    expect(lerpAngle(350, 10, 0.5)).toBeCloseTo(0, 5);
  });
});
