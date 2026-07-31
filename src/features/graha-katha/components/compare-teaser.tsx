"use client";

import type { GrahaComparePair } from "@/domain/graha-katha/types";

export function CompareTeaser({ pairs, title }: { pairs: GrahaComparePair[]; title: string }) {
  return (
    <section className="min-w-0 space-y-4">
      <div className="min-w-0">
        <p className="text-saffron text-xs font-semibold tracking-[0.18em] uppercase">Compare</p>
        <h2 className="font-display mt-1 text-xl text-balance sm:text-3xl">{title}</h2>
      </div>
      <ul className="katha-stagger grid min-w-0 gap-3 sm:grid-cols-2">
        {pairs.map((p) => (
          <li
            key={p.id}
            className="katha-panel border-border/50 from-card to-muted/30 shadow-soft min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5"
          >
            <p className="font-display text-lg sm:text-xl">{p.title}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {p.symbolicRelationship}
            </p>
            <p className="text-saffron/90 mt-3 text-xs leading-relaxed">{p.constructive}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
