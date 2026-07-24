import { describe, expect, it } from "vitest";

import { computeArudhaMap, classifyArudhaAxis } from "@/application/horoscope/arudha-pada";
import { buildNavamsaChart } from "@/application/horoscope/navamsa-chart";
import {
  AMD_METHODOLOGY_VERSION,
  scoreAdvancedMarriageDynamics,
} from "@/application/rules/advanced-marriage-dynamics";
import type { ChartPlanetLite } from "@/application/rules/shukra-milan";

function sampleChart(overrides?: {
  lagnaSign?: string;
  moonSign?: string;
  planets?: ChartPlanetLite[];
}) {
  const lagnaSign = overrides?.lagnaSign || "Aries";
  const planets: ChartPlanetLite[] = overrides?.planets || [
    { planet: "Sun", sign: "Leo", house: 5, longitude: 120.5, dignity: "Own" },
    {
      planet: "Moon",
      sign: overrides?.moonSign || "Cancer",
      house: 4,
      longitude: 95.2,
      nakshatra: "Pushya",
      dignity: "Own",
    },
    { planet: "Mars", sign: "Aries", house: 1, longitude: 12.1, dignity: "Own" },
    { planet: "Mercury", sign: "Virgo", house: 6, longitude: 155.4 },
    { planet: "Jupiter", sign: "Sagittarius", house: 9, longitude: 248.3, dignity: "Own" },
    { planet: "Venus", sign: "Taurus", house: 2, longitude: 42.8, dignity: "Own" },
    { planet: "Saturn", sign: "Capricorn", house: 10, longitude: 280.1, dignity: "Own" },
    { planet: "Rahu", sign: "Gemini", house: 3, longitude: 68.0 },
    { planet: "Ketu", sign: "Sagittarius", house: 9, longitude: 248.0 },
  ];

  return {
    lagnaSign,
    lagnaDegree: 18.5,
    lagnaLongitude: 18.5,
    moonSign: overrides?.moonSign || "Cancer",
    sunSign: "Leo",
    manglikStatus: "NON_MANGLIK",
    planets,
    houseLords: { "1": "Mars", "2": "Venus", "7": "Venus" },
  };
}

describe("Advanced Marriage Dynamics — full engine", () => {
  it("builds D9 and Arudha maps deterministically", () => {
    const d9 = buildNavamsaChart({
      lagnaSign: "Aries",
      lagnaDegree: 18.5,
      lagnaLongitude: 18.5,
      planets: sampleChart().planets,
    });
    expect(d9.planets.length).toBeGreaterThan(5);

    const arudha = computeArudhaMap({
      lagnaSign: "Aries",
      planets: sampleChart().planets,
    });
    expect(arudha.arudhaLagna).toBeTruthy();
    expect(arudha.arudhaSeventh).toBeTruthy();
    const axis = classifyArudhaAxis(arudha.arudhaLagna, arudha.arudhaSeventh);
    expect(["supportive", "challenging", "neutral"]).toContain(axis.classification);
  });

  it("returns all Phase 1–3 modules with version amd-2.0.0", () => {
    const chartBPlanets = sampleChart().planets.map((p) =>
      p.planet === "Moon"
        ? { ...p, sign: "Taurus", house: 8, longitude: 45.2, nakshatra: "Rohini" }
        : p.planet === "Venus"
          ? { ...p, sign: "Libra", house: 1, longitude: 190.4 }
          : p,
    );

    const result = scoreAdvancedMarriageDynamics({
      chartA: sampleChart(),
      chartB: sampleChart({
        lagnaSign: "Libra",
        moonSign: "Taurus",
        planets: chartBPlanets,
      }),
      gunaBreakdown: [
        { koota: "Yoni", score: 3, max: 4, note: "Friendly yoni" },
        { koota: "Nadi", score: 8, max: 8, note: "Clear" },
      ],
      nakshatraA: "Pushya",
      nakshatraB: "Rohini",
      ashtaYoni: {
        you: { name: "Goat", emoji: "🐐", energy: "Nurturing" },
        them: { name: "Serpent", emoji: "🐍", energy: "Intense" },
        score: 3,
        harmony: "Friendly",
      },
      dashaA: { currentMaha: "Venus", currentAntar: "Moon" },
      dashaB: { currentMaha: "Jupiter", currentAntar: "Saturn" },
      gocharAvailable: true,
    });

    expect(result.methodologyVersion).toBe(AMD_METHODOLOGY_VERSION);
    expect(AMD_METHODOLOGY_VERSION).toBe("amd-2.0.0");

    const m = result.modules;
    expect(m.d1Foundation.id).toBe("d1Foundation");
    expect(m.d9Marriage.id).toBe("d9Marriage");
    expect(m.venusDynamics.weighting).toEqual({ signWeight: 70, houseWeight: 30 });
    expect(m.moonEmotional.personANeeds.length).toBeGreaterThan(0);
    expect(m.houseTriad.id).toBe("houseTriad");
    expect(m.lagnaCompatibility.naturalAlignment.length).toBeGreaterThan(0);
    expect(m.selfPartnerAxis.signInsights.length).toBeGreaterThanOrEqual(0);
    expect(m.yoniIntimacy.yoniA.name).toBe("Goat");
    expect(m.saturnResponsibility.constructive.length).toBeGreaterThan(0);
    expect(m.ninthSeventh.id).toBe("ninthSeventh");
    expect(m.arudha.facts.alA).toBeTruthy();
    expect(m.relationshipBalance.balanceLabel).toBeTruthy();
    expect(m.timingActivation.activationNotes.length).toBeGreaterThan(0);
    expect(m.timingActivation.gocharStatus).toMatch(/Gochar/i);
    expect(result.disclaimer).toMatch(/not a guarantee/i);
    expect((result as { overallScore?: number }).overallScore).toBeUndefined();
  });
});
