import { describe, expect, it } from "vitest";

import { MATCH_SCORE, COMPATIBILITY_SCORE } from "@/lib/constants/score-labels";

describe("Sprint 1 — score label copy", () => {
  it("keeps match and compatibility meanings distinct", () => {
    expect(MATCH_SCORE.label).toMatch(/match/i);
    expect(COMPATIBILITY_SCORE.label).toMatch(/compatibility/i);
    expect(MATCH_SCORE.meaning).toMatch(/kundli|core|chart/i);
    expect(COMPATIBILITY_SCORE.meaning).toMatch(/align|deep|chart/i);
    expect(MATCH_SCORE.detail).not.toEqual(COMPATIBILITY_SCORE.detail);
    expect(MATCH_SCORE.labelKey).toBe("compatibility.score.matchLabel");
    expect(COMPATIBILITY_SCORE.labelKey).toBe("compatibility.score.compatLabel");
  });
});
