import { describe, expect, it } from "vitest";

import { withVedicDisclaimer, VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { vedaAgents } from "@/mastra/agents/veda-agents";

describe("Module 7 — Mastra AI layer", () => {
  it("registers all specialized agents", () => {
    expect(Object.keys(vedaAgents)).toEqual(
      expect.arrayContaining([
        "HOROSCOPE",
        "COMPATIBILITY",
        "MARRIAGE_TIMING",
        "RELATIONSHIP_COACH",
        "PROFILE_ANALYSIS",
        "SEARCH",
        "RECOMMENDATION",
        "NOTIFICATION",
        "REPORT",
        "SUPPORT",
      ]),
    );
  });

  it("appends the required Vedic disclaimer exactly once", () => {
    const once = withVedicDisclaimer("Moon–Venus harmony supports warmth.");
    expect(once).toContain(VEDIC_AI_DISCLAIMER);
    const twice = withVedicDisclaimer(once);
    expect(twice.split(VEDIC_AI_DISCLAIMER).length - 1).toBe(1);
  });
});
