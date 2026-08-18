import { describe, expect, it } from "vitest";

import { stereographicPoint } from "@/application/horoscope/horizon-coordinates";
import { planetOrbRadius } from "@/features/horoscope/components/planet-orbs";
import { skyStars } from "@/features/horoscope/lib/sky-field";
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
