"use client";

import { Suspense } from "react";

import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { PanchangaMuhurtaStudio } from "@/features/horoscope/components/panchanga-muhurta-studio";

export default function AstrologyPanchangaPage() {
  return (
    <Suspense fallback={<PanelSkeleton lines={8} />}>
      <PanchangaMuhurtaStudio />
    </Suspense>
  );
}
