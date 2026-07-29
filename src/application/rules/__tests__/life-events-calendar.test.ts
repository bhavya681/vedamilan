import { describe, expect, it } from "vitest";

import {
  computeLifeEventsCalendar,
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

  it("surfaces past job window around mid-2025 Venus–Ketu with historical gochar", () => {
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
    expect(report.presentHighlights).toBeDefined();
    expect(report.futureHighlights).toBeDefined();

    const juneJob = report.pastHighlights.find(
      (e) =>
        e.category === "job" &&
        e.dashaLabel.includes("Ketu") &&
        new Date(e.startDate) <= new Date("2025-06-15") &&
        new Date(e.endDate) >= new Date("2025-06-15"),
    );
    expect(juneJob).toBeTruthy();
    expect(juneJob!.score).toBeGreaterThanOrEqual(70);
    expect(juneJob!.gocharNote || "").toMatch(/Sky then|Gochar/i);
  });

  it("surfaces travel and spiritual windows (not empty filters)", () => {
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

    const travel = report.events.filter((e) => e.category === "travel");
    const spiritual = report.events.filter((e) => e.category === "spiritual");
    expect(travel.length).toBeGreaterThan(0);
    expect(spiritual.length).toBeGreaterThan(0);
    expect(travel.some((e) => e.phase === "present" || e.phase === "future")).toBe(true);
    expect(spiritual.some((e) => e.phase === "present" || e.phase === "future")).toBe(true);
  });
});
