"use client";

import { useState } from "react";

import { useT } from "@/components/i18n/i18n-provider";
import { SectionHeader } from "@/components/ui/vedic";
import type { HouseInterpretation } from "@/domain/graha-katha/types";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";
import { cn } from "@/lib/utils/cn";

export function HouseExplorer({ houses }: { houses: HouseInterpretation[] }) {
  const t = useT();
  const [selected, setSelected] = useState(houses[9]?.house ?? 1);
  const active = houses.find((h) => h.house === selected) ?? houses[0]!;

  return (
    <section className="min-w-0 space-y-5 sm:space-y-6">
      <SectionHeader
        eyebrow={t("grahaKatha.houses")}
        title={t("grahaKatha.houses")}
        description={t("grahaKatha.housesHint")}
      />

      <div
        className="scrollbar-hidden grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-12"
        role="tablist"
        aria-label="Twelve houses"
      >
        {houses.map((h) => {
          const on = selected === h.house;
          return (
            <button
              key={h.house}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`house-panel-${h.house}`}
              id={`house-tab-${h.house}`}
              onClick={() => setSelected(h.house)}
              className={cn(
                "katha-house-tab focus-visible:ring-ring min-w-0 rounded-xl border px-1.5 py-2.5 text-center focus-visible:ring-2 focus-visible:outline-none sm:rounded-2xl sm:px-2 sm:py-3",
                on
                  ? "border-gold/45 from-gold/15 to-card text-foreground shadow-gold bg-gradient-to-b"
                  : "border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:bg-muted/40",
              )}
            >
              <span className="font-display block text-lg tabular-nums sm:text-xl">{h.house}</span>
              <span className="mt-0.5 hidden text-[9px] leading-tight tracking-[0.1em] uppercase sm:block sm:text-[10px]">
                Bhava
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`house-panel-${active.house}`}
        role="tabpanel"
        aria-labelledby={`house-tab-${active.house}`}
        className="content-reveal border-border/50 bg-card/85 shadow-soft relative min-w-0 overflow-hidden rounded-[1.35rem] border p-4 sm:p-8"
        key={active.house}
      >
        <div className="bg-gold/10 pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl" />
        <div className="relative min-w-0 space-y-5">
          <div className="min-w-0">
            <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
              House {active.house}
            </p>
            <h3 className="font-display mt-1 text-xl text-balance sm:text-3xl">{active.title}</h3>
          </div>

          <div className="katha-section-rule" />

          <Block
            label={t("grahaKatha.house.traditional")}
            badge="traditional"
            body={active.traditional}
          />
          <Block
            label={t("grahaKatha.house.expression")}
            badge="interpretive"
            body={active.lifeExpression}
          />
          <Block
            label={t("grahaKatha.house.lesson")}
            badge="interpretive"
            body={active.possibleLesson}
          />
          <div className="border-rose/25 bg-rose/5 rounded-xl border px-3 py-3 sm:px-4">
            <Block
              label={t("grahaKatha.house.reflection")}
              badge="reflection"
              body={active.reflection}
              emphasis
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({
  label,
  body,
  badge,
  emphasis,
}: {
  label: string;
  body: string;
  badge: "traditional" | "interpretive" | "reflection";
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ContentLabelBadge label={badge} />
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "leading-relaxed break-words",
          emphasis ? "font-display text-base italic sm:text-xl" : "text-[15px]",
        )}
      >
        {body}
      </p>
    </div>
  );
}
