/**
 * Deterministic, pure functions for Vedic numerology calculations.
 * Source-of-truth for Mulank and Bhagyank — no planetary data here.
 */

import type { MasterNumber, NumerologyDateInput } from "./types";

/** MASTER_NUMBERS are preserved in Bhagyank reduction (not collapsed to 1/2/4). */
export const MASTER_NUMBERS = [11, 22] as const;

export function isMasterNumber(n: number): n is MasterNumber {
  return (MASTER_NUMBERS as readonly number[]).includes(n);
}

/** Sum every digit of a non-negative integer. */
export function digitSum(n: number): number {
  return Math.abs(Math.trunc(n))
    .toString()
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
}

/**
 * Reduce to a single 1-9 digit, optionally preserving master numbers (11, 22).
 * Never returns 0 — dates that would collapse to 0 stay at 9 (traditional).
 */
export function reduceToSingle(n: number, opts?: { preserveMasters?: boolean }): number {
  let value = n;
  const preserve = opts?.preserveMasters ?? false;
  if (preserve && isMasterNumber(value)) return value;
  while (value > 9) {
    value = digitSum(value);
    if (preserve && isMasterNumber(value)) return value;
  }
  if (value === 0) return 9;
  return value;
}

/** Clamp + validate a calendar day/month/year. */
export function validateDateParts(day: number, month: number, year: number): void {
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    throw new Error("Invalid numerology date parts");
  }
  if (day < 1 || day > 31) throw new Error("Day must be 1-31");
  if (month < 1 || month > 12) throw new Error("Month must be 1-12");
  if (year < 1900 || year > 2100) throw new Error("Year out of supported range");
}

/**
 * Mulank / Birth Root Number: sum of the digits of the birth DAY, reduced to 1-9.
 * e.g. 24 → 2+4 = 6 ; 28 → 2+8 = 10 → 1
 */
export function calculateMulank(day: number, opts?: { preserveMasters?: boolean }): number {
  validateDateParts(day, 1, 2000);
  return reduceToSingle(digitSum(day), opts);
}

/**
 * Bhagyank / Life Path Number: sum of every digit across day, month, year,
 * reduced to 1-9 (masters 11/22 preserved when requested).
 * e.g. 24/06/2003 → 2+4+0+6+2+0+0+3 = 17 → 1+7 = 8
 */
export function calculateBhagyank(
  day: number,
  month: number,
  year: number,
  opts?: { preserveMasters?: boolean },
): number {
  validateDateParts(day, month, year);
  const total = digitSum(day) + digitSum(month) + digitSum(year);
  return reduceToSingle(total, opts);
}

/** Format a Date's calendar day as DD / MM / YYYY strings (UTC). */
export function dateToNumerologyInput(date: Date): NumerologyDateInput {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

/** Human-readable calculation trace for the "How was this calculated?" section. */
export type CalculationTrace = {
  day: number;
  month: number;
  year: number;
  dateDisplay: string;
  mulank: { result: number; steps: string };
  bhagyank: { result: number; steps: string };
};

export function calculationTrace(
  day: number,
  month: number,
  year: number,
  opts?: { preserveMasters?: boolean },
): CalculationTrace {
  validateDateParts(day, month, year);
  const dayStr = String(day).padStart(2, "0");
  const monthStr = String(month).padStart(2, "0");
  const dateDisplay = `${dayStr}/${monthStr}/${year}`;

  const dayDigits = digitSum(day);
  const mulankResult = calculateMulank(day, opts);
  const mulankSteps = `${dayStr.replace(/\D/g, "").split("").join(" + ")} = ${dayDigits}${
    mulankResult !== dayDigits ? ` → ${mulankResult}` : ""
  }`;

  const monthDigits = digitSum(month);
  const yearDigits = digitSum(year);
  const rawTotal = dayDigits + monthDigits + yearDigits;
  const bhagyankResult = calculateBhagyank(day, month, year, opts);

  const allDigits = `${dayStr}${monthStr}${String(year)}`
    .split("")
    .filter((ch) => /\d/.test(ch))
    .join(" + ");
  const bhagyankSteps = `${allDigits} = ${rawTotal}${
    bhagyankResult !== rawTotal ? ` → ${bhagyankResult}` : ""
  }`;

  return {
    day,
    month,
    year,
    dateDisplay,
    mulank: {
      result: mulankResult,
      steps: mulankSteps,
    },
    bhagyank: {
      result: bhagyankResult,
      steps: bhagyankSteps,
    },
  };
}
