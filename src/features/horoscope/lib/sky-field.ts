/** Deterministic star field for the North Horizon disc. Not a star catalog. */

export type SkyStar = {
  x: number;
  y: number;
  r: number;
  o: number;
};

export type SkyNebula = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  fill: string;
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

/** Full-frame star dust for galaxy panels (not clipped to the horizon disc). */
export function galaxyStars(count = 110, seed = 41): SkyStar[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.08 + rand() * 0.34,
    o: 0.16 + rand() * 0.5,
  }));
}

/** Soft nebula ellipses for a galaxy feel. Positions are visual only. */
export function skyNebulae(seed = 23): SkyNebula[] {
  const rand = mulberry32(seed);
  const fills = ["#7c6ad6", "#3a6ea8", "#d4af37", "#6b3d8a", "#4a7ab5"];
  return Array.from({ length: 5 }, (_, i) => {
    const ang = rand() * Math.PI * 2;
    const dist = 10 + rand() * 22;
    return {
      cx: 50 + Math.cos(ang) * dist,
      cy: 50 + Math.sin(ang) * dist * 0.72,
      rx: 14 + rand() * 16,
      ry: 5 + rand() * 8,
      rot: -40 + rand() * 80,
      fill: fills[i] || "#5a4a9a",
      o: 0.1 + rand() * 0.12,
    };
  });
}

/** Pan/zoom so a disc point sits near the view center. */
export const SKY_VIEW_MIN = 0.8;
export const SKY_VIEW_MAX = 5.4;
export const SKY_PAN = 46;

export function clampSkyView(view: { x: number; y: number; k: number }) {
  return {
    x: Math.max(-SKY_PAN, Math.min(SKY_PAN, view.x)),
    y: Math.max(-SKY_PAN, Math.min(SKY_PAN, view.y)),
    k: Math.min(SKY_VIEW_MAX, Math.max(SKY_VIEW_MIN, view.k)),
  };
}

export function viewToFocusPoint(x: number, y: number, k = 1.55) {
  const zoom = Math.min(SKY_VIEW_MAX, Math.max(SKY_VIEW_MIN, k));
  return clampSkyView({
    x: -(x - 50) * zoom,
    y: -(y - 50) * zoom,
    k: zoom,
  });
}

/** Zoom while keeping a disc point under the same screen location. */
export function zoomAroundPoint(
  view: { x: number; y: number; k: number },
  x: number,
  y: number,
  kNext: number,
) {
  const next = clampSkyView({ ...view, k: kNext });
  return clampSkyView({
    x: view.x + (x - 50) * (view.k - next.k),
    y: view.y + (y - 50) * (view.k - next.k),
    k: next.k,
  });
}
