"use client";

import { KundliChartPage } from "@/features/horoscope/components/kundli-chart-page";

export default function SouthChartPage() {
  return (
    <KundliChartPage
      title="South Indian Chart"
      description="Fixed-sign grid kundli — lagna highlighted in its rashi"
      pick="chartSouth"
    />
  );
}
