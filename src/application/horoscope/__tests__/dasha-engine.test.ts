import { describe, expect, it } from "vitest";

import {
  computeVimshottari,
  expandAntardashas,
  hydrateStoredDasha,
} from "@/application/horoscope/dasha-engine";
import { VIMSHOTTARI_YEARS } from "@/application/horoscope/vedic-constants";

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

describe("Vimshottari Antardasha", () => {
  it("keeps full Mahadasha Antardashas in classical proportions", () => {
    const start = new Date("2000-01-01T00:00:00Z");
    const venusYears = VIMSHOTTARI_YEARS.Venus;
    const end = new Date(start.getTime() + venusYears * MS_PER_YEAR);
    const antar = expandAntardashas({ lord: "Venus", startDate: start, endDate: end });
    expect(antar).toHaveLength(9);
    expect(antar[0]?.lord).toBe("Venus");
    const venusAntarYears =
      (antar[0]!.endDate.getTime() - antar[0]!.startDate.getTime()) / MS_PER_YEAR;
    expect(venusAntarYears).toBeCloseTo((20 / 120) * venusYears, 5);
    expect(antar.at(-1)?.endDate.getTime()).toBe(end.getTime());
  });

  it("does not restart the first remainder Mahadasha from its own lord", () => {
    // Ashwini start = Ketu Mahadasha. Mid-nakshatra => half of Ketu remaining.
    const birth = new Date("1990-06-15T00:00:00Z");
    const dasha = computeVimshottari(6.6666667, birth, birth);
    const firstMaha = dasha.periods.find((p) => p.level === "MAHA");
    expect(firstMaha?.lord).toBe("Ketu");
    const firstAntar = dasha.periods.find((p) => p.level === "ANTAR" && p.parentLord === "Ketu");
    expect(firstAntar?.lord).toBe("Rahu");
    expect(dasha.currentMaha).toBe("Ketu");
    expect(dasha.currentAntar).toBe("Rahu");
  });

  it("rehydrates stale stored currentAntar from Mahadasha windows", () => {
    const birth = new Date("1990-06-15T00:00:00Z");
    const computed = computeVimshottari(6.6666667, birth, birth);
    const mahas = computed.periods.filter((p) => p.level === "MAHA");
    const stale = hydrateStoredDasha(
      {
        periods: mahas,
        currentMaha: "Venus",
        currentAntar: "Venus",
      },
      birth,
    );
    expect(stale.currentMaha).toBe("Ketu");
    expect(stale.currentAntar).toBe("Rahu");
  });
});
