import { SIGNS } from "@/application/horoscope/vedic-constants";

/**
 * Jaimini rashi drishti (sign aspects).
 * Movable signs aspect all fixed except the adjacent fixed.
 * Fixed signs aspect all movable except the adjacent movable.
 * Dual signs aspect the other dual signs (not themselves).
 */
const MOVABLE = new Set([0, 3, 6, 9]);
const FIXED = new Set([1, 4, 7, 10]);
const DUAL = new Set([2, 5, 8, 11]);

function signId(sign: string): number {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

export function jaiminiAspectSignIds(fromSign: string): number[] {
  const from = signId(fromSign);
  if (MOVABLE.has(from)) {
    return [...FIXED].filter((id) => id !== (from + 1) % 12);
  }
  if (FIXED.has(from)) {
    return [...MOVABLE].filter((id) => id !== (from + 11) % 12);
  }
  if (DUAL.has(from)) {
    return [...DUAL].filter((id) => id !== from);
  }
  return [];
}

export function jaiminiAspectsSign(fromSign: string, toSign: string): boolean {
  const to = signId(toSign);
  return jaiminiAspectSignIds(fromSign).includes(to);
}

export type JaiminiLink =
  | { kind: "conjunction"; from: string; to: string; sign: string }
  | { kind: "rashi-drishti"; from: string; to: string; fromSign: string; toSign: string }
  | { kind: "none"; from: string; to: string };

export function karakaLink(
  fromPlanet: string,
  fromSign: string,
  toPlanet: string,
  toSign: string,
): JaiminiLink {
  if (fromPlanet === toPlanet) return { kind: "none", from: fromPlanet, to: toPlanet };
  if (fromSign === toSign) {
    return { kind: "conjunction", from: fromPlanet, to: toPlanet, sign: fromSign };
  }
  if (jaiminiAspectsSign(fromSign, toSign)) {
    return {
      kind: "rashi-drishti",
      from: fromPlanet,
      to: toPlanet,
      fromSign,
      toSign,
    };
  }
  return { kind: "none", from: fromPlanet, to: toPlanet };
}

export function describeLink(link: JaiminiLink): string {
  if (link.kind === "conjunction") {
    return `${link.from} and ${link.to} occupy the same sign (${link.sign}) — a Jaimini conjunction.`;
  }
  if (link.kind === "rashi-drishti") {
    return `${link.from} in ${link.fromSign} aspects ${link.to} in ${link.toSign} by Jaimini rashi drishti.`;
  }
  return `${link.from} and ${link.to} are not joined by conjunction or Jaimini rashi drishti in this chart.`;
}
