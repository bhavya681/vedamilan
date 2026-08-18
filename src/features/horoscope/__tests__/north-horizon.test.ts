import { describe, expect, it } from "vitest";

import {
  angularSep,
  conjunctionAlignments,
  horizonRole,
  lagnaLongitudeFromChart,
  northHorizonPoint,
} from "@/features/horoscope/lib/north-horizon";

describe("North Indian horizon sky geometry", () => {
  it("places lagna at the top of the wheel", () => {
    const p = northHorizonPoint(120, 120, 50, 50, 10);
    expect(p.x).toBeCloseTo(50, 5);
    expect(p.y).toBeCloseTo(40, 5);
    expect(p.deg).toBeCloseTo(0, 5);
  });

  it("places 90 degrees later to the left (anti-clockwise, house 4 / North)", () => {
    const p = northHorizonPoint(210, 120, 50, 50, 10);
    expect(p.x).toBeCloseTo(40, 5);
    expect(p.y).toBeCloseTo(50, 5);
  });

  it("builds lagna longitude from sign + degree", () => {
    expect(lagnaLongitudeFromChart({ lagnaSign: "Leo", lagnaDegree: 12 })).toBeCloseTo(132, 5);
  });

  it("labels house 1 as rising and house 7 as setting", () => {
    expect(horizonRole(1)).toBe("rising");
    expect(horizonRole(7)).toBe("setting");
    expect(horizonRole(10)).toBe("culminating");
    expect(horizonRole(12)).toBe("about-to-rise");
  });

  it("finds close graha alignments without pairing Rahu-Ketu", () => {
    const pairs = conjunctionAlignments([
      { planet: "Sun", sign: "Leo", house: 1, nakshatra: "Magha", longitude: 125 },
      { planet: "Mercury", sign: "Leo", house: 1, nakshatra: "Magha", longitude: 128 },
      { planet: "Rahu", sign: "Aries", house: 9, nakshatra: "Ashwini", longitude: 10 },
      { planet: "Ketu", sign: "Libra", house: 3, nakshatra: "Chitra", longitude: 190 },
    ]);
    expect(pairs).toEqual([{ a: "Sun", b: "Mercury", orb: 3 }]);
    expect(angularSep(10, 190)).toBeCloseTo(180, 5);
  });
});
