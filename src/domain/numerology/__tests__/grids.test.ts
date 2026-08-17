import { describe, expect, it } from "vitest";
import {
  buildLoshuGrid,
  calculateChaldeanNameNumber,
  calculatePersonalYear,
  compoundBhagyank,
} from "../grids";

describe("loshu and extras", () => {
  it("places date digits on the Lo Shu grid", () => {
    // 15/06/1990 → 1,5,0,6,1,9,9,0 → digits 1,5,6,1,9,9
    const grid = buildLoshuGrid(15, 6, 1990);
    expect(grid.counts[1]).toBe(2);
    expect(grid.counts[5]).toBe(1);
    expect(grid.counts[6]).toBe(1);
    expect(grid.counts[9]).toBe(2);
    expect(grid.missing).toEqual([2, 3, 4, 7, 8]);
    expect(grid.repeated).toEqual([1, 9]);
  });

  it("computes compound Bhagyank as the unreduced digit total", () => {
    expect(compoundBhagyank(15, 6, 1990)).toBe(31);
  });

  it("computes personal year from day, month, and calendar year", () => {
    // 15 + 6 + 2026 → 1+5+6+2+0+2+6 = 22 → 4
    expect(calculatePersonalYear(15, 6, 2026)).toBe(4);
  });

  it("computes Chaldean name number", () => {
    const result = calculateChaldeanNameNumber("Ram");
    expect(result).not.toBeNull();
    // R=2, A=1, M=4 → 7
    expect(result?.compound).toBe(7);
    expect(result?.number).toBe(7);
    expect(result?.planet).toBe("Ketu");
  });

  it("returns null for a name with no letters", () => {
    expect(calculateChaldeanNameNumber("123")).toBeNull();
  });
});
