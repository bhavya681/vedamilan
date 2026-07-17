"use client";

import { KundliChartPage } from "@/features/horoscope/components/kundli-chart-page";

export default function NorthChartPage() {
  return (
    <KundliChartPage
      title="North Indian Chart"
      description="Traditional diamond kundli — house 1 (lagna) at the top"
      pick="chartNorth"
    />
  );
}
