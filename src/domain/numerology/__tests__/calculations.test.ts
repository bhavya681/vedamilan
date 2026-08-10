import { describe, expect, it } from "vitest";

import {
  calculateBhagyank,
  calculateMulank,
  calculationTrace,
  dateToNumerologyInput,
  digitSum,
  isMasterNumber,
  reduceToSingle,
} from "@/domain/numerology";

describe("numerology calculations", () => {
  describe("digitSum", () => {
    it("sums all digits of a number", () => {
      expect(digitSum(15)).toBe(6);
      expect(digitSum(123)).toBe(6);
      expect(digitSum(0)).toBe(0);
      expect(digitSum(99)).toBe(18);
    });

    it("handles multi-digit intermediate results", () => {
      expect(digitSum(2512)).toBe(10);
      expect(digitSum(281999)).toBe(38);
    });
  });

  describe("reduceToSingle", () => {
    it("reduces numbers to a single digit (1-9) by default", () => {
      expect(reduceToSingle(10)).toBe(1);
      expect(reduceToSingle(18)).toBe(9);
      expect(reduceToSingle(34)).toBe(7);
    });

    it("collapses master numbers 11 and 22 by default", () => {
      expect(reduceToSingle(11)).toBe(2);
      expect(reduceToSingle(22)).toBe(4);
    });

    it("preserves master numbers when preserveMasters is true", () => {
      expect(reduceToSingle(11, { preserveMasters: true })).toBe(11);
      expect(reduceToSingle(22, { preserveMasters: true })).toBe(22);
    });

    it("collapses masters even when preserved if they result from further reduction and collapseMaster is set", () => {
      expect(reduceToSingle(29, { preserveMasters: true })).toBe(11);
      expect(reduceToSingle(29)).toBe(2);
    });

    it("returns 1-9 unchanged", () => {
      for (let n = 1; n <= 9; n++) {
        expect(reduceToSingle(n)).toBe(n);
      }
    });

    it("maps 0 to 9 (traditional)", () => {
      expect(reduceToSingle(0)).toBe(9);
    });
  });

  describe("calculateMulank", () => {
    it("uses birth day only, reduced to 1-9", () => {
      expect(calculateMulank(15)).toBe(6);
      expect(calculateMulank(1)).toBe(1);
      expect(calculateMulank(9)).toBe(9);
      expect(calculateMulank(28)).toBe(1);
    });

    it("collapses master-number days by default", () => {
      expect(calculateMulank(11)).toBe(2);
      expect(calculateMulank(22)).toBe(4);
    });

    it("preserves master-number days that produce 11 or 22 via digit sum", () => {
      // Day 29 → 2+9 = 11 (master)
      expect(calculateMulank(29, { preserveMasters: true })).toBe(11);
      // Day 29 collapsed = 2
      expect(calculateMulank(29)).toBe(2);
      // Day 11 → 1+1 = 2 (no master number arises)
      expect(calculateMulank(11)).toBe(2);
      expect(calculateMulank(11, { preserveMasters: true })).toBe(2);
    });
  });

  describe("calculateBhagyank", () => {
    it("sums day, month, and year digits, reduced to 1-9", () => {
      // 15/6/1990 → digits 1+5+0+6+1+9+9+0 = 31 → 3+1 = 4
      expect(calculateBhagyank(15, 6, 1990)).toBe(4);
    });

    it("collapses master-number results by default", () => {
      // 13/9/1987 → 1+3+0+9+1+9+8+7 = 38 → 3+8 = 11 → 1+1 = 2
      expect(calculateBhagyank(13, 9, 1987)).toBe(2);
    });

    it("preserves master numbers when preserveMasters is true", () => {
      // The intermediate sum is 38 → 11, which is preserved
      expect(calculateBhagyank(13, 9, 1987, { preserveMasters: true })).toBe(11);
    });
  });

  describe("dateToNumerologyInput", () => {
    it("extracts UTC day, month, year from a Date", () => {
      const d = new Date("1990-06-15T05:30:00Z");
      expect(dateToNumerologyInput(d)).toEqual({ day: 15, month: 6, year: 1990 });
    });

    it("handles end-of-year dates", () => {
      const d = new Date("1999-12-31T23:59:59Z");
      expect(dateToNumerologyInput(d)).toEqual({ day: 31, month: 12, year: 1999 });
    });

    it("throws on invalid date", () => {
      expect(() => dateToNumerologyInput(new Date("invalid"))).toThrow("Invalid date object");
    });
  });

  describe("calculationTrace", () => {
    it("produces a full trace for a known date", () => {
      const trace = calculationTrace(15, 6, 1990);

      expect(trace.day).toBe(15);
      expect(trace.month).toBe(6);
      expect(trace.year).toBe(1990);
      expect(trace.dateDisplay).toBe("15/06/1990");

      expect(trace.mulank).toEqual({
        result: 6,
        steps: "1 + 5 = 6",
      });

      expect(trace.bhagyank).toEqual({
        result: 4,
        steps: "1 + 5 + 0 + 6 + 1 + 9 + 9 + 0 = 31 → 4",
      });
    });

    it("shows DD/MM/YYYY date display", () => {
      const trace = calculationTrace(13, 9, 1987);
      expect(trace.dateDisplay).toBe("13/09/1987");
    });

    it("preserves master numbers in trace when preserveMasters is true", () => {
      const trace = calculationTrace(13, 9, 1987, { preserveMasters: true });
      expect(trace.bhagyank.result).toBe(11);
    });

    it("includes steps showing the digit breakdown", () => {
      const trace = calculationTrace(28, 3, 2000);
      // day 28 → 2+8 = 10 → 1
      expect(trace.mulank.steps).toBe("2 + 8 = 10 → 1");
      expect(trace.mulank.result).toBe(1);
    });
  });

  describe("isMasterNumber", () => {
    it("returns true for 11 and 22", () => {
      expect(isMasterNumber(11)).toBe(true);
      expect(isMasterNumber(22)).toBe(true);
    });

    it("returns false for regular numbers", () => {
      expect(isMasterNumber(1)).toBe(false);
      expect(isMasterNumber(9)).toBe(false);
      expect(isMasterNumber(10)).toBe(false);
    });
  });
});
