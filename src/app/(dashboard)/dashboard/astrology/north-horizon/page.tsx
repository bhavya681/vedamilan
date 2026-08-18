import { Suspense } from "react";

import { NorthHorizonExplorer } from "@/features/horoscope/components/north-horizon-explorer";

function HorizonFallback() {
  return (
    <div
      data-dashboard-bleed
      className="border-border/70 bg-card text-card-foreground flex min-h-[min(52dvh,28rem)] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border sm:min-h-[min(58dvh,34rem)]"
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
