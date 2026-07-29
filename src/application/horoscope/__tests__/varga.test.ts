import { describe, expect, it } from "vitest";

import { longitudeToVargaSign } from "@/application/horoscope/varga";
import { buildVargaNorthChart } from "@/application/horoscope/chart-variants";
import type { ChartPlanet } from "@/application/horoscope/chart-builder";

describe("varga mappings", () => {
  it("maps D10 dasamsa for odd and even signs", () => {
    // Aries 0°–3° → first dasamsa = Aries (odd from self)
    expect(longitudeToVargaSign(1, 10).sign).toBe("Aries");
    // Taurus 0°–3° → even from 9th = Capricorn
    expect(longitudeToVargaSign(30 + 1, 10).sign).toBe("Capricorn");
  });

  it("maps D3 drekkana thirds", () => {
    expect(longitudeToVargaSign(5, 3).sign).toBe("Aries");
    expect(longitudeToVargaSign(15, 3).sign).toBe("Leo");
    expect(longitudeToVargaSign(25, 3).sign).toBe("Sagittarius");
  });

  it("maps D30 trimsamsa odd-sign ranges", () => {
    expect(longitudeToVargaSign(2, 30).sign).toBe("Aries");
    expect(longitudeToVargaSign(7, 30).sign).toBe("Aquarius");
    expect(longitudeToVargaSign(12, 30).sign).toBe("Sagittarius");
  });

  it("maps D11 rudramsa", () => {
    expect(longitudeToVargaSign(1, 11).sign).toBe("Aries");
  });

  it("builds a D10 north chart with planets", () => {
    const planets = [
      {
        planet: "Sun",
        sign: "Aries",
        signId: 0,
        house: 1,
        longitude: 12,
        latitude: 0,
        speed: 1,
        isRetrograde: false,
        nakshatra: "Ashwini",
        nakshatraPada: 1,
        dignity: null,
      },
      {
        planet: "Moon",
        sign: "Cancer",
        signId: 3,
        house: 4,
        longitude: 100,
        latitude: 0,
        speed: 12,
        isRetrograde: false,
        nakshatra: "Pushya",
        nakshatraPada: 1,
        dignity: null,
      },
    ] as ChartPlanet[];

    const chart = buildVargaNorthChart({
      planets,
      lagnaSign: "Aries",
      lagnaDegree: 10,
      varga: 10,
    });
    expect(chart.reference).toMatch(/Dasamsa|D10/i);
    expect(chart.houses).toBeTruthy();
    expect(Object.keys(chart.houses).length).toBe(12);
  });
});
