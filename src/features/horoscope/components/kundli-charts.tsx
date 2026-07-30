"use client";

import { useState } from "react";

import { planetVoiceForGlyph, type PlanetVoiceMessage } from "@/application/horoscope/planet-voice";
import { PlanetStoryHover } from "@/features/horoscope/components/planet-voice-panel";
import {
  ChartViewToggle,
  PlanetSymbolSvg,
  PLANET_GLYPH,
  SymbolsKey,
  type ChartPlanetView,
} from "@/features/horoscope/components/planet-symbols";
import { cn } from "@/lib/utils/cn";

const SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"] as const;

export type ChartPlanetGlyph = {
  planet: string;
  abbr: string;
  label: string;
  degree: string;
  degreeValue?: number;
  dignity?: string | null;
  mark?: string;
  isRetrograde?: boolean;
  house?: number;
  signId?: number;
};

export type NorthChartData = {
  style?: string;
  lagnaSignId: number;
  lagnaDegree?: number;
  lagnaLabel?: string;
  houses: Record<string, Array<string | ChartPlanetGlyph>>;
};

export type SouthChartData = {
  style?: string;
  lagnaSignId: number;
  lagnaDegree?: number;
  lagnaLabel?: string;
  signs: Array<{
    sign: string;
    signId: number;
    house?: number;
    planets: Array<string | ChartPlanetGlyph>;
  }>;
};

/**
 * North Indian diamond — houses FIXED; House 1 (Asc) always TOP.
 * Digits are rashi numbers (1=Aries … 12=Pisces), not house ordinals.
 * Count anti-clockwise: 2 left of Asc, 12 right of Asc; 4 left, 7 bottom, 10 right.
 */
const NORTH_POS: Record<number, { x: number; y: number; numX: number; numY: number }> = {
  1: { x: 50, y: 22, numX: 50, numY: 9 },
  2: { x: 28, y: 16, numX: 16, numY: 10 },
  3: { x: 16, y: 32, numX: 8, numY: 28 },
  4: { x: 26, y: 50, numX: 12, numY: 50 },
  5: { x: 16, y: 68, numX: 8, numY: 72 },
  6: { x: 28, y: 84, numX: 16, numY: 90 },
  7: { x: 50, y: 78, numX: 50, numY: 91 },
  8: { x: 72, y: 84, numX: 84, numY: 90 },
  9: { x: 84, y: 68, numX: 92, numY: 72 },
  10: { x: 74, y: 50, numX: 88, numY: 50 },
  11: { x: 84, y: 32, numX: 92, numY: 28 },
  12: { x: 72, y: 16, numX: 84, numY: 10 },
};

/**
 * East Indian diamond — FIXED rashis (Aries at top), anti-clockwise like North slots.
 * House number drawn in each rashi = whole-sign house from Lagna.
 */
const EAST_SIGN_SLOT: Record<number, number> = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  10: 11,
  11: 12,
};

/** South Indian fixed-sign grid. */
const SOUTH_GRID: Array<number | null> = [
  11,
  0,
  1,
  2,
  10,
  null,
  null,
  3,
  9,
  null,
  null,
  4,
  8,
  7,
  6,
  5,
];

function DiamondFrame() {
  return (
    <g style={{ pointerEvents: "none" }} aria-hidden>
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth="1.35"
        className="text-gold"
      />
      <line
        x1="4"
        y1="4"
        x2="96"
        y2="96"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/80"
      />
      <line
        x1="96"
        y1="4"
        x2="4"
        y2="96"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/80"
      />
      <line
        x1="50"
        y1="4"
        x2="4"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/70"
      />
      <line
        x1="50"
        y1="4"
        x2="96"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/70"
      />
      <line
        x1="4"
        y1="50"
        x2="50"
        y2="96"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/70"
      />
      <line
        x1="96"
        y1="50"
        x2="50"
        y2="96"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-gold/70"
      />
    </g>
  );
}

function normalizeGlyphs(raw: Array<string | ChartPlanetGlyph> | undefined): ChartPlanetGlyph[] {
  if (!raw?.length) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      const abbr =
        (
          {
            Sun: "Su",
            Moon: "Mo",
            Mars: "Ma",
            Mercury: "Me",
            Jupiter: "Ju",
            Venus: "Ve",
            Saturn: "Sa",
            Rahu: "Ra",
            Ketu: "Ke",
          } as Record<string, string>
        )[item] ?? item.slice(0, 2);
      return {
        planet: item,
        abbr,
        label: abbr,
        degree: "",
        dignity: null,
        mark: "",
        isRetrograde: false,
      };
    }
    return item;
  });
}

