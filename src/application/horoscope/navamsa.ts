import { SIGNS } from "@/application/horoscope/vedic-constants";

/** Classical Navamsa (D9) sign from sidereal longitude. */
export function longitudeToNavamsaSign(longitude: number): {
  sign: string;
  signId: number;
} {
  const norm = ((longitude % 360) + 360) % 360;
  const signId = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const pada = Math.min(8, Math.floor(degInSign / (30 / 9)));
  // Movable signs start navamsa from same sign; fixed from 9th; dual from 5th
  const movable = [0, 3, 6, 9];
  const fixed = [1, 4, 7, 10];
  let start = 0;
  if (movable.includes(signId)) start = signId;
  else if (fixed.includes(signId)) start = (signId + 8) % 12;
  else start = (signId + 4) % 12;
  const d9Id = (start + pada) % 12;
  return { sign: SIGNS[d9Id] ?? "Aries", signId: d9Id };
}
