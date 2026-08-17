import { describe, expect, it } from "vitest";

import {
  computeCharaKarakas,
  rankingDegreeForPlanet,
} from "@/application/horoscope/jaimini/chara-karaka";
import { jaiminiAspectsSign } from "@/application/horoscope/jaimini/jaimini-aspects";
import { interpretDarakaraka } from "@/application/horoscope/jaimini/jaimini-interpreter";

function planet(
  name: string,
  sign: string,
  house: number,
  degreeInSign: number,
  extra?: { isRetrograde?: boolean; signId?: number },
) {
  const signId =
    extra?.signId ??
    [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ].indexOf(sign);
  return {
    planet: name,
    sign,
    house,
    longitude: signId * 30 + degreeInSign,
    isRetrograde: extra?.isRetrograde ?? false,
    dignity: null as string | null,
  };
}

const SAMPLE = [
  planet("Sun", "Aries", 1, 15),
  planet("Moon", "Taurus", 2, 22),
  planet("Mars", "Gemini", 3, 8),
  planet("Mercury", "Cancer", 4, 28),
  planet("Jupiter", "Leo", 5, 3),
  planet("Venus", "Virgo", 6, 11),
  planet("Saturn", "Libra", 7, 25),
];

describe("chara karaka sapta", () => {
  it("orders seven karakas by in-sign degree descending", () => {
    const result = computeCharaKarakas(SAMPLE, { convention: "sapta" });
    expect(result.convention).toBe("sapta");
    expect(result.rows).toHaveLength(7);
    expect(result.byCode.AK?.planet).toBe("Mercury");
    expect(result.byCode.AmK?.planet).toBe("Saturn");
    expect(result.byCode.BK?.planet).toBe("Moon");
    expect(result.byCode.MK?.planet).toBe("Sun");
    expect(result.byCode.PiK?.planet).toBe("Venus");
    expect(result.byCode.PK?.planet).toBe("Mars");
    expect(result.byCode.DK?.planet).toBe("Jupiter");
    expect(result.byCode.GK).toBeUndefined();
    expect(result.conventionLabel).toMatch(/7 Chara Karakas/);
  });

  it("uses full longitude precision not rounded display", () => {
    const tight = [
      planet("Sun", "Aries", 1, 10.0001),
      planet("Moon", "Taurus", 2, 10.0002),
      planet("Mars", "Gemini", 3, 1),
      planet("Mercury", "Cancer", 4, 2),
      planet("Jupiter", "Leo", 5, 3),
      planet("Venus", "Virgo", 6, 4),
      planet("Saturn", "Libra", 7, 5),
    ];
    const result = computeCharaKarakas(tight);
    expect(result.byCode.AK?.planet).toBe("Moon");
    expect(result.byCode.AmK?.planet).toBe("Sun");
  });

  it("flags equal ranking degrees without dropping a karaka", () => {
    const tied = SAMPLE.map((p) => (p.planet === "Sun" ? { ...p, longitude: 0 * 30 + 22 } : p));
    const result = computeCharaKarakas(tied);
    const moon = result.rows.find((r) => r.planet === "Moon");
    const sun = result.rows.find((r) => r.planet === "Sun");
    expect(moon?.degree.rankingDegree).toBeCloseTo(sun?.degree.rankingDegree ?? -1, 5);
    expect(moon?.tiedWith).toContain("Sun");
    expect(result.rows).toHaveLength(7);
  });

  it("does not include Rahu or Ketu in sapta", () => {
    const withNodes = [
      ...SAMPLE,
      planet("Rahu", "Scorpio", 8, 29),
      planet("Ketu", "Taurus", 2, 29),
    ];
    const result = computeCharaKarakas(withNodes, { convention: "sapta" });
    expect(result.rows.every((r) => r.planet !== "Rahu" && r.planet !== "Ketu")).toBe(true);
  });
});

describe("chara karaka ashta", () => {
  it("includes Rahu ranked at 30 minus degree and excludes Ketu", () => {
    const withRahu = [...SAMPLE, planet("Rahu", "Scorpio", 8, 2)];
    const result = computeCharaKarakas(withRahu, { convention: "ashta" });
    expect(result.convention).toBe("ashta");
    expect(result.rows).toHaveLength(8);
    expect(result.byCode.GK).toBeDefined();
    expect(result.byCode.DK).toBeDefined();
    expect(result.rows.some((r) => r.planet === "Rahu")).toBe(true);
    expect(result.rows.some((r) => r.planet === "Ketu")).toBe(false);
    const rahu = result.rows.find((r) => r.planet === "Rahu");
    expect(rahu?.degree.rankingDegree).toBeCloseTo(28, 5);
    expect(rahu?.degree.degreeInSign).toBeCloseTo(2, 5);
  });

  it("applies remaining-longitude mode to retrograde grahas but not mixed conventions", () => {
    const rx = SAMPLE.map((p) =>
      p.planet === "Mars" ? { ...p, isRetrograde: true, longitude: 2 * 30 + 1 } : p,
    );
    const direct = computeCharaKarakas(rx, { convention: "sapta", retrogradeMode: "direct" });
    const remaining = computeCharaKarakas(rx, {
      convention: "sapta",
      retrogradeMode: "remaining",
    });
    expect(direct.convention).toBe("sapta");
    expect(remaining.convention).toBe("sapta");
    expect(direct.byCode.AK?.planet).toBe("Mercury");
    expect(remaining.byCode.AK?.planet).toBe("Mars");
    expect(rankingDegreeForPlanet("Mars", 2 * 30 + 1, true, "sapta", "remaining")).toBeCloseTo(
      29,
      5,
    );
  });
});

describe("jaimini aspects and dara", () => {
  it("applies rashi drishti for movable to non-adjacent fixed", () => {
    expect(jaiminiAspectsSign("Aries", "Leo")).toBe(true);
    expect(jaiminiAspectsSign("Aries", "Taurus")).toBe(false);
    expect(jaiminiAspectsSign("Gemini", "Virgo")).toBe(true);
    expect(jaiminiAspectsSign("Gemini", "Gemini")).toBe(false);
  });

  it("builds dara analysis from DK without absolute marriage claims", () => {
    const result = computeCharaKarakas(SAMPLE);
    const dara = interpretDarakaraka(result, SAMPLE, "Aries", {
      lagnaDegree: 10,
      lagnaLongitude: 10,
    });
    expect(dara?.row.planet).toBe("Jupiter");
    expect(dara?.disclaimer.toLowerCase()).toMatch(/one jaimini indicator/);
    expect(dara?.partnerArchetype.toLowerCase()).not.toMatch(/you will marry/);
  });
});
