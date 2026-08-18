"use client";

import { KundliChartPage } from "@/features/horoscope/components/kundli-chart-page";

export default function NorthChartPage() {
  return (
    <KundliChartPage
      title="North Indian Chart"
      description="Traditional diamond kundli with a galaxy sky of planets, nakshatras, and the rising horizon"
      pick="chartNorth"
    />
  );
}
