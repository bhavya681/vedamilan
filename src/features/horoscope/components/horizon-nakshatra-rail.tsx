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
      <div className="mb-1 flex items-center justify-between gap-2 px-0.5 sm:mb-1.5">
        <p className="text-ivory/75 text-[10px] font-semibold tracking-[0.16em] uppercase">
          Nakshatras
        </p>
        <p className="text-ivory/45 hidden text-[10px] sm:block">Scroll to visit each star group</p>
      </div>
      <div
        ref={scroller}
        className="scrollbar-premium flex gap-1 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] sm:gap-1.5"
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
                "flex min-w-[5.15rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-1.5 py-1.5 text-center transition-colors sm:min-w-[6.6rem] sm:gap-1 sm:px-2.5 sm:py-2",
                active
                  ? "border-gold/70 bg-gold/15 text-ivory"
                  : "border-ivory/15 text-ivory/85 hover:border-gold/35 bg-black/30 hover:bg-black/45",
              )}
            >
              <NakshatraGlyph
                name={name}
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6",
                  active || isLagna ? "text-gold" : "text-ivory/75",
                )}
              />
              <span className="text-[10px] leading-tight font-medium sm:text-[11px]">{name}</span>
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
