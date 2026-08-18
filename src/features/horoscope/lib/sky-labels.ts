/** Label placement for the Horizon sky disc. Does not change astronomical math. */

export const SKY_CX = 50;
export const SKY_CY = 50;
export const SKY_VIEW = 100;
export const SKY_LABEL_PAD = 7;

export function insetTowardZenith(x: number, y: number, inset: number, cx = SKY_CX, cy = SKY_CY) {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return { x: cx, y: cy };
  const next = Math.max(0, dist - inset);
  return { x: cx + (dx / dist) * next, y: cy + (dy / dist) * next };
}

export function clampSkyLabel(x: number, y: number, pad = SKY_LABEL_PAD, view = SKY_VIEW) {
  return {
    x: Math.min(view - pad, Math.max(pad, x)),
    y: Math.min(view - pad, Math.max(pad, y)),
  };
}

/** Keep a sky label inside the disc and away from the clipped rim. */
export function skyLabelPoint(x: number, y: number, inset = 5.2, pad = SKY_LABEL_PAD) {
  const inner = insetTowardZenith(x, y, inset);
  return clampSkyLabel(inner.x, inner.y, pad);
}

export function skyLabelAnchor(x: number, cx = SKY_CX) {
  if (x > cx + 12) return "end" as const;
  if (x < cx - 12) return "start" as const;
  return "middle" as const;
}
