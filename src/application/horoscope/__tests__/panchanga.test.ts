import { describe, expect, it } from "vitest";

import {
  computeMuhurta,
  computePanchanga,
  karanaForDifference,
  localDateToUtc,
} from "@/application/horoscope/panchanga";

const DELHI = { latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };

describe("Panchanga accuracy", () => {
  it("resolves a calendar date in the requested timezone, not server local time", () => {
    expect(localDateToUtc("2026-11-29", "Asia/Kolkata").toISOString()).toBe(
      "2026-11-28T18:30:00.000Z",
    );
  });

  it("uses the fixed and moving karana sequence correctly", () => {
    expect(karanaForDifference(0).name).toBe("Kimstughna");
    expect(karanaForDifference(6).name).toBe("Bava");
    expect(karanaForDifference(42).name).toBe("Vishti");
    expect(karanaForDifference(48).name).toBe("Bava");
    expect(karanaForDifference(342).name).toBe("Shakuni");
    expect(karanaForDifference(348).name).toBe("Chatushpada");
    expect(karanaForDifference(354).name).toBe("Naga");
    expect(karanaForDifference(359.9).name).toBe("Naga");
  });

  it("uses the local weekday and sunrise-based limbs", () => {
    const panchanga = computePanchanga(
      localDateToUtc("2026-11-29", DELHI.timezone),
      DELHI.latitude,
      DELHI.longitude,
      DELHI.timezone,
    );
    expect(panchanga.localDate).toBe("2026-11-29");
    expect(panchanga.vara.name).toBe("Sunday");
    expect(panchanga.sunrise.timestamp).toBeLessThan(panchanga.sunset.timestamp);
    expect(panchanga.rahuKalam.startTs).toBeGreaterThan(panchanga.sunrise.timestamp);
    expect(panchanga.rahuKalam.endTs).toBeLessThanOrEqual(panchanga.sunset.timestamp);
  });

  it("never returns a good muhurta window overlapping Rahu, Yamaganda, or Gulika", () => {
    const date = localDateToUtc("2026-11-29", DELHI.timezone);
    const panchanga = computePanchanga(date, DELHI.latitude, DELHI.longitude, DELHI.timezone);
    const windows = computeMuhurta(
      date,
      DELHI.latitude,
      DELHI.longitude,
      DELHI.timezone,
      "general",
    );
    const avoid = [panchanga.rahuKalam, panchanga.yamaganda, panchanga.gulika].filter(
      (window): window is { startTs: number; endTs: number } => Boolean(window),
    );

    expect(windows.length).toBeGreaterThan(0);
    for (const window of windows) {
      if (window.rating === "avoid") continue;
      const overlaps = avoid.some(
        (block) => window.startTs < block.endTs && window.endTs > block.startTs,
      );
      expect(overlaps).toBe(false);
    }
  });
});
