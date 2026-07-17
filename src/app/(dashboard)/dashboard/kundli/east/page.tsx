"use client";

import { KundliChartPage } from "@/features/horoscope/components/kundli-chart-page";

export default function EastChartPage() {
  return (
    <KundliChartPage
      title="East Indian Chart"
      description="Diamond layout with fixed signs — Ascendant marked on lagna rashi"
      pick="chartEast"
    />
  );
}
