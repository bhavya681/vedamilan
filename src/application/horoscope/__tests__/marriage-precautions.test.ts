import { describe, expect, it } from "vitest";

import { analyzeMarriagePrecautions } from "@/application/horoscope/marriage-precautions";

describe("analyzeMarriagePrecautions", () => {
  it("flags Rahu–Venus together as a fidelity awareness theme", () => {
    const result = analyzeMarriagePrecautions({
      lagnaSign: "Aries",
      planets: [
        { planet: "Venus", sign: "Libra", house: 7 },
        { planet: "Rahu", sign: "Libra", house: 7 },
        { planet: "Ketu", sign: "Aries", house: 1 },
      ],
    });
    const fidelity = result.cards.find((card) => card.id === "fidelity");
    expect(fidelity?.indicators.length).toBeGreaterThan(0);
    expect(fidelity?.severity).not.toBe("note");
    expect(result.disclaimer.toLowerCase()).toContain("not destiny");
  });

  it("flags manglik plus Saturn in 7 as delay awareness", () => {
    const result = analyzeMarriagePrecautions({
      lagnaSign: "Aries",
      manglikStatus: "MANGLIK",
      planets: [{ planet: "Saturn", sign: "Libra", house: 7 }],
    });
    const delay = result.cards.find((card) => card.id === "delay");
    expect(delay?.indicators.some((line) => line.includes("Manglik"))).toBe(true);
    expect(delay?.indicators.some((line) => line.includes("Saturn"))).toBe(true);
  });

  it("flags stacked malefics in the 7th as conflict weather", () => {
    const result = analyzeMarriagePrecautions({
      lagnaSign: "Aries",
      planets: [
        { planet: "Mars", sign: "Libra", house: 7 },
        { planet: "Saturn", sign: "Libra", house: 7 },
      ],
    });
    const conflict = result.cards.find((card) => card.id === "conflict");
    expect(conflict?.severity).toBe("emphasis");
    expect(conflict?.cannotAccept.some((line) => line.toLowerCase().includes("physical"))).toBe(
      true,
    );
  });

  it("stays gentle on a quiet chart", () => {
    const result = analyzeMarriagePrecautions({
      lagnaSign: "Taurus",
      yogaCodes: ["VENUS_HARMONY"],
      planets: [
        { planet: "Venus", sign: "Taurus", house: 1 },
        { planet: "Jupiter", sign: "Scorpio", house: 7 },
      ],
    });
    expect(result.overall.tone).toBe("note");
    expect(result.cards.some((card) => card.id === "steady")).toBe(true);
  });
});
