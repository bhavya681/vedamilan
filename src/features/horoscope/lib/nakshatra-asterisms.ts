/** Decorative nakshatra star-shapes for Horizon. Not a star catalog. */

export type AsterismStar = { x: number; y: number; r?: number };
export type Asterism = { stars: AsterismStar[]; lines: Array<[number, number]> };

function a(stars: Array<[number, number, number?]>, lines: Array<[number, number]>): Asterism {
  return {
    stars: stars.map(([x, y, r]) => ({ x, y, r })),
    lines,
  };
}

/** Unit-square stick figures (0–1). Drawn as stars + links when a nakshatra is selected. */
export const NAKSHATRA_ASTERISMS: Record<string, Asterism> = {
  Ashwini: a(
    [
      [0.22, 0.62, 0.55],
      [0.4, 0.38, 0.45],
      [0.58, 0.28, 0.7],
      [0.78, 0.22, 0.4],
      [0.7, 0.48, 0.4],
      [0.48, 0.7, 0.5],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
      [5, 0],
    ],
  ),
  Bharani: a(
    [
      [0.5, 0.18, 0.55],
      [0.18, 0.78, 0.5],
      [0.82, 0.78, 0.5],
      [0.5, 0.52, 0.4],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 0],
      [0, 3],
    ],
  ),
  Krittika: a(
    [
      [0.22, 0.58],
      [0.36, 0.42],
      [0.5, 0.28, 0.65],
      [0.62, 0.4],
      [0.74, 0.52],
      [0.58, 0.62],
      [0.42, 0.7],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [1, 6],
    ],
  ),
  Rohini: a(
    [
      [0.2, 0.72],
      [0.2, 0.38],
      [0.5, 0.18, 0.65],
      [0.8, 0.38],
      [0.8, 0.72],
      [0.5, 0.55],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [1, 5],
      [3, 5],
    ],
  ),
  Mrigashira: a(
    [
      [0.18, 0.32],
      [0.32, 0.48],
      [0.5, 0.42, 0.65],
      [0.68, 0.48],
      [0.82, 0.32],
      [0.5, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  ),
  Ardra: a(
    [
      [0.5, 0.16, 0.55],
      [0.38, 0.4],
      [0.62, 0.4],
      [0.32, 0.62],
      [0.68, 0.62],
      [0.5, 0.84, 0.7],
    ],
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
    ],
  ),
  Punarvasu: a(
    [
      [0.22, 0.78],
      [0.38, 0.42],
      [0.5, 0.18, 0.65],
      [0.62, 0.48],
      [0.78, 0.32],
      [0.72, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
  ),
  Pushya: a(
    [
      [0.5, 0.2, 0.55],
      [0.28, 0.42],
      [0.72, 0.42],
      [0.5, 0.52, 0.7],
      [0.28, 0.78],
      [0.72, 0.78],
    ],
    [
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
  ),
  Ashlesha: a(
    [
      [0.18, 0.72],
      [0.32, 0.42],
      [0.5, 0.58],
      [0.62, 0.28, 0.65],
      [0.78, 0.48],
      [0.82, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  ),
  Magha: a(
    [
      [0.22, 0.82],
      [0.22, 0.48],
      [0.38, 0.32],
      [0.5, 0.16, 0.7],
      [0.62, 0.32],
      [0.78, 0.48],
      [0.78, 0.82],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  ),
  "Purva Phalguni": a(
    [
      [0.18, 0.62],
      [0.38, 0.32, 0.55],
      [0.5, 0.5],
      [0.62, 0.32, 0.55],
      [0.82, 0.62],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  ),
  "Uttara Phalguni": a(
    [
      [0.22, 0.72],
      [0.22, 0.38],
      [0.5, 0.22, 0.6],
      [0.78, 0.38],
      [0.78, 0.72],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  ),
  Hasta: a(
    [
      [0.28, 0.82],
      [0.32, 0.52],
      [0.42, 0.32],
      [0.58, 0.22, 0.6],
      [0.7, 0.42],
      [0.78, 0.68],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  ),
  Chitra: a(
    [
      [0.5, 0.18],
      [0.78, 0.38],
      [0.78, 0.68],
      [0.5, 0.84],
      [0.22, 0.68],
      [0.22, 0.38],
      [0.5, 0.5, 0.75],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [0, 6],
      [2, 6],
      [4, 6],
    ],
  ),
  Swati: a(
    [
      [0.18, 0.5],
      [0.38, 0.38],
      [0.5, 0.22, 0.65],
      [0.62, 0.38],
      [0.82, 0.5],
      [0.5, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  ),
  Vishakha: a(
    [
      [0.22, 0.22, 0.5],
      [0.22, 0.82],
      [0.42, 0.5],
      [0.58, 0.5],
      [0.78, 0.22, 0.5],
      [0.78, 0.82],
    ],
    [
      [0, 1],
      [0, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  ),
  Anuradha: a(
    [
      [0.2, 0.72],
      [0.38, 0.38],
      [0.5, 0.2, 0.65],
      [0.62, 0.38],
      [0.8, 0.72],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  ),
  Jyeshtha: a(
    [
      [0.28, 0.28],
      [0.5, 0.18, 0.7],
      [0.72, 0.28],
      [0.5, 0.48],
      [0.5, 0.82],
      [0.32, 0.82],
      [0.68, 0.82],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 5],
      [4, 6],
    ],
  ),
  Mula: a(
    [
      [0.5, 0.16, 0.65],
      [0.5, 0.42],
      [0.28, 0.62],
      [0.72, 0.62],
      [0.18, 0.84],
      [0.5, 0.84],
      [0.82, 0.84],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 4],
      [1, 5],
      [3, 6],
    ],
  ),
  "Purva Ashadha": a(
    [
      [0.5, 0.16, 0.7],
      [0.22, 0.52],
      [0.78, 0.52],
      [0.22, 0.82],
      [0.78, 0.82],
    ],
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ],
  ),
  "Uttara Ashadha": a(
    [
      [0.5, 0.16, 0.65],
      [0.5, 0.5],
      [0.18, 0.5],
      [0.82, 0.5],
      [0.5, 0.84],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  ),
  Shravana: a(
    [
      [0.18, 0.32],
      [0.38, 0.48],
      [0.5, 0.22, 0.6],
      [0.62, 0.48],
      [0.82, 0.32],
      [0.5, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [3, 5],
    ],
  ),
  Dhanishta: a(
    [
      [0.5, 0.16, 0.55],
      [0.22, 0.42],
      [0.78, 0.42],
      [0.22, 0.72],
      [0.78, 0.72],
      [0.5, 0.86],
    ],
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
    ],
  ),
  Shatabhisha: a(
    [
      [0.5, 0.18],
      [0.74, 0.32],
      [0.84, 0.55],
      [0.68, 0.78],
      [0.5, 0.86],
      [0.32, 0.78],
      [0.16, 0.55],
      [0.26, 0.32],
      [0.5, 0.52, 0.7],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
      [0, 8],
      [2, 8],
      [4, 8],
      [6, 8],
    ],
  ),
  "Purva Bhadrapada": a(
    [
      [0.28, 0.16],
      [0.28, 0.5],
      [0.28, 0.84],
      [0.52, 0.32],
      [0.72, 0.5, 0.65],
      [0.82, 0.78],
    ],
    [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [4, 5],
    ],
  ),
  "Uttara Bhadrapada": a(
    [
      [0.5, 0.16, 0.6],
      [0.5, 0.42],
      [0.22, 0.72],
      [0.78, 0.72],
      [0.22, 0.88],
      [0.78, 0.88],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
    ],
  ),
  Revati: a(
    [
      [0.18, 0.48],
      [0.32, 0.28],
      [0.42, 0.62],
      [0.5, 0.22, 0.6],
      [0.58, 0.62],
      [0.68, 0.28],
      [0.82, 0.48],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  ),
};

export function asterismFor(name: string): Asterism {
  return (
    NAKSHATRA_ASTERISMS[name] ||
    a(
      [
        [0.5, 0.3, 0.6],
        [0.3, 0.6],
        [0.7, 0.6],
      ],
      [
        [0, 1],
        [0, 2],
        [1, 2],
      ],
    )
  );
}

export function placeAsterism(
  origin: { x: number; y: number },
  along: { x: number; y: number },
  pattern: Asterism,
  size: number,
) {
  const len = Math.hypot(along.x, along.y);
  const ux = len >= 4 ? along.x / len : 1;
  const uy = len >= 4 ? along.y / len : 0;
  const vx = -uy;
  const vy = ux;
  return {
    stars: pattern.stars.map((star) => ({
      x: origin.x + (star.x - 0.5) * size * ux + (0.5 - star.y) * size * vx,
      y: origin.y + (star.x - 0.5) * size * uy + (0.5 - star.y) * size * vy,
      r: (star.r ?? 0.42) * (size / 12),
    })),
    lines: pattern.lines,
  };
}

/** Soft companion stars so a selected nakshatra still reads when that sky patch is empty. */
export function asterismHaloStars(origin: { x: number; y: number }, size: number, seed = 11) {
  const stars: Array<{ x: number; y: number; r: number; o: number }> = [];
  let t = seed >>> 0;
  const rand = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 14; i += 1) {
    const ang = rand() * Math.PI * 2;
    const dist = size * (0.18 + rand() * 0.42);
    stars.push({
      x: origin.x + Math.cos(ang) * dist,
      y: origin.y + Math.sin(ang) * dist,
      r: 0.18 + rand() * 0.28,
      o: 0.28 + rand() * 0.4,
    });
  }
  return stars;
}

/** Keep a hover card fully inside its parent. */
export function clampHoverBox(
  px: number,
  py: number,
  boxW: number,
  boxH: number,
  areaW: number,
  areaH: number,
  pad = 8,
) {
  const preferLeft = px > areaW * 0.58;
  const preferBelow = py < boxH + pad * 3;
  let left = preferLeft ? px - boxW - 12 : px + 14;
  let top = preferBelow ? py + 14 : py - boxH - 12;
  const maxLeft = Math.max(pad, areaW - boxW - pad);
  const maxTop = Math.max(pad, areaH - boxH - pad);
  left = Math.min(maxLeft, Math.max(pad, left));
  top = Math.min(maxTop, Math.max(pad, top));
  return { left, top };
}
