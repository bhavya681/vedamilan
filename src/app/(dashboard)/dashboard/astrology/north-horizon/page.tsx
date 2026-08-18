import { Suspense } from "react";

import { NorthHorizonExplorer } from "@/features/horoscope/components/north-horizon-explorer";

function HorizonFallback() {
  return (
    <div
      data-dashboard-bleed
      className="border-border/60 bg-card/40 flex min-h-[min(70dvh,42rem)] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border"
    >
      <div className="border-gold/40 h-16 w-16 rounded-full border-2 border-t-transparent motion-safe:animate-spin" />
      <p className="text-muted-foreground text-sm">Mapping the sky…</p>
    </div>
  );
}

export default function NorthHorizonPage() {
  return (
    <Suspense fallback={<HorizonFallback />}>
      <NorthHorizonExplorer />
    </Suspense>
  );
}
