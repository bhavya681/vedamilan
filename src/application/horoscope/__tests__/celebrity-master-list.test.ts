import { describe, expect, it } from "vitest";

import { CELEBRITY_CATEGORIES, type CelebrityBirthRecord } from "../celebrity-catalog";
import { buildMasterRecords } from "../celebrity-master-list";

const existing: CelebrityBirthRecord[] = [
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    field: "Investing",
    category: "Finance",
    birthDate: "1930-08-30",
    birthTime: "12:00",
    timezone: "America/Chicago",
    latitude: 41.2565,
    longitude: -95.9345,
    place: "Omaha, Nebraska",
    timeAccuracy: "unknown",
  },
];

describe("celebrity master list", () => {
  it("adds unique records and skips names already in the catalog", () => {
    const records = buildMasterRecords(existing);
    const names = new Set(records.map((record) => record.name));

    expect(names.has("Warren Buffett")).toBe(false);
    expect(names.has("Jeffrey Esteem")).toBe(true);
    expect(records.every((record) => CELEBRITY_CATEGORIES.includes(record.category))).toBe(true);
  });

  it("keeps known dates when the place is missing but flags the chart", () => {
    const pickens = buildMasterRecords([]).find((record) => record.name === "T. Boone Pickens");

    expect(pickens?.birthDate).toBe("1928-05-22");
    expect(pickens?.note).toContain("PLACEHOLDER BIRTH DATA");
    expect(pickens?.place).toBe("Birthplace not publicly verified");
  });

  it("uses a neutral placeholder date when no date is known", () => {
    const minervini = buildMasterRecords([]).find((record) => record.name === "Mark Minervini");

    expect(minervini?.birthDate).toBe("1900-01-01");
    expect(minervini?.note).toContain("PLACEHOLDER BIRTH DATA");
  });

  it("skips alias duplicates and keeps unique IDs", () => {
    const records = buildMasterRecords([]);
    const names = new Set(records.map((record) => record.name));
    const ids = new Set(records.map((record) => record.id));

    expect(names.has("Ed Thorp")).toBe(false);
    expect(names.has("Edward O. Thorp")).toBe(true);
    expect(ids.size).toBe(records.length);
  });
});
