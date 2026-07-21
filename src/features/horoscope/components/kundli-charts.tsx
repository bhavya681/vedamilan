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

/** North Indian diamond — house 1 (lagna) always at top; numbers = houses. */
const NORTH_POS: Record<number, { x: number; y: number; numX: number; numY: number }> = {
  1: { x: 50, y: 20, numX: 50, numY: 10 },
  2: { x: 76, y: 20, numX: 88, numY: 10 },
  3: { x: 82, y: 50, numX: 92, numY: 50 },
  4: { x: 76, y: 78, numX: 88, numY: 92 },
  5: { x: 50, y: 82, numX: 50, numY: 94 },
  6: { x: 24, y: 78, numX: 12, numY: 92 },
  7: { x: 18, y: 50, numX: 8, numY: 50 },
  8: { x: 24, y: 20, numX: 12, numY: 10 },
  9: { x: 35, y: 50, numX: 30, numY: 42 },
  10: { x: 50, y: 38, numX: 50, numY: 32 },
  11: { x: 65, y: 50, numX: 70, numY: 42 },
  12: { x: 50, y: 62, numX: 50, numY: 70 },
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

function DiamondFrame({ className }: { className?: string }) {
  return (
    <g className={className}>
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
        "text-muted-foreground mt-3 text-center text-[10px] leading-relaxed sm:text-[11px]",
        className,
      )}
    >
      House nos · Su Mo Ma Me Ju Ve Sa Ra Ke · ↑ Ucch · ↓ Neech · ◉ Own · ℞ Retro
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
                  "text-[3.4px] font-bold",
                  house === 1 ? "fill-primary" : "fill-muted-foreground",
                )}
              >
                {house}
              </text>
              {house === 1 ? (
                <text
                  x={pos.x}
                  y={pos.y - (glyphs.length ? 5.5 : 1)}
                  textAnchor="middle"
                  className="fill-primary text-[2.6px] font-semibold"
                >
                  {chart.lagnaLabel || "Asc"}
                </text>
              ) : null}
              <HousePlanets
                x={pos.x}
                y={pos.y + (house === 1 ? 1.5 : 0)}
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
          if (signId === null) {
            return <div key={index} className="bg-muted/40" />;
          }
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

/** East Indian diamond — house numbers from Lagna (same house-fixed logic as North). */
export function EastIndianKundli({
  chart,
  className,
}: {
  chart: NorthChartData | SouthChartData;
  className?: string;
}) {
  // Prefer house-based (new East = North layout); fall back if old sign-based chart
  if (isNorthChart(chart)) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <svg
          viewBox="0 0 100 100"
          className="h-72 w-72 sm:h-[24rem] sm:w-[24rem]"
          role="img"
          aria-label="East Indian kundli chart"
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
                    "text-[3.4px] font-bold",
                    house === 1 ? "fill-primary" : "fill-muted-foreground",
                  )}
                >
                  {house}
                </text>
                {house === 1 ? (
                  <text
                    x={pos.x}
                    y={pos.y - (glyphs.length ? 5.5 : 1)}
                    textAnchor="middle"
                    className="fill-primary text-[2.6px] font-semibold"
                  >
                    {chart.lagnaLabel || "Asc"}
                  </text>
                ) : null}
                <HousePlanets
                  x={pos.x}
                  y={pos.y + (house === 1 ? 1.5 : 0)}
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

  // Legacy east (sign-fixed) — show house number derived from lagna
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
          const house = ((signId - lagna + 12) % 12) + 1;
          const pos = NORTH_POS[house]!;
          const glyphs = normalizeGlyphs(bySign.get(signId)?.planets);
          return (
            <g key={signId}>
              <text
                x={pos.numX}
                y={pos.numY}
                textAnchor="middle"
                className={cn(
                  "text-[3.4px] font-bold",
                  house === 1 ? "fill-primary" : "fill-muted-foreground",
                )}
              >
                {house}
              </text>
              <HousePlanets x={pos.x} y={pos.y} glyphs={glyphs} highlight={house === 1} />
            </g>
          );
        })}
      </svg>
      <ChartLegend />
    </div>
  );
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

/** East charts are now house-based (north-shaped) or legacy south-shaped. */
export function isEastChart(value: unknown): value is NorthChartData | SouthChartData {
  return isNorthChart(value) || isSouthChart(value);
}
