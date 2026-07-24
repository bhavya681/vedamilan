import { describe, expect, it } from "vitest";

import { remediesForDoshas, REMEDY_DISCLAIMER } from "@/application/horoscope/remedy-themes";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";

describe("remedy themes", () => {
  it("only maps present doshas", () => {
    const themes = remediesForDoshas([
      { code: "MANGLIK", present: true },
      { code: "KAAL_SARPA", present: false },
      { code: "UNKNOWN", present: true },
    ]);
    expect(themes).toHaveLength(1);
    expect(themes[0]?.planetaryFactor).toMatch(/Mars/i);
    expect(REMEDY_DISCLAIMER.length).toBeGreaterThan(20);
  });
});

describe("rate limit", () => {
  it("blocks after exceeding the window", async () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    await enforceRateLimit({ key, limit: 2, windowSec: 60 });
    await enforceRateLimit({ key, limit: 2, windowSec: 60 });
    await expect(enforceRateLimit({ key, limit: 2, windowSec: 60 })).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });
});