function HousePlanets({
  x,
  y,
  glyphs,
  highlight,
  activePlanet,
  view = "labels",
}: {
  x: number;
  y: number;
  glyphs: ChartPlanetGlyph[];
  highlight?: boolean;
  activePlanet?: string | null;
  view?: ChartPlanetView;
}) {
  if (!glyphs.length) return null;
  const symbols = view === "symbols";
  const showDegree = !symbols && glyphs.some((g) => g.degree);
  const lineH = symbols ? 5.6 : showDegree ? 5.2 : 3.6;
  const startY = y - ((glyphs.length - 1) * lineH) / 2;

  return (
    <g style={{ pointerEvents: "none" }}>
      {glyphs.map((g, index) => {
        const cy = startY + index * lineH;
        const active = activePlanet === g.planet;
        const toneClass =
          highlight || g.mark === "↑" || active
            ? "text-primary fill-primary"
            : g.mark === "↓"
              ? "text-destructive fill-destructive"
              : "text-foreground fill-foreground";

        return (
          <g key={`${g.planet}-${index}`}>
            {symbols ? (
              <>
                <PlanetSymbolSvg
                  planet={g.planet}
                  cx={x}
                  cy={cy - (g.mark || g.isRetrograde ? 0.35 : 0)}
                  className={toneClass}
                />
                {(g.mark || g.isRetrograde) && (
                  <text
                    x={x + 2.6}
                    y={cy + 0.9}
                    textAnchor="start"
                    className={cn("text-[1.7px] font-bold", toneClass)}
                  >
                    {`${g.mark || ""}${g.isRetrograde ? "℞" : ""}`}
                  </text>
                )}
              </>
            ) : (
              <>
                <text
                  x={x}
                  y={cy}
                  textAnchor="middle"
                  className={cn("text-[3.1px] font-bold", toneClass, active && "underline")}
                >
                  {g.label}
                </text>
                {showDegree && g.degree ? (
                  <text
                    x={x}
                    y={cy + 2.15}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[1.85px]"
                  >
                    {g.degree}
                  </text>
                ) : null}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function ChartLegend({
  className,
  planetVoice,
  view = "labels",
}: {
  className?: string;
  planetVoice?: boolean;
  view?: ChartPlanetView;
}) {
  return (
    <div className={cn("mt-3 flex w-full flex-col items-center", className)}>
      <p className="text-muted-foreground max-w-sm text-center text-[10px] leading-relaxed sm:text-[11px]">
        {view === "symbols"
          ? "Symbols view · visual grahas in whole-sign houses · ↑ Ucch · ↓ Neech · ◉ Own · ℞ Retro"
          : "Whole-sign houses from Asc · Su Mo Ma Me Ju Ve Sa Ra Ke · ↑ Ucch · ↓ Neech · ◉ Own · ℞ Retro"}
        {planetVoice ? (
          <>
            <br />
            <span className="text-foreground/70">
              Use the planet buttons below the chart to read each graha&apos;s story (D1).
            </span>
          </>
        ) : null}
      </p>
      {view === "symbols" ? <SymbolsKey /> : null}
    </div>
  );
}

/** Whole-sign rashi number (1–12) occupying a house counted from Lagna. */
export function rashiNumberForHouse(house: number, lagnaSignId: number) {
  const lagna = ((lagnaSignId % 12) + 12) % 12;
  const h = Math.min(12, Math.max(1, house));
  return ((lagna + h - 1) % 12) + 1;
}

function collectChartPlanets(chart: NorthChartData): ChartPlanetGlyph[] {
  const list: ChartPlanetGlyph[] = [];
  for (let house = 1; house <= 12; house += 1) {
    for (const g of normalizeGlyphs(chart.houses[String(house)])) {
      list.push({ ...g, house: g.house ?? house });
    }
  }
  return list;
}

export function NorthIndianKundli({
  chart,
  className,
  planetVoice = false,
}: {
  chart: NorthChartData;
  className?: string;
  /** D1 only — select a planet to read its condition story below the chart */
  planetVoice?: boolean;
}) {
  const [story, setStory] = useState<PlanetVoiceMessage | null>(null);
  const [view, setView] = useState<ChartPlanetView>("labels");
  const planets = collectChartPlanets(chart);

  const selectPlanet = (glyph: ChartPlanetGlyph) => {
    setStory(planetVoiceForGlyph(glyph));
  };

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <ChartViewToggle value={view} onChange={setView} />
      <svg
        viewBox="0 0 100 100"
        className="kundli-chart-square"
        role="img"
        aria-label={
          view === "symbols"
            ? "North Indian kundli chart — planet symbols"
            : "North Indian kundli chart — planet labels"
        }
      >
        <DiamondFrame />
        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
          const pos = NORTH_POS[house]!;
          const glyphs = normalizeGlyphs(chart.houses[String(house)]).map((g) => ({
            ...g,
            house: g.house ?? house,
          }));
          const rashiNo = rashiNumberForHouse(house, chart.lagnaSignId);
          return (
            <g key={house}>
              <text
                x={pos.numX}
                y={pos.numY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "text-[3.6px] font-bold",
                  house === 1 ? "fill-primary" : "fill-muted-foreground",
                )}
              >
                {rashiNo}
              </text>
              {house === 1 ? (
                <text
                  x={pos.x}
                  y={pos.y - (glyphs.length ? (view === "symbols" ? 7 : 6) : 1.5)}
                  textAnchor="middle"
                  className="fill-primary text-[2.5px] font-semibold"
                >
                  {chart.lagnaLabel || "Asc"}
                </text>
              ) : null}
              <HousePlanets
                x={pos.x}
                y={pos.y + (house === 1 ? 1.2 : 0)}
                glyphs={glyphs}
                highlight={house === 1}
                activePlanet={story?.planet}
                view={view}
              />
            </g>
          );
        })}
      </svg>
      <ChartLegend planetVoice={planetVoice} view={view} />

      {planetVoice ? (
        <div className="mt-4 w-full max-w-md space-y-3">
          <p className="text-foreground text-center text-sm font-medium">
            Tap a planet to read what it is saying
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {planets.length ? (
              planets.map((g) => {
                const active = story?.planet === g.planet;
                return (
                  <button
                    key={`${g.planet}-${g.house}`}
                    type="button"
                    onClick={() => selectPlanet(g)}
                    className={cn(
                      "min-w-[2.75rem] rounded-lg border-2 px-2.5 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40",
                    )}
                    aria-pressed={active}
                    aria-label={`Read what ${g.planet} says`}
                  >
                    {g.abbr || g.label.replace(/[↑↓◉℞]/g, "").trim()}
                  </button>
                );
              })
            ) : (
              <p className="text-muted-foreground text-xs">No planets on this chart yet.</p>
            )}
          </div>
          {story ? (
            <PlanetStoryHover message={story} />
          ) : (
            <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border-2 border-dashed px-4 py-3 text-center text-xs leading-relaxed sm:text-sm">
              Choose Su, Mo, Ma… above — the planet&apos;s story appears in this box.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SouthIndianKundli({
  chart,
  className,
}: {
  chart: SouthChartData;
  className?: string;
}) {
  const [view, setView] = useState<ChartPlanetView>("labels");
  const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
  const bySign = new Map(chart.signs.map((s) => [s.signId, s]));
  const symbols = view === "symbols";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <ChartViewToggle value={view} onChange={setView} />
      <div
        className="border-gold bg-gold/25 kundli-chart-square grid grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border-2"
        role="img"
        aria-label={
          symbols
            ? "South Indian kundli chart — planet symbols"
            : "South Indian kundli chart — planet labels"
        }
      >
        {SOUTH_GRID.map((signId, index) => {
          if (signId === null) return <div key={index} className="bg-muted/40" />;
          const cell = bySign.get(signId);
          const glyphs = normalizeGlyphs(cell?.planets);
          const isLagna = signId === lagna;
          const houseNo = cell?.house ?? ((signId - lagna + 12) % 12) + 1;
          return (
            <div
              key={index}
              className={cn(
                "bg-background relative flex flex-col items-center justify-center gap-0.5 p-1 text-center",
                isLagna && "bg-primary/10 ring-primary/40 ring-1 ring-inset",
              )}
            >
              <span className="text-muted-foreground absolute top-0.5 left-1 text-[8px] font-bold sm:text-[9px]">
                {houseNo}
              </span>
              <span className="text-muted-foreground absolute top-0.5 right-1 text-[8px] font-medium sm:text-[9px]">
                {SIGN_ABBR[signId]}
              </span>
              {isLagna ? (
                <span className="text-primary text-[8px] font-semibold sm:text-[9px]">
                  {chart.lagnaLabel || "Asc"}
                </span>
              ) : null}
              <div className="mt-2 flex flex-col gap-0.5">
                {glyphs.length ? (
                  glyphs.map((g) => (
                    <div key={g.planet} className="leading-none" title={g.planet}>
                      <span
                        className={cn(
                          symbols
                            ? "text-[13px] leading-none sm:text-[15px]"
                            : "text-[9px] font-bold sm:text-[10px]",
                          g.mark === "↑"
                            ? "text-primary"
                            : g.mark === "↓"
                              ? "text-destructive"
                              : "text-foreground",
                        )}
                      >
                        {symbols
                          ? `${PLANET_GLYPH[g.planet] || g.abbr}${g.mark || ""}${g.isRetrograde ? "℞" : ""}`
                          : g.label}
                      </span>
                      {!symbols && g.degree ? (
                        <span className="text-muted-foreground block text-[7px] sm:text-[8px]">
                          {g.degree}
                        </span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <span className="text-muted-foreground/40 text-[9px]">·</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ChartLegend view={view} />
    </div>
  );
}

/** East Indian: fixed Aries-at-top diamond; house nos count from Ascendant rashi. */
export function EastIndianKundli({
  chart,
  className,
}: {
  chart: SouthChartData | NorthChartData;
  className?: string;
}) {
  const [view, setView] = useState<ChartPlanetView>("labels");

  // Prefer sign-based East data; if only north houses exist (legacy), fall back
  if (isSouthChart(chart)) {
    const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
    const bySign = new Map(chart.signs.map((s) => [s.signId, s]));

    return (
      <div className={cn("flex flex-col items-center", className)}>
        <ChartViewToggle value={view} onChange={setView} />
        <svg
          viewBox="0 0 100 100"
          className="kundli-chart-square"
          role="img"
          aria-label={
            view === "symbols"
              ? "East Indian kundli chart — planet symbols"
              : "East Indian kundli chart — planet labels"
          }
        >
          <DiamondFrame />
          {Array.from({ length: 12 }, (_, signId) => {
            const slot = EAST_SIGN_SLOT[signId]!;
            const pos = NORTH_POS[slot]!;
            const cell = bySign.get(signId);
            const houseNo = cell?.house ?? ((signId - lagna + 12) % 12) + 1;
            const glyphs = normalizeGlyphs(cell?.planets);
            const isLagna = signId === lagna;

            return (
              <g key={signId}>
                <text
                  x={pos.numX}
                  y={pos.numY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "text-[3.6px] font-bold",
                    isLagna ? "fill-primary" : "fill-muted-foreground",
                  )}
                >
                  {houseNo}
                </text>
                {isLagna ? (
                  <text
                    x={pos.x}
                    y={pos.y - (glyphs.length ? (view === "symbols" ? 7 : 6) : 1.5)}
                    textAnchor="middle"
                    className="fill-primary text-[2.5px] font-semibold"
                  >
                    {chart.lagnaLabel || "Asc"}
                  </text>
                ) : null}
                <HousePlanets
                  x={pos.x}
                  y={pos.y + (isLagna ? 1.2 : 0)}
                  glyphs={glyphs}
                  highlight={isLagna}
                  view={view}
                />
              </g>
            );
          })}
        </svg>
        <ChartLegend view={view} />
      </div>
    );
  }

  // Legacy north-shaped east payload
  return <NorthIndianKundli chart={chart} className={className} />;
}

export function isNorthChart(value: unknown): value is NorthChartData {
  return Boolean(
    value &&
    typeof value === "object" &&
    "houses" in value &&
    typeof (value as NorthChartData).lagnaSignId === "number",
  );
}

export function isSouthChart(value: unknown): value is SouthChartData {
  return Boolean(
    value &&
    typeof value === "object" &&
    Array.isArray((value as SouthChartData).signs) &&
    typeof (value as SouthChartData).lagnaSignId === "number",
  );
}

export function isEastChart(value: unknown): value is NorthChartData | SouthChartData {
  return isNorthChart(value) || isSouthChart(value);
}
