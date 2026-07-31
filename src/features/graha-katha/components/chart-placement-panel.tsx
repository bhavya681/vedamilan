"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/vedic";
import type { GrahaEntity } from "@/domain/graha-katha/types";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";
import { useHoroscope } from "@/hooks/use-horoscope";
import { routes } from "@/lib/constants/routes";

/** Defers horoscope network until the panel is near the viewport. */
export function ChartPlacementPanel({
  graha,
  id = "my-chart",
}: {
  graha: GrahaEntity;
  id?: string;
}) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  return (
    <section id={id} ref={ref} className="scroll-mt-28 space-y-5">
      <SectionHeader
        eyebrow={t("grahaKatha.labels.chart")}
        title={t("grahaKatha.chart.title")}
        description={t("grahaKatha.chart.engineNote")}
      />
      <ContentLabelBadge label="chart" />
      {active ? (
        <ChartPlacementBody graha={graha} />
      ) : (
        <div className="border-border/40 bg-muted/15 h-40 animate-pulse rounded-2xl" aria-hidden />
      )}
    </section>
  );
}

function ChartPlacementBody({ graha }: { graha: GrahaEntity }) {
  const t = useT();
  const { data, loading, error } = useHoroscope();
  const planets = data?.horoscope?.planets ?? [];
  const placement = planets.find((p) => p.planet === graha.engineName);
  const houseInterp = placement ? graha.houses.find((h) => h.house === placement.house) : undefined;

  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (loading) return <p className="text-muted-foreground text-sm">…</p>;

  if (!placement) {
    return (
      <div className="border-border/50 bg-card/40 rounded-2xl border p-6">
        <p className="text-muted-foreground text-sm">{t("grahaKatha.chart.noChart")}</p>
        <Button asChild className="mt-4">
          <Link href={routes.kundli}>{t("grahaKatha.chart.openKundli")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border/50 bg-card/50 space-y-5 rounded-2xl border p-5 sm:p-8">
      <div>
        <h3 className="font-display text-2xl">
          {t("grahaKatha.chart.placement", { planet: graha.englishName })}
        </h3>
        <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
          <li>{t("grahaKatha.chart.house", { house: placement.house })}</li>
          <li>{t("grahaKatha.chart.sign", { sign: placement.sign })}</li>
          <li>
            {t("grahaKatha.chart.nakshatra", {
              nakshatra: placement.nakshatraPada
                ? `${placement.nakshatra} (pada ${placement.nakshatraPada})`
                : placement.nakshatra,
            })}
          </li>
          {placement.dignity ? <li>{placement.dignity}</li> : null}
          {placement.isRetrograde ? <li>Retrograde</li> : null}
        </ul>
        <p className="text-muted-foreground mt-3 text-xs">{t("grahaKatha.chart.engineNote")}</p>
      </div>

      <div>
        <ContentLabelBadge label="traditional" className="mb-2" />
        <h4 className="font-display text-lg">{t("grahaKatha.chart.whatMeans")}</h4>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {graha.englishName} is in house {placement.house} ({placement.sign}
          {placement.nakshatra ? `, ${placement.nakshatra}` : ""}) according to your stored Kundli.
          Traditional house themes below are interpretive frameworks — not guarantees.
        </p>
      </div>

      {houseInterp ? (
        <>
          <div>
            <h4 className="font-display text-lg">{t("grahaKatha.chart.traditional")}</h4>
            <p className="mt-2 text-sm leading-relaxed">{houseInterp.traditional}</p>
            <p className="text-muted-foreground mt-2 text-xs">{t("grahaKatha.chart.interpNote")}</p>
          </div>
          <div>
            <ContentLabelBadge label="interpretive" className="mb-2" />
            <h4 className="font-display text-lg">{t("grahaKatha.chart.mayHighlight")}</h4>
            <p className="mt-2 text-sm leading-relaxed">{houseInterp.possibleLesson}</p>
            <p className="font-display text-saffron mt-3 text-lg italic">
              {houseInterp.reflection}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
