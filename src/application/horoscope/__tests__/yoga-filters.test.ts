import { describe, expect, it } from "vitest";

import {
  getYogaCategory,
  isRajaStyleYoga,
  partitionYogas,
} from "@/application/horoscope/yoga-filters";

describe("yoga filters", () => {
  it("detects raja-style yogas", () => {
    expect(isRajaStyleYoga({ name: "Raja Yoga", code: "RAJA_YOGA" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Gajakesari Yoga", code: "GAJAKESARI" })).toBe(true);
    expect(isRajaStyleYoga({ name: "Kemadruma", code: "KEMADRUMA" })).toBe(false);
  });

  it("partitions raja vs other", () => {
    const { rajaYogas, otherYogas } = partitionYogas([
      { name: "Raja Yoga", code: "RAJA_YOGA" },
      { name: "Budhaditya", code: "BUDHADITYA" },
      { name: "Other", code: "OTHER" },
    ]);
    expect(rajaYogas).toHaveLength(2);
    expect(otherYogas).toHaveLength(1);
  });

  it("groups yogas into display categories", () => {
    expect(getYogaCategory({ name: "Raja Yoga (Kendra-Trikona)", code: "RAJA_YOGA" })).toBe(
      "Raja Yoga",
    );
    expect(getYogaCategory({ name: "Gaja Kesari Yoga", code: "GAJAKESARI" })).toBe("Raja Yoga");
    expect(getYogaCategory({ name: "Dhana Yoga (11th lord in Kendra)", code: "DHANA_YOGA" })).toBe(
      "Dhana Yoga",
    );
    expect(getYogaCategory({ name: "Hamsa Yoga", code: "HAMSA" })).toBe("Pancha Mahapurusha");
    expect(getYogaCategory({ name: "Adhi Yoga", code: "ADHI" })).toBe("Lunar Yoga");
    expect(getYogaCategory({ name: "Vesi Yoga (Sun)", code: "VESI" })).toBe("Solar Yoga");
    expect(getYogaCategory({ name: "Maala Yoga (Dala)", code: "NABHASA_DALA" })).toBe(
      "Nabhasa Yoga",
    );
    expect(getYogaCategory({ name: "Saraswati Yoga", code: "SARASWATI" })).toBe("Planetary Yoga");
    expect(getYogaCategory({ name: "Ascendant established", code: "LAGNA_SET" })).toBe("Other");
  });

  it("falls back to name matching when the code is unknown", () => {
    expect(getYogaCategory({ name: "Neecha Bhanga Raja Yoga (Mars)", code: "CUSTOM" })).toBe(
      "Raja Yoga",
    );
    expect(getYogaCategory({ name: "Kemadruma Yoga", code: "CUSTOM" })).toBe("Lunar Yoga");
  });
});
