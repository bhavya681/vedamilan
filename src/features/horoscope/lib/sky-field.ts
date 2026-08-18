/** Deterministic star field for the North Horizon disc. Not a star catalog. */

export type SkyStar = {
  x: number;
  y: number;
  r: number;
  o: number;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function skyStars(count = 72, seed = 17): SkyStar[] {
  const rand = mulberry32(seed);
  const stars: SkyStar[] = [];
  while (stars.length < count) {
    const x = 8 + rand() * 84;
    const y = 8 + rand() * 84;
    const dx = x - 50;
    const dy = y - 50;
    if (dx * dx + dy * dy > 46 * 46) continue;
    stars.push({
      x,
      y,
      r: 0.12 + rand() * 0.28,
      o: 0.18 + rand() * 0.42,
    });
  }
  return stars;
}
