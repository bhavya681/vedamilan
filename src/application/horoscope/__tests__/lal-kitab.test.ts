import { describe, expect, it } from "vitest";

import { buildLalKitabReport } from "@/application/horoscope/lal-kitab";

describe("Lal Kitab house engine", () => {
  it("maps planet houses, sutras, and remedies from placements", () => {
    const report = buildLalKitabReport({
      lagnaSign: "Aries",
      planets: [
        { planet: "Sun", house: 1, sign: "Aries" },
        { planet: "Moon", house: 4, sign: "Cancer" },
        { planet: "Mars", house: 7, sign: "Libra" },
        { planet: "Mercury", house: 7, sign: "Libra" },
        { planet: "Jupiter", house: 9, sign: "Sagittarius" },
        { planet: "Venus", house: 6, sign: "Virgo" },
        { planet: "Saturn", house: 1, sign: "Aries" },
        { planet: "Rahu", house: 12, sign: "Pisces" },
        { planet: "Ketu", house: 6, sign: "Virgo" },
      ],
      doshas: [{ code: "MANGLIK", present: true, notes: "Mars in 7" }],
    });

    expect(report.placements.length).toBe(9);
    expect(report.placements.find((p) => p.planet === "Mercury")?.rating).toBe("pakka");
    expect(report.placements.find((p) => p.planet === "Venus")?.rating).toBe("challenging");
    expect(report.sutras.some((s) => s.code === "SUN_SATURN_COMBUST_THEME")).toBe(true);
    expect(report.sutras.some((s) => s.code === "MERCURY_PAKKA_7")).toBe(true);
    expect(report.remedies.length).toBeGreaterThan(0);
    expect(report.remedies.some((r) => r.source === "dosha")).toBe(true);
  });
});
