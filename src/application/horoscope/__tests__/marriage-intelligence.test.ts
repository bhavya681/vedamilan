import { describe, expect, it } from "vitest";

import {
  applyDeshKaalPatra,
  inferCountryFromPlace,
  marriagePlaceNorm,
} from "@/application/horoscope/marriage-desh-kaal";
import { partnershipDashaWindows } from "@/application/horoscope/marriage-intelligence";

const now = new Date("2026-08-17T00:00:00.000Z");

const venusWindow = {
  label: "Venus Mahadasha",
  range: "Jan 2024 – Jan 2044",
  role: "Current 7th-lord Mahadasha",
  startDate: "2024-01-01T00:00:00.000Z",
  endDate: "2044-01-01T00:00:00.000Z",
};

describe("marriage Desh–Kaal–Patra", () => {
  it("uses a later typical band for the United States than for India", () => {
    const india = marriagePlaceNorm("India", "Mumbai", "MALE");
    const us = marriagePlaceNorm("United States", "New York", "MALE");
    expect(india.legalMin).toBe(21);
    expect(us.typicalMin).toBeGreaterThan(india.typicalMin);
  });

  it("clips a long mahadasha to practical marriage ages in India", () => {
    const read = applyDeshKaalPatra({
      windows: [venusWindow],
      birthDate: "1998-08-17T00:00:00.000Z",
      city: "Mumbai",
      country: "India",
      maritalStatus: "NEVER_MARRIED",
      gender: "MALE",
      now,
    });
    expect(read.ageYears).toBe(28);
    expect(read.verdict).toBe("likely");
    expect(read.windows).toHaveLength(1);
    expect(read.windows[0]?.range).toContain("2024");
    expect(read.windows[0]?.range).toContain("2030");
    expect(read.windows[0]?.dashaRange).toContain("2024");
    expect(read.windows[0]?.likelihood).toBe("likely");
    expect(read.windows[0]?.note).not.toMatch(/wedding day/i);
  });

  it("does not treat a 16-year-old in India as ready to marry", () => {
    const read = applyDeshKaalPatra({
      windows: [venusWindow],
      birthDate: "2010-08-17T00:00:00.000Z",
      country: "India",
      maritalStatus: "NEVER_MARRIED",
      gender: "MALE",
      now,
    });
    expect(read.ageYears).toBe(16);
    expect(read.verdict).toBe("not-yet");
    expect(read.windows[0]?.startDate?.slice(0, 4)).toBe("2031");
  });

  it("withholds first-marriage timings when Patra is already married", () => {
    const read = applyDeshKaalPatra({
      windows: [venusWindow],
      birthDate: "1998-08-17T00:00:00.000Z",
      country: "India",
      maritalStatus: "MARRIED",
      now,
    });
    expect(read.verdict).toBe("already-settled");
    expect(read.windows).toEqual([]);
  });

  it("reads India from a birth-place string when country is missing", () => {
    expect(inferCountryFromPlace(null, "Boisar, Palghar, Maharashtra, India")).toBe("India");
    expect(inferCountryFromPlace("United States", "Mumbai")).toBe("United States");
  });

  it("keeps a dasha that falls after the typical band so the page is not blank", () => {
    const read = applyDeshKaalPatra({
      windows: [
        {
          label: "Mercury Mahadasha",
          range: "Jan 2045 – Jan 2062",
          role: "Upcoming Mercury Mahadasha",
          startDate: "2045-01-01T00:00:00.000Z",
          endDate: "2062-01-01T00:00:00.000Z",
        },
      ],
      birthDate: "1998-08-17T00:00:00.000Z",
      country: "India",
      maritalStatus: "NEVER_MARRIED",
      gender: "MALE",
      now,
    });
    expect(read.windows.length).toBeGreaterThan(0);
    expect(read.windows[0]?.likelihood).toBe("later");
  });
});

describe("partnershipDashaWindows dates", () => {
  it("includes the current mahadasha even when it is not a marriage lord", () => {
    const result = partnershipDashaWindows({
      periods: [
        {
          lord: "Sun",
          level: "MAHA",
          startDate: "2019-08-17T00:00:00.000Z",
          endDate: "2026-12-31T00:00:00.000Z",
        },
      ],
      currentMaha: "Sun",
      currentAntar: null,
      seventhLord: "Venus",
      darakaraka: "Mars",
      now,
    });
    expect(result.windows.map((w) => w.label)).toContain("Sun Mahadasha");
  });

  it("includes ISO bounds so Desh–Kaal–Patra can clip them", () => {
    const result = partnershipDashaWindows({
      periods: [
        {
          lord: "Venus",
          level: "MAHA",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2044-01-01T00:00:00.000Z",
        },
      ],
      currentMaha: "Venus",
      currentAntar: null,
      seventhLord: "Venus",
      darakaraka: "Mars",
      now,
    });
    expect(result.windows[0]?.startDate).toBe("2024-01-01T00:00:00.000Z");
    expect(result.windows[0]?.endDate).toBe("2044-01-01T00:00:00.000Z");
  });
});
