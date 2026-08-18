import { describe, expect, it } from "vitest";

import { stereographicPoint } from "@/application/horoscope/horizon-coordinates";
import { NAKSHATRAS } from "@/application/horoscope/vedic-constants";
import {
  asterismFor,
  asterismHaloStars,
  clampHoverBox,
  NAKSHATRA_ASTERISMS,
  placeAsterism,
} from "@/features/horoscope/lib/nakshatra-asterisms";
import { planetOrbRadius } from "@/features/horoscope/components/planet-orbs";
import {
  skyNebulae,
  skyStars,
  galaxyStars,
  viewToFocusPoint,
  zoomAroundPoint,
} from "@/features/horoscope/lib/sky-field";
import {
  clampSkyLabel,
  insetTowardZenith,
  SKY_LABEL_PAD,
  SKY_VIEW,
  skyLabelPoint,
} from "@/features/horoscope/lib/sky-labels";

describe("sky field", () => {
  it("keeps a stable star field for the same seed", () => {
    const a = skyStars(40, 17);
    const b = skyStars(40, 17);
    expect(a).toEqual(b);
    expect(a.length).toBe(40);
  });

  it("stays inside the celestial disc", () => {
    for (const star of skyStars(72, 17)) {
      const dx = star.x - 50;
      const dy = star.y - 50;
      expect(dx * dx + dy * dy).toBeLessThanOrEqual(46 * 46 + 0.01);
    }
  });

  it("keeps a stable nebula field", () => {
    expect(skyNebulae(23)).toEqual(skyNebulae(23));
    expect(skyNebulae(23).length).toBe(5);
  });

  it("fills a rectangular galaxy field", () => {
    const field = galaxyStars(80, 41);
    expect(field).toEqual(galaxyStars(80, 41));
    expect(field).toHaveLength(80);
    expect(field.every((s) => s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100)).toBe(true);
  });
});

describe("planet orbs", () => {
  it("gives the Sun a larger disc than Mercury", () => {
    expect(planetOrbRadius("Sun")).toBeGreaterThan(planetOrbRadius("Mercury"));
    expect(planetOrbRadius("Unknown")).toBe(1.7);
  });
});

describe("sky labels", () => {
  it("pulls an eastern rising label inside the disc instead of clipping the rim", () => {
    const east = stereographicPoint(0, 90, 50, 50, 38);
    const label = skyLabelPoint(east.x, east.y, 6.4);
    expect(label.x).toBeLessThan(east.x);
    expect(label.x).toBeGreaterThanOrEqual(SKY_LABEL_PAD);
    expect(label.x).toBeLessThanOrEqual(SKY_VIEW - SKY_LABEL_PAD);
    expect(label.y).toBeCloseTo(50, 1);
  });

  it("keeps below-horizon labels inside the view box", () => {
    const below = stereographicPoint(-18, 90, 50, 50, 38);
    const label = skyLabelPoint(below.x, below.y, 5);
    expect(label.x).toBeGreaterThanOrEqual(SKY_LABEL_PAD);
    expect(label.x).toBeLessThanOrEqual(SKY_VIEW - SKY_LABEL_PAD);
    expect(label.y).toBeGreaterThanOrEqual(SKY_LABEL_PAD);
    expect(label.y).toBeLessThanOrEqual(SKY_VIEW - SKY_LABEL_PAD);
  });

  it("clamps and insets toward zenith", () => {
    expect(clampSkyLabel(120, -4)).toEqual({ x: SKY_VIEW - SKY_LABEL_PAD, y: SKY_LABEL_PAD });
    const inner = insetTowardZenith(88, 50, 8);
    expect(inner.x).toBeCloseTo(80, 5);
    expect(inner.y).toBeCloseTo(50, 5);
  });
});

describe("sky focus", () => {
  it("pans an eastern point toward the centre when zooming", () => {
    const near = viewToFocusPoint(60, 50, 1.5);
    expect(near.k).toBe(1.5);
    expect(near.x).toBeCloseTo(-15, 5);
    expect(near.y).toBeCloseTo(0, 5);
    const rim = viewToFocusPoint(88, 50, 1.5);
    expect(rim.x).toBeCloseTo(-46, 5);
    expect(Math.abs(rim.x)).toBeLessThanOrEqual(46);
  });
});

describe("manual zoom", () => {
  it("keeps the pointer point in place while scaling up", () => {
    const start = { x: 0, y: 0, k: 1 };
    const next = zoomAroundPoint(start, 60, 50, 2);
    expect(next.k).toBe(2);
    const before = (60 - 50) * start.k + 50 + start.x;
    const after = (60 - 50) * next.k + 50 + next.x;
    expect(after).toBeCloseTo(before, 5);
  });

  it("pans a nakshatra to centre without changing the current zoom", () => {
    const focused = viewToFocusPoint(62, 44, 1.8);
    expect(focused.k).toBe(1.8);
    expect(focused.x).toBeCloseTo(-(62 - 50) * 1.8, 5);
    expect(focused.y).toBeCloseTo(-(44 - 50) * 1.8, 5);
  });
});

describe("nakshatra asterisms", () => {
  it("has a star-shape for every nakshatra", () => {
    for (const name of NAKSHATRAS) {
      const pattern = asterismFor(name);
      expect(pattern.stars.length).toBeGreaterThanOrEqual(3);
      expect(pattern.lines.length).toBeGreaterThan(0);
      expect(NAKSHATRA_ASTERISMS[name]).toBeTruthy();
    }
  });

  it("places the figure around the selected sky point", () => {
    const placed = placeAsterism({ x: 60, y: 40 }, { x: 10, y: 0 }, asterismFor("Ashwini"), 12);
    const cx = placed.stars.reduce((s, p) => s + p.x, 0) / placed.stars.length;
    const cy = placed.stars.reduce((s, p) => s + p.y, 0) / placed.stars.length;
    expect(Math.abs(cx - 60)).toBeLessThan(2);
    expect(Math.abs(cy - 40)).toBeLessThan(2);
  });

  it("keeps a readable star-shape when the ecliptic span is tiny", () => {
    const placed = placeAsterism({ x: 50, y: 50 }, { x: 0.3, y: 0.1 }, asterismFor("Rohini"), 22);
    const xs = placed.stars.map((s) => s.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(10);
  });

  it("fills empty sky around the selected figure", () => {
    const halo = asterismHaloStars({ x: 50, y: 50 }, 22);
    expect(halo).toHaveLength(14);
    expect(halo.every((s) => Math.hypot(s.x - 50, s.y - 50) < 16)).toBe(true);
  });
});

describe("hover card clamping", () => {
  it("keeps the card inside the sky frame near the east rim", () => {
    const box = clampHoverBox(310, 40, 180, 90, 320, 280);
    expect(box.left).toBeGreaterThanOrEqual(8);
    expect(box.top).toBeGreaterThanOrEqual(8);
    expect(box.left + 180).toBeLessThanOrEqual(312);
    expect(box.top + 90).toBeLessThanOrEqual(272);
  });
});
