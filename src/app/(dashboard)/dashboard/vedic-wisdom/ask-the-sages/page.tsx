import { Suspense } from "react";

import { SageCouncil } from "@/features/wisdom/components/sage-council";

export default function AskTheSagesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Preparing the sabha…</p>}>
      <SageCouncil />
    </Suspense>
  );
}
