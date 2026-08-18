/**
 * Spherical-astronomy helpers for the North Horizon view.
 * Planet longitudes still come from Swiss Ephemeris; this only converts
 * ecliptic → equatorial → local altitude/azimuth.
 */

export function norm360(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function angularDiff(a: number, b: number) {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d);
}

/** Shortest-path interpolation on a 0–360° circle. */
export function lerpAngle(from: number, to: number, t: number) {
  const delta = ((to - from + 540) % 360) - 180;
  return norm360(from + delta * t);
}

/** Mean obliquity of the ecliptic (degrees), IAU 2006 truncated. */
export function meanObliquity(jd: number) {
  const t = (jd - 2451545.0) / 36525;
  return 23.43929111 - 0.01300416667 * t - 1.638e-7 * t * t;
}

/**
 * Greenwich mean sidereal time in degrees (Meeus).
 * Accurate enough for horizon visualization; Swiss Ephemeris remains
 * the source of planetary ecliptic longitudes.
 */
export function greenwichSiderealDeg(jd: number) {
  const t = (jd - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return norm360(gmst);
}

export function eclipticToEquatorial(tropicalLon: number, eclipticLat: number, obliquity: number) {
  const l = degToRad(tropicalLon);
  const b = degToRad(eclipticLat);
  const e = degToRad(obliquity);
  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const sinL = Math.sin(l);
  const cosL = Math.cos(l);
  const sinE = Math.sin(e);
  const cosE = Math.cos(e);
  const dec = Math.asin(sinB * cosE + cosB * sinE * sinL);
  const ra = Math.atan2(sinL * cosE - Math.tan(b) * sinE, cosL);
  return { ra: norm360(radToDeg(ra)), dec: radToDeg(dec) };
}

export function equatorialToHorizontal(ra: number, dec: number, lstDeg: number, latitude: number) {
  const ha = degToRad(norm360(lstDeg - ra));
  const decR = degToRad(dec);
  const lat = degToRad(latitude);
  const sinAlt = Math.sin(decR) * Math.sin(lat) + Math.cos(decR) * Math.cos(lat) * Math.cos(ha);
  const alt = radToDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));
  const az = radToDeg(
    Math.atan2(
      -Math.cos(decR) * Math.sin(ha),
      Math.cos(lat) * Math.sin(decR) - Math.sin(lat) * Math.cos(decR) * Math.cos(ha),
    ),
  );
  return { altitude: alt, azimuth: norm360(az) };
}

export function eclipticToHorizontal(input: {
  tropicalLon: number;
  eclipticLat: number;
  jd: number;
  latitude: number;
  longitude: number;
}) {
  const eps = meanObliquity(input.jd);
  const eq = eclipticToEquatorial(input.tropicalLon, input.eclipticLat, eps);
  const lst = norm360(greenwichSiderealDeg(input.jd) + input.longitude);
  return equatorialToHorizontal(eq.ra, eq.dec, lst, input.latitude);
}

export type HorizonStatus = "rising" | "near-rising" | "setting" | "above" | "below";

export function horizonStatus(
  altitude: number,
  azimuth: number,
  ascAzimuth: number,
  dscAzimuth: number,
): HorizonStatus {
  const nearAsc = angularDiff(azimuth, ascAzimuth) <= 28;
  const nearDsc = angularDiff(azimuth, dscAzimuth) <= 28;
  if (altitude >= -4 && altitude <= 12 && nearAsc) return "rising";
  if (altitude >= -10 && altitude <= 22 && nearAsc) return "near-rising";
  if (altitude >= -4 && altitude <= 12 && nearDsc) return "setting";
  if (altitude > 0) return "above";
  return "below";
}

export function stereographicPoint(
  altitude: number,
  azimuth: number,
  cx: number,
  cy: number,
  rHorizon: number,
) {
  const alt = Math.max(-20, Math.min(90, altitude));
  const r = rHorizon * ((90 - alt) / 90);
  const rad = degToRad(azimuth);
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
    belowHorizon: altitude < 0,
  };
}
