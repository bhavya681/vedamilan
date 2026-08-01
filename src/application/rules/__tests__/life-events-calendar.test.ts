import { describe, expect, it } from "vitest";

import {
  computeLifeEventsCalendar,
  classifyTravelKind,
  scoreGocharForCategory,
} from "@/application/rules/life-events-calendar";

describe("life events calendar + gochar", () => {
  it("boosts marriage when Venus/Jupiter transit supportive houses", () => {
    const { boost, note } = scoreGocharForCategory("marriage", [
      { planet: "Venus", houseFromNatalLagna: 7 },
      { planet: "Jupiter", houseFromNatalLagna: 5 },
      { planet: "Saturn", houseFromNatalLagna: 12 },
    ]);
    expect(boost).toBeGreaterThanOrEqual(8);
    expect(note).toMatch(/Gochar support/i);
  });

  it("classifies foreign vs local travel from dasha and houses", () => {
    const foreign = classifyTravelKind({
      mahaLord: "Venus",
      antarLord: "Rahu",
      twelfthLord: "Rahu",
      ninthLord: "Jupiter",
      thirdLord: "Mars",
      gochar: [{ planet: "Rahu", houseFromNatalLagna: 12 }],
      spanMonths: 18,
    });
    expect(foreign.kind).toBe("foreign");
    expect(foreign.label).toMatch(/Foreign/i);

    const local = classifyTravelKind({
      mahaLord: "Moon",
      antarLord: "Mercury",
      thirdLord: "Mercury",
      ninthLord: "Jupiter",
      twelfthLord: "Saturn",
      gochar: [{ planet: "Moon", houseFromNatalLagna: 3 }],
      spanMonths: 5,
    });
    expect(local.kind).toBe("local");
    expect(local.label).toMatch(/Local/i);

    const pilgrim = classifyTravelKind({
      mahaLord: "Jupiter",
      antarLord: "Ketu",
      ninthLord: "Jupiter",
      twelfthLord: "Saturn",
      thirdLord: "Mars",
      gochar: [{ planet: "Ketu", houseFromNatalLagna: 9 }],
      spanMonths: 10,
    });
    expect(pilgrim.kind).toBe("pilgrimage");
  });

  it("surfaces past major job chapter around mid-2025 Venus–Ketu with historical gochar", () => {
    const now = new Date("2026-07-29T00:00:00.000Z");
    const birth = new Date("2003-07-01T00:00:00.000Z");
    const antarStart = "2025-03-01T00:00:00.000Z";

    const report = computeLifeEventsCalendar({
      now,
      birthDate: birth,
      lagnaSign: "Aries",
      city: "Boisar, Palghar, Maharashtra, India",
      country: "India",
      gocharPlanets: [{ planet: "Mercury", houseFromNatalLagna: 10 }],
      historicalGocharByAntarStart: {
        [antarStart]: [
          { planet: "Sun", houseFromNatalLagna: 10 },
          { planet: "Mercury", houseFromNatalLagna: 10 },
          { planet: "Venus", houseFromNatalLagna: 11 },
        ],
      },
      periods: [
        {
          lord: "Venus",
          parentLord: "Venus",
          level: "MAHA",
          startDate: "2019-01-01",
          endDate: "2039-01-01",
        },
        {
          lord: "Mercury",
          parentLord: "Venus",
          level: "ANTAR",
          startDate: "2022-05-01",
          endDate: "2025-03-01",
        },
        {
          lord: "Ketu",
          parentLord: "Venus",
          level: "ANTAR",
          startDate: antarStart,
          endDate: "2026-05-01",
        },
      ],
    });

    expect(report.context.placeNote).not.toMatch(/India, India/);
    expect(report.pastHighlights.length).toBeGreaterThan(0);

    const juneJob = report.pastHighlights.find(
      (e) =>
        e.category === "job" &&
        e.dashaLabel.includes("Ketu") &&
        new Date(e.startDate) <= new Date("2025-06-15") &&
        new Date(e.endDate) >= new Date("2025-06-15"),
    );
    expect(juneJob).toBeTruthy();
    expect(juneJob!.significance).toBe("major");
    expect(juneJob!.score).toBeGreaterThanOrEqual(70);
    expect(juneJob!.spanMonths).toBeGreaterThanOrEqual(3);
    expect(juneJob!.gocharNote || "").toMatch(/Sky then|Gochar/i);
  });

  it("keeps one primary theme per Antardasha and filters mild noise", () => {
    const now = new Date("2026-07-29T00:00:00.000Z");
    const birth = new Date("2003-07-01T00:00:00.000Z");

    const report = computeLifeEventsCalendar({
      now,
      birthDate: birth,
      lagnaSign: "Aries",
      gocharPlanets: [
        { planet: "Jupiter", houseFromNatalLagna: 9 },
        { planet: "Rahu", houseFromNatalLagna: 3 },
        { planet: "Ketu", houseFromNatalLagna: 12 },
        { planet: "Sun", houseFromNatalLagna: 10 },
        { planet: "Mercury", houseFromNatalLagna: 10 },
      ],
      periods: [
        {
          lord: "Venus",
          parentLord: "Venus",
          level: "MAHA",
          startDate: "2019-01-01",
          endDate: "2039-01-01",
        },
        {
          lord: "Ketu",
          parentLord: "Venus",
          level: "ANTAR",
          startDate: "2026-05-01",
          endDate: "2027-07-01",
        },
        {
          lord: "Rahu",
          parentLord: "Venus",
          level: "ANTAR",
          startDate: "2027-07-01",
          endDate: "2030-01-01",
        },
      ],
    });

    expect(report.events.length).toBeGreaterThan(0);
    expect(report.events.every((e) => e.significance === "major")).toBe(true);
    expect(report.events.every((e) => e.score >= 70)).toBe(true);

    // At most one event per Antardasha start
    const keys = report.events.map((e) => `${e.startDate}|${e.dashaLabel}`);
    expect(new Set(keys).size).toBe(keys.length);

    // Soft themes may appear only when they win as the primary major chapter
    const soft = report.events.filter(
      (e) => e.category === "travel" || e.category === "spiritual" || e.category === "health",
    );
    for (const e of soft) {
      expect(e.score).toBeGreaterThanOrEqual(74);
    }
  });
});
