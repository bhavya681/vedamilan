import { describe, expect, it } from "vitest";

import { computeVedicCalendar } from "@/application/calendar/vedic-events.service";

describe("Vedic event calendar", () => {
  it("finds exact global eclipse maxima from Swiss Ephemeris", () => {
    const result = computeVedicCalendar({
      from: new Date("2024-04-07T00:00:00.000Z"),
      to: new Date("2024-04-09T23:59:59.999Z"),
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "Asia/Kolkata",
      ayanamsha: "LAHIRI",
      include: ["eclipse"],
      dailyDays: 2,
    });

    const solarEclipse = result.events.find((event) => event.eventType === "solar-eclipse");
    expect(solarEclipse).toBeDefined();
    expect(solarEclipse?.localDate).toBe("2024-04-08");
    expect(solarEclipse?.visibilityScope).toBe("global");
    expect(solarEclipse?.calculationContext).toContain("Swiss Ephemeris");
  });

  it("keeps panchanga transitions inside the selected local day", () => {
    const result = computeVedicCalendar({
      from: new Date("2026-11-28T18:30:00.000Z"),
      to: new Date("2026-11-29T18:29:59.999Z"),
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "Asia/Kolkata",
      ayanamsha: "LAHIRI",
      include: ["panchanga"],
      dailyDays: 1,
    });

    expect(result.events.length).toBeGreaterThan(0);
    for (const event of result.events) {
      expect(event.localDate).toBe("2026-11-29");
      expect(event.localTime).toMatch(/^\d{2}:\d{2}$/);
      expect(event.category).toBe("panchanga");
    }
    expect(result.dailyPanchanga[0]?.localDate).toBe("2026-11-29");
    expect(result.dailyPanchanga[0]?.karana.name).toBeTruthy();
  });
});
