"use client";

import { useEffect, useRef } from "react";

import { NAKSHATRAS } from "@/application/horoscope/vedic-constants";
import { NAKSHATRA_DETAILS, vimshottariLordOf } from "@/application/horoscope/nakshatra-catalog";
import { NakshatraGlyph } from "@/features/horoscope/components/nakshatra-glyph";
import { cn } from "@/lib/utils/cn";

export function HorizonNakshatraRail({
  selected,
  lagna,
  moon,
  onSelect,
}: {
  selected: string | null;
  lagna: string | null;
  moon: string | null;
  onSelect: (name: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const target = selected || lagna;
    if (!target) return;
    const el = root.querySelector<HTMLElement>(`[data-nak="${CSS.escape(target)}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected, lagna]);

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <p className="text-ivory/70 text-[10px] font-semibold tracking-[0.16em] uppercase">
          Nakshatras
        </p>
        <p className="text-ivory/45 text-[10px]">Scroll to visit each star group</p>
      </div>
      <div
        ref={scroller}
        className="scrollbar-premium flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none]"
        role="listbox"
        aria-label="Nakshatras along the ecliptic"
      >
        {NAKSHATRAS.map((name) => {
          const detail = NAKSHATRA_DETAILS[name];
          const active = selected === name;
          const isLagna = lagna === name;
          const isMoon = moon === name;
          return (
            <button
              key={name}
              type="button"
              data-nak={name}
              role="option"
              aria-selected={active}
              onClick={() => onSelect(name)}
              className={cn(
                "flex min-w-[6.6rem] shrink-0 flex-col items-center gap-1 rounded-2xl border px-2.5 py-2 text-center transition-colors",
                active
                  ? "border-gold/70 bg-gold/15 text-ivory"
                  : "border-ivory/10 text-ivory/80 hover:border-gold/35 bg-black/25 hover:bg-black/40",
              )}
            >
              <NakshatraGlyph
                name={name}
                className={cn("h-6 w-6", active || isLagna ? "text-gold" : "text-ivory/70")}
              />
              <span className="text-[11px] leading-tight font-medium">{name}</span>
              <span className="text-ivory/50 text-[9px] leading-tight">
                {detail?.symbol?.split(" / ")[0]} · {vimshottariLordOf(name)}
              </span>
              {isLagna || isMoon ? (
                <span className="text-gold text-[9px] tracking-wide uppercase">
                  {isLagna && isMoon ? "Lagna · Moon" : isLagna ? "Lagna" : "Moon"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
