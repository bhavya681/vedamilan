"use client";

import { ArrowUpRight, GitCompareArrows, Sparkles } from "lucide-react";

import type { GrahaComparePair } from "@/domain/graha-katha/types";

export function CompareTeaser({ pairs, title }: { pairs: GrahaComparePair[]; title: string }) {
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="bg-gold/10 text-gold inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <GitCompareArrows className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-saffron text-xs font-semibold tracking-[0.18em] uppercase">Compare</p>
          <h2 className="font-display mt-1 text-xl text-balance sm:text-3xl">{title}</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            See how two planetary archetypes work together — and where their lessons can either
            support or strain each other.
          </p>
        </div>
      </div>
      <ul className="katha-stagger grid min-w-0 gap-3 sm:grid-cols-2">
        {pairs.map((p) => (
          <li
            key={p.id}
            className="katha-panel border-border/50 from-card to-muted/30 shadow-soft group hover:border-gold/35 min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-colors sm:p-5"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="font-display text-lg sm:text-xl">{p.title}</p>
              <span className="text-muted-foreground/60 group-hover:text-gold shrink-0 transition-colors">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {p.symbolicRelationship}
            </p>
            <p className="text-saffron/90 mt-3 flex items-start gap-1.5 text-xs leading-relaxed">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {p.constructive}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
