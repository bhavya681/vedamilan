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
    <g>
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
}: {
  x: number;
  y: number;
  glyphs: ChartPlanetGlyph[];
  highlight?: boolean;
}) {
  if (!glyphs.length) return null;
  const lineH = glyphs.some((g) => g.degree) ? 5.2 : 3.6;
  const startY = y - ((glyphs.length - 1) * lineH) / 2;
  return (
    <g>
      {glyphs.map((g, index) => (
        <g key={`${g.planet}-${index}`}>
          <text
            x={x}
            y={startY + index * lineH}
            textAnchor="middle"
            className={cn(
              "text-[3.1px] font-bold",
              highlight || g.mark === "↑"
                ? "fill-primary"
                : g.mark === "↓"
                  ? "fill-destructive"
                  : "fill-foreground",
            )}
          >
            {g.label}
          </text>
          {g.degree ? (
            <text
              x={x}
              y={startY + index * lineH + 2.15}
              textAnchor="middle"
              className="fill-muted-foreground text-[1.85px]"
            >
              {g.degree}
            </text>
          ) : null}
        </g>
      ))}
    </g>
  );
}

function ChartLegend({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-muted-foreground mt-3 max-w-sm text-center text-[10px] leading-relaxed sm:text-[11px]",
        className,
      )}
    >
      Whole-sign houses from Asc · Su Mo Ma Me Ju Ve Sa Ra Ke · ↑ Ucch · ↓ Neech · ◉ Own · ℞ Retro
    </p>
  );
}

export function NorthIndianKundli({
  chart,
  className,
}: {
  chart: NorthChartData;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox="0 0 100 100"
        className="h-72 w-72 sm:h-[24rem] sm:w-[24rem]"
        role="img"
        aria-label="North Indian kundli chart"
      >
        <DiamondFrame />
        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
          const pos = NORTH_POS[house]!;
          const glyphs = normalizeGlyphs(chart.houses[String(house)]);
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
                {house}
              </text>
              {house === 1 ? (
                <text
                  x={pos.x}
                  y={pos.y - (glyphs.length ? 6 : 1.5)}
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
              />
            </g>
          );
        })}
      </svg>
      <ChartLegend />
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
  const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
  const bySign = new Map(chart.signs.map((s) => [s.signId, s]));

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="border-gold bg-gold/25 grid h-72 w-72 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border-2 sm:h-[24rem] sm:w-[24rem]"
        role="img"
        aria-label="South Indian kundli chart"
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
                    <div key={g.planet} className="leading-none">
                      <span
                        className={cn(
                          "text-[9px] font-bold sm:text-[10px]",
                          g.mark === "↑"
                            ? "text-primary"
                            : g.mark === "↓"
                              ? "text-destructive"
                              : "text-foreground",
                        )}
                      >
                        {g.label}
                      </span>
                      {g.degree ? (
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
      <ChartLegend />
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
  // Prefer sign-based East data; if only north houses exist (legacy), fall back
  if (isSouthChart(chart)) {
    const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
    const bySign = new Map(chart.signs.map((s) => [s.signId, s]));

    return (
      <div className={cn("flex flex-col items-center", className)}>
        <svg
          viewBox="0 0 100 100"
          className="h-72 w-72 sm:h-[24rem] sm:w-[24rem]"
          role="img"
          aria-label="East Indian kundli chart"
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
                    y={pos.y - (glyphs.length ? 6 : 1.5)}
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
                />
              </g>
            );
          })}
        </svg>
        <ChartLegend />
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
