import { describe, expect, it } from "vitest";

import { scoreNumerologyCompatibility } from "@/application/rules/numerology-compatibility";

describe("numerology compatibility scoring", () => {
  describe("score bounds", () => {
    it("returns a score between 0 and 100", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 2,
        mulankB: 3,
        bhagyankB: 4,
      });
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("always returns isHarmonious as a boolean", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 2,
        mulankB: 9,
        bhagyankB: 8,
      });
      expect(typeof result.isHarmonious).toBe("boolean");
    });
  });

  describe("identical numbers", () => {
    it("scores highest when both people share all four numbers", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 3,
        bhagyankA: 3,
        mulankB: 3,
        bhagyankB: 3,
      });
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.isHarmonious).toBe(true);
    });
  });

  describe("complementary planets", () => {
    it("scores well for Fire-Air pairs (Sun + Jupiter)", () => {
      // Mulank 1 (Sun, Fire) vs Mulank 3 (Jupiter, Air) — friendly
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 1,
        mulankB: 3,
        bhagyankB: 3,
      });
      // Friendly planet pair (Sun-Jupiter, Fire-Air) — should score moderately high
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it("scores lower for Fire-Earth conflicts (Sun + Rahu)", () => {
      // Mulank 1 (Sun, Fire) vs Mulank 4 (Rahu, Earth) — less harmonious
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 1,
        mulankB: 4,
        bhagyankB: 4,
      });
      expect(result.score).toBeLessThan(80);
    });
  });

  describe("pair notes", () => {
    it("returns four pair notes with scores and descriptions", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 5,
        bhagyankA: 7,
        mulankB: 6,
        bhagyankB: 8,
      });
      expect(result.pairNotes).toHaveLength(4);
      expect(result.pairNotes[0]).toHaveProperty("pair");
      expect(result.pairNotes[0]).toHaveProperty("score");
      expect(result.pairNotes[0]).toHaveProperty("description");
      expect(result.pairNotes[0].pair).toBe("Mulank–Mulank");
    });

    it("includes cross-resonance pairs", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 2,
        mulankB: 3,
        bhagyankB: 4,
      });
      const pairNames = result.pairNotes.map((p) => p.pair);
      expect(pairNames).toContain("A Mulank ↔ B Bhagyank");
      expect(pairNames).toContain("A Bhagyank ↔ B Mulank");
    });
  });

  describe("insight generation", () => {
    it("produces a strong harmony insight for high scores", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 3,
        bhagyankA: 3,
        mulankB: 3,
        bhagyankB: 3,
      });
      expect(result.insight).toMatch(/strong|harmonic|reinforc/i);
    });

    it("produces a cautionary insight for low scores", () => {
      const result = scoreNumerologyCompatibility({
        mulankA: 1,
        bhagyankA: 9,
        mulankB: 8,
        bhagyankB: 4,
      });
      if (result.score < 45) {
        expect(result.insight).toMatch(/differ|contrast|challenge|conscious/i);
      }
    });
  });

  describe("deterministic", () => {
    it("returns the same result for the same input", () => {
      const input = {
        mulankA: 5,
        bhagyankA: 6,
        mulankB: 7,
        bhagyankB: 8,
      };
      const r1 = scoreNumerologyCompatibility(input);
      const r2 = scoreNumerologyCompatibility(input);
      expect(r1.score).toBe(r2.score);
      expect(r1.insight).toBe(r2.insight);
    });
  });
});
