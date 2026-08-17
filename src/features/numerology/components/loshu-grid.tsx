"use client";

import { LOSHU_LAYOUT, planetForNumber, type LoshuGrid, type NumberId } from "@/domain/numerology";
import { cn } from "@/lib/utils/cn";

export function LoshuGridView({ grid }: { grid: LoshuGrid }) {
  return (
    <div className="mx-auto grid aspect-square w-full max-w-[280px] grid-cols-3 overflow-hidden rounded-xl border">
      {LOSHU_LAYOUT.flat().map((cell) => {
        const count = grid.counts[cell];
        const digits = Array.from({ length: count }, () => cell);
        return (
          <div
            key={cell}
            className={cn(
              "flex min-h-[72px] flex-col items-center justify-center border p-1",
              count === 0 && "bg-muted/40 text-muted-foreground",
              count === 1 && "bg-gold/10",
              count > 1 && "border-emerald-500/30 bg-emerald-500/10",
            )}
          >
            <span className="text-muted-foreground text-[9px] tracking-wider uppercase">
              {planetForNumber(cell as NumberId).slice(0, 3)}
            </span>
            <span className="font-display text-lg leading-none">
              {digits.length > 0 ? digits.join(" ") : "·"}
            </span>
            <span className="text-[10px] opacity-70">{cell}</span>
          </div>
        );
      })}
    </div>
  );
}
