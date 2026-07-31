import { describe, expect, it } from "vitest";

import { isDashboardNavActive } from "@/config/dashboard-nav";
import { routes } from "@/lib/constants/routes";

describe("isDashboardNavActive", () => {
  it("highlights only My Kundli on the kundli hub", () => {
    expect(isDashboardNavActive(routes.kundli, routes.kundli)).toBe(true);
    expect(isDashboardNavActive(routes.kundli, routes.dasha)).toBe(false);
  });

  it("does not keep My Kundli selected on other astrology tabs", () => {
    expect(isDashboardNavActive(routes.grahaKatha, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.grahaKatha, routes.grahaKatha)).toBe(true);
    expect(isDashboardNavActive(`${routes.grahaKatha}/shani`, routes.grahaKatha)).toBe(true);

    expect(isDashboardNavActive(routes.dasha, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.dasha, routes.dasha)).toBe(true);

    expect(isDashboardNavActive(routes.rajaYogas, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.rajaYogas, routes.rajaYogas)).toBe(true);

    expect(isDashboardNavActive(routes.divisionalCharts, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.divisionalCharts, routes.divisionalCharts)).toBe(true);

    expect(isDashboardNavActive(routes.ashtakavarga, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.natalProfile, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.yogas, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.gochar, routes.kundli)).toBe(false);
    expect(isDashboardNavActive(routes.gochar, routes.gochar)).toBe(true);
  });

  it("keeps My Kundli selected for chart views without their own nav tab", () => {
    expect(isDashboardNavActive(routes.chartNorth, routes.kundli)).toBe(true);
    expect(isDashboardNavActive(routes.planets, routes.kundli)).toBe(true);
    expect(isDashboardNavActive(routes.nakshatra, routes.kundli)).toBe(true);
  });

  it("uses exact match for mode homes", () => {
    expect(isDashboardNavActive(routes.astrology, routes.astrology)).toBe(true);
    expect(isDashboardNavActive(routes.dasha, routes.astrology)).toBe(false);
  });

  it("keeps Partner preferences and Situational quiz tabs exclusive", () => {
    expect(isDashboardNavActive(routes.preferences, routes.preferences)).toBe(true);
    expect(isDashboardNavActive(routes.preferences, routes.situationalAlignment)).toBe(false);

    expect(isDashboardNavActive(routes.situationalAlignment, routes.situationalAlignment)).toBe(
      true,
    );
    expect(isDashboardNavActive(routes.situationalAlignment, routes.preferences)).toBe(false);
  });
});
