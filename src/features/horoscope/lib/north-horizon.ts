import { NAKSHATRAS, SIGNS, longitudeToNakshatra } from "@/application/horoscope/vedic-constants";

export const SIGN_ABBR = [
  "Ar",
  "Ta",
  "Ge",
  "Cn",
  "Le",
  "Vi",
  "Li",
  "Sc",
  "Sg",
  "Cp",
  "Aq",
  "Pi",
] as const;

export type HorizonRole =
  "rising" | "about-to-rise" | "culminating" | "setting" | "above" | "below";

export type SkyPlanet = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  nakshatraPada?: number;
  longitude: number;
  dignity?: string | null;
  isRetrograde?: boolean;
};

export type AlignmentPair = {
  a: string;
  b: string;
  orb: number;
};

/** North Indian sky: Lagna / East at the top, houses increase anti-clockwise. */
export function northHorizonPoint(
  longitude: number,
  lagnaLongitude: number,
  cx: number,
  cy: number,
  radius: number,
) {
  const deg = (((longitude - lagnaLongitude) % 360) + 360) % 360;
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx - radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
    deg,
  };
}

export function lagnaLongitudeFromChart(input: {
  lagnaSign?: string | null;
  lagnaDegree?: number | null;
  lagnaSignId?: number | null;
}) {
  const fromName = input.lagnaSign ? SIGNS.indexOf(input.lagnaSign as (typeof SIGNS)[number]) : -1;
  const signId = fromName >= 0 ? fromName : (((input.lagnaSignId ?? 0) % 12) + 12) % 12;
  const deg =
    typeof input.lagnaDegree === "number" && Number.isFinite(input.lagnaDegree)
      ? ((input.lagnaDegree % 30) + 30) % 30
      : 15;
  return signId * 30 + deg;
}

export function planetLongitudeFallback(sign: string, houseHint = 15) {
  const signId = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  const idx = signId >= 0 ? signId : 0;
  return idx * 30 + Math.min(29.9, Math.max(0, houseHint));
}

export function horizonRole(house: number): HorizonRole {
  if (house === 1) return "rising";
  if (house === 12) return "about-to-rise";
  if (house === 10) return "culminating";
  if (house === 7) return "setting";
  if (house >= 8 && house <= 11) return "above";
  return "below";
}

export function horizonRoleLabel(role: HorizonRole) {
  switch (role) {
    case "rising":
      return "Rising (East)";
    case "about-to-rise":
      return "About to rise";
    case "culminating":
      return "Culminating (South)";
    case "setting":
      return "Setting (West)";
    case "above":
      return "Above horizon";
    default:
      return "Below horizon";
  }
}

export function angularSep(a: number, b: number) {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

export function conjunctionAlignments(planets: SkyPlanet[], orb = 8): AlignmentPair[] {
  const pairs: AlignmentPair[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i]!;
      const b = planets[j]!;
      if (
        (a.planet === "Rahu" && b.planet === "Ketu") ||
        (a.planet === "Ketu" && b.planet === "Rahu")
      ) {
        continue;
      }
      const sep = angularSep(a.longitude, b.longitude);
      if (sep <= orb) pairs.push({ a: a.planet, b: b.planet, orb: Math.round(sep * 10) / 10 });
    }
  }
  return pairs.sort((x, y) => x.orb - y.orb);
}

export function nakshatraAt(longitude: number) {
  return longitudeToNakshatra(longitude);
}

export function nakshatraSpanDeg() {
  return 360 / NAKSHATRAS.length;
}

export function rashiArc(signId: number, lagnaLongitude: number) {
  const start = (((signId * 30 - lagnaLongitude) % 360) + 360) % 360;
  return {
    start,
    end: (start + 30) % 360,
    sign: SIGNS[signId] ?? "Aries",
    abbr: SIGN_ABBR[signId] ?? "Ar",
  };
}

export function ringSectorPath(
  startLon: number,
  span: number,
  lagnaLon: number,
  rInner: number,
  rOuter: number,
  cx: number,
  cy: number,
) {
  const a0 = northHorizonPoint(startLon, lagnaLon, cx, cy, rOuter);
  const a1 = northHorizonPoint(startLon + span, lagnaLon, cx, cy, rOuter);
  const b1 = northHorizonPoint(startLon + span, lagnaLon, cx, cy, rInner);
  const b0 = northHorizonPoint(startLon, lagnaLon, cx, cy, rInner);
  return `M ${a0.x.toFixed(2)} ${a0.y.toFixed(2)} A ${rOuter} ${rOuter} 0 0 0 ${a1.x.toFixed(2)} ${a1.y.toFixed(2)} L ${b1.x.toFixed(2)} ${b1.y.toFixed(2)} A ${rInner} ${rInner} 0 0 1 ${b0.x.toFixed(2)} ${b0.y.toFixed(2)} Z`;
}
