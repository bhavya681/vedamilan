/**
 * Additive Vedic numerology chart tools used by Indian almanacs:
 * Lo Shu / birth grid, personal year, and Chaldean name number.
 * Does not change Mulank or Bhagyank reduction.
 */

import { NUMEROLOGY_NUMBERS } from "./numbers";
import type { NumberId } from "./types";
import { digitSum, reduceToSingle, validateDateParts } from "./calculations";

/** Lo Shu magic square — cell numbers, top-left to bottom-right. */
export const LOSHU_LAYOUT: NumberId[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export type LoshuGrid = {
  counts: Record<NumberId, number>;
  digits: NumberId[];
  missing: NumberId[];
  repeated: NumberId[];
  present: NumberId[];
};

export function dateDigits(day: number, month: number, year: number): NumberId[] {
  validateDateParts(day, month, year);
  const raw = `${String(day).padStart(2, "0")}${String(month).padStart(2, "0")}${year}`;
  return raw
    .split("")
    .map(Number)
    .filter((n): n is NumberId => n >= 1 && n <= 9);
}

export function buildLoshuGrid(day: number, month: number, year: number): LoshuGrid {
  const digits = dateDigits(day, month, year);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } as Record<
    NumberId,
    number
  >;
  for (const d of digits) counts[d] += 1;
  const all = [1, 2, 3, 4, 5, 6, 7, 8, 9] as NumberId[];
  const missing = all.filter((n) => counts[n] === 0);
  const repeated = all.filter((n) => counts[n] > 1);
  const present = all.filter((n) => counts[n] > 0);
  return { counts, digits, missing, repeated, present };
}

/** Unreduced digit total used as the compound Bhagyank (e.g. 31). */
export function compoundBhagyank(day: number, month: number, year: number): number {
  validateDateParts(day, month, year);
  return digitSum(day) + digitSum(month) + digitSum(year);
}

/**
 * Personal year: day + month + calendar year, reduced 1–9.
 * Same digit method as Bhagyank; year is the year being read, not birth year.
 */
export function calculatePersonalYear(
  day: number,
  month: number,
  calendarYear: number,
  opts?: { preserveMasters?: boolean },
): number {
  validateDateParts(day, month, calendarYear);
  return reduceToSingle(digitSum(day) + digitSum(month) + digitSum(calendarYear), opts);
}

export const PERSONAL_YEAR_THEME: Record<NumberId, string> = {
  1: "Beginnings — start, lead, plant a new cycle",
  2: "Patience — cooperate, wait, tend relationships",
  3: "Expression — create, teach, speak",
  4: "Foundation — build systems and finish work",
  5: "Change — travel, adapt, loosen old forms",
  6: "Responsibility — home, care, and harmony",
  7: "Reflection — study, rest, inner work",
  8: "Harvest — effort, karma, and material results",
  9: "Completion — release, serve, close a chapter",
};

/** Chaldean letter values (no 9). Standard name-number method on Indian numerology sites. */
const CHALDEAN: Record<string, number> = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,
  B: 2,
  K: 2,
  R: 2,
  C: 3,
  G: 3,
  L: 3,
  S: 3,
  D: 4,
  M: 4,
  T: 4,
  E: 5,
  H: 5,
  N: 5,
  X: 5,
  U: 6,
  V: 6,
  W: 6,
  O: 7,
  Z: 7,
  F: 8,
  P: 8,
};

export type NameNumberResult = {
  name: string;
  compound: number;
  number: NumberId;
  planet: string;
  steps: string;
};

export function calculateChaldeanNameNumber(name: string): NameNumberResult | null {
  const letters = name
    .toUpperCase()
    .split("")
    .filter((ch) => /[A-Z]/.test(ch));
  if (letters.length === 0) return null;

  const values = letters.map((ch) => CHALDEAN[ch] ?? 0);
  const compound = values.reduce((sum, n) => sum + n, 0);
  if (compound === 0) return null;
  const number = reduceToSingle(compound) as NumberId;
  const shown = letters.map((ch, i) => `${ch}(${values[i]})`).join(" + ");
  return {
    name: name.trim(),
    compound,
    number,
    planet: NUMEROLOGY_NUMBERS[number].planet,
    steps: `${shown} = ${compound} → ${number}`,
  };
}
