import { describe, expect, it } from "vitest";

import { isRajaStyleYoga, partitionYogas } from "@/application/horoscope/yoga-filters";

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
});
